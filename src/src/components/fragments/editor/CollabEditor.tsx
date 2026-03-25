"use client";

import { useState, useEffect, useMemo } from "react";
import Cookies from "js-cookie";
import EditorCore from "./core/EditorCore";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import io, { Socket } from "socket.io-client";

interface EditorProps {
  useCollab?: boolean;
}

export default function Editor({ useCollab = false }: EditorProps) {
  const data = Cookies.get("user");
  const [user, setUser] = useState(data ? JSON.parse(data) : null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [status, setStatus] = useState<string>("disconnected");

  // Create documents
  const documents = useMemo(() => {
    const doc = new Y.Doc();
    const awareness = new Awareness(doc);

    if (user) {
      awareness.setLocalStateField("user", {
        name: user.name || "Anonymous",
        color: user.color || "#ff6b6b",
        id: user.id || Math.random().toString(36).substr(2, 9),
      });
    }

    return { doc, awareness };
  }, [user?.id, user?.name, user?.color]);

  // Socket.IO connection for collaboration
  useEffect(() => {
    if (!useCollab) return;

    setStatus("connecting");
    const s = io({
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });
    setSocket(s);

    let isInitialSync = true;
    let updateQueue: Uint8Array[] = [];
    let isProcessingQueue = false;

    // Join collaborative document
    const roomId = "default-room";

    s.on("connect", () => {
      s.emit("join-doc", roomId);
      setStatus("syncing");
    });

    // Handle initial sync
    s.on("sync", (update) => {
      try {
        Y.applyUpdate(documents.doc, new Uint8Array(update));
        setStatus("connected");
        isInitialSync = false;

        // Process any queued updates after initial sync
        processUpdateQueue();
      } catch (error) {
        console.error("❌ Error applying sync update:", error);
        setStatus("error");
      }
    });

    // Handle force sync (for recovery)
    s.on("force-sync", (update) => {
      try {
        Y.applyUpdate(documents.doc, new Uint8Array(update));
        setStatus("connected");
      } catch (error) {
        console.error("❌ Error applying force sync:", error);
        requestSync();
      }
    });

    // Queue updates if still syncing, otherwise apply immediately
    const processUpdateQueue = () => {
      if (isProcessingQueue) return;
      isProcessingQueue = true;

      while (updateQueue.length > 0) {
        const update = updateQueue.shift();
        if (update) {
          try {
            Y.applyUpdate(documents.doc, update);
          } catch (error) {
            console.error("❌ Error processing queued update:", error);
          }
        }
      }
      isProcessingQueue = false;
    };

    // Handle updates from other clients
    s.on("update", (update) => {
      try {
        const updateArray = new Uint8Array(update);

        if (isInitialSync) {
          // Queue updates during initial sync
          updateQueue.push(updateArray);
        } else {
          // Apply immediately
          Y.applyUpdate(documents.doc, updateArray);
        }
      } catch (error) {
        console.error("❌ Error applying update:", error);
        // Request fresh sync if update fails
        requestSync();
      }
    });

    // Send local updates to server with acknowledgment
    const handleDocUpdate = (update: Uint8Array, origin: any) => {
      // Don't send updates that came from the network
      if (origin === "network") return;

      if (s.connected && !isInitialSync) {
        s.emit("update", Array.from(update), (response: any) => {
          if (response && !response.success) {
            console.error("❌ Server rejected update:", response.error);
            if (response.error.includes("validation failed")) {
              // Server will send force-sync
            }
          }
        });
      }
    };

    documents.doc.on("update", handleDocUpdate);

    // Handle awareness updates
    const handleAwarenessUpdate = ({ added, updated, removed }: any) => {
      if (s.connected) {
        s.emit("awareness-update", {
          added,
          updated,
          removed,
        });
      }
    };

    documents.awareness.on("update", handleAwarenessUpdate);

    s.on("awareness-update", ({ clientId, update }: any) => {
      // Apply awareness updates from other clients
      // This handles cursors, selections, etc.
    });

    // Handle connection events
    s.on("disconnect", (reason) => {
      setStatus("disconnected");
    });

    s.on("connect_error", (error) => {
      console.error("❌ Connection error:", error);
      setStatus("error");
    });

    s.on("clients-info", ({ clientCount }: any) => {
    });

    // Helper function to request sync
    const requestSync = () => {
      if (s.connected) {
        s.emit("request-sync", roomId);
      }
    };

    // Cleanup
    return () => {
      documents.doc.off("update", handleDocUpdate);
      documents.awareness.off("update", handleAwarenessUpdate);
      s.disconnect();
      setSocket(null);
      setStatus("disconnected");
    };
  }, [useCollab, documents.doc, documents.awareness]);

  // Cleanup documents when component unmounts
  useEffect(() => {
    return () => {
      if (documents.doc && !documents.doc.isDestroyed) {
        documents.doc.destroy();
      }
    };
  }, [documents.doc]);

  const handleEditorChange = (data: any) => {
  };

  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  const isConnected = socket?.connected || false;
  const isSynced = status === "connected";

  // if (!dictionary) return;
  return (
    <div className="relative">
      {/* Collaboration status indicator */}
      {useCollab && (
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${status === "connected"
              ? "bg-green-100 text-green-800 border border-green-200"
              : status === "connecting" || status === "syncing"
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : "bg-red-100 text-red-800 border border-red-200"
              }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${status === "connected"
                ? "bg-green-500"
                : status === "connecting" || status === "syncing"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
                }`}
            ></div>
            {status === "connected"
              ? "Online"
              : status === "connecting"
                ? "Connecting..."
                : status === "syncing"
                  ? "Syncing..."
                  : status === "error"
                    ? "Connection Error"
                    : "Offline"}
          </div>

          {/* Reconnect button for errors */}
          {status === "error" && (
            <button
              onClick={reconnect}
              className="mt-2 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reconnect
            </button>
          )}
        </div>
      )}

      <EditorCore
        ydoc={documents.doc}
        awareness={documents.awareness}
        provider={socket} // Pass socket as provider
        status={status}
        isConnected={isConnected}
        user={user}
        dictionary={{}} // Pass empty dictionary for now
        onChange={handleEditorChange}
        useCollab={useCollab}
      />
    </div>
  );
}
