const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const Y = require("yjs");
require("dotenv").config();

const docs = new Map();
const docStates = new Map(); // Track document states
const pendingUpdates = new Map(); // Buffer updates

console.log("Starting server on mode: ", process.env.NODE_ENV);
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

// Debounce function to batch updates
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: { origin: "*" },
    transports: ["websocket", "polling"],
    // Increase ping timeout to handle slow connections
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("join-doc", (docName) => {
      // console.log(`📝 Client ${socket.id} joining doc: ${docName}`);
      socket.join(docName);

      // Create document if it doesn't exist
      if (!docs.has(docName)) {
        const ydoc = new Y.Doc();
        docs.set(docName, ydoc);
        docStates.set(docName, Y.encodeStateAsUpdate(ydoc));

        // console.log(`🆕 Created new document: ${docName}`);
      }

      const ydoc = docs.get(docName);

      // Send complete document state to joining client
      const currentState = Y.encodeStateAsUpdate(ydoc);
      socket.emit("sync", Array.from(currentState));

      // Send awareness info about other connected clients
      const room = io.sockets.adapter.rooms.get(docName);
      const clientCount = room ? room.size : 1;

      socket.emit("clients-info", {
        clientCount,
        connectedClients: room ? Array.from(room) : [socket.id],
      });

      // Broadcast to other clients in the room that someone joined
      socket.to(docName).emit("client-joined", {
        clientId: socket.id,
        clientCount: clientCount,
      });
    });

    // Handle document updates with error handling and validation
    socket.on("update", (updateArray, callback) => {
      try {
        if (!Array.isArray(updateArray)) {
          console.error(`❌ Invalid update format from ${socket.id}`);
          if (callback)
            callback({ success: false, error: "Invalid update format" });
          return;
        }

        const update = new Uint8Array(updateArray);
        const rooms = Array.from(socket.rooms).filter(
          (room) => room !== socket.id
        );

        if (rooms.length === 0) {
          console.error(`❌ Client ${socket.id} not in any document room`);
          if (callback)
            callback({ success: false, error: "Not in any document room" });
          return;
        }

        rooms.forEach((docName) => {
          if (!docs.has(docName)) {
            console.error(`❌ Document ${docName} not found`);
            return;
          }

          const ydoc = docs.get(docName);

          // Validate update before applying
          try {
            // Create a temporary doc to test the update
            const tempDoc = new Y.Doc();
            const currentState = Y.encodeStateAsUpdate(ydoc);
            Y.applyUpdate(tempDoc, currentState);
            Y.applyUpdate(tempDoc, update);

            // If validation passes, apply to real document
            Y.applyUpdate(ydoc, update);

            // Update stored state
            docStates.set(docName, Y.encodeStateAsUpdate(ydoc));

            // Broadcast to other clients in the room
            socket.to(docName).emit("update", Array.from(update));

            // Send acknowledgment
            if (callback) callback({ success: true });
          } catch (validationError) {
            console.error(
              `❌ Update validation failed for ${docName}:`,
              validationError.message
            );

            // Send full sync to fix inconsistency
            const currentState = Y.encodeStateAsUpdate(ydoc);
            socket.emit("force-sync", Array.from(currentState));

            if (callback)
              callback({
                success: false,
                error: "Update validation failed, forcing resync",
              });
          }
        });
      } catch (error) {
        console.error(`❌ Error processing update from ${socket.id}:`, error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Handle client requesting full sync (for recovery)
    socket.on("request-sync", (docName) => {
      if (!docs.has(docName)) {
        socket.emit("sync-error", { message: "Document not found" });
        return;
      }

      const ydoc = docs.get(docName);
      const currentState = Y.encodeStateAsUpdate(ydoc);
      socket.emit("sync", Array.from(currentState));
    });

    // Handle awareness updates (cursors, selections, etc.)
    socket.on("awareness-update", (awarenessUpdate) => {
      const rooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id
      );

      rooms.forEach((docName) => {
        // Broadcast awareness update to all other clients in the room
        socket.to(docName).emit("awareness-update", {
          clientId: socket.id,
          user: awarenessUpdate.user,
          cursor: awarenessUpdate.cursor,
          selection: awarenessUpdate.selection,
          timestamp: Date.now(),
        });

        console.log(`👁️ Awareness update from ${socket.id} in ${docName}:`, {
          hasUser: !!awarenessUpdate.user,
          hasCursor: !!awarenessUpdate.cursor,
          hasSelection: !!awarenessUpdate.selection,
        });
      });
    });

    // Handle user info updates (name, color changes)
    socket.on("user-update", (userInfo) => {
      const rooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id
      );

      rooms.forEach((docName) => {
        socket.to(docName).emit("user-update", {
          clientId: socket.id,
          user: userInfo,
          timestamp: Date.now(),
        });
      });
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);

      // Notify other clients about disconnection
      const rooms = Array.from(socket.rooms).filter(
        (room) => room !== socket.id
      );
      rooms.forEach((docName) => {
        const room = io.sockets.adapter.rooms.get(docName);
        const clientCount = room ? room.size : 0;

        socket.to(docName).emit("client-left", {
          clientId: socket.id,
          clientCount: clientCount,
        });
      });
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`🚀 Server ready on http://localhost:${port}`);
    console.log(`📡 Socket.IO server ready for collaborative editing`);
  });

  setInterval(() => {
    const docCount = docs.size;
    const totalConnections = io.sockets.sockets.size;

    console.log(
      `📊 Health check: ${docCount} documents, ${totalConnections} connections`
    );

    docs.forEach((ydoc, docName) => {
      const room = io.sockets.adapter.rooms.get(docName);
      if (!room || room.size === 0) {
        // Optional: Remove empty documents after some time
        // docs.delete(docName);
        // docStates.delete(docName);
        // console.log(`🗑️ Cleaned up empty document: ${docName}`);
      }
    });
  }, 60000); // Every minute
});
