// firebase-messaging-sw.js
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBFXv5_cRlg6j6VxzM4rlJiDxNkgarAQFo",
  authDomain: "jalankerja-0001.firebaseapp.com",
  projectId: "jalankerja-0001",
  storageBucket: "jalankerja-0001.firebasestorage.app",
  messagingSenderId: "372411685643",
  appId: "1:372411685643:web:0a682fd45711f1fb92200e",
  measurementId: "G-JHLDQXTZGM",
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  console.log("[SW] Firebase initialized successfully");

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("[SW] Background message received:", payload);

    const notificationTitle = payload.notification?.title || "Jalan Kerja";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new notification",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: `notification-${Date.now()}`,
      data: {
        ...payload.data,
        url: "/",
        timestamp: Date.now(),
      },
      requireInteraction: true,
      silent: false,
    };

    console.log("[SW] Showing notification:", notificationTitle);

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });
} catch (error) {
  console.error("[SW] Firebase initialization failed:", error);
}

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification);

  event.notification.close();

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            console.log("[SW] Focusing existing window");
            return client.focus();
          }
        }

        // Open new window if app not open
        if (clients.openWindow) {
          console.log("[SW] Opening new window");
          return clients.openWindow("/");
        }
      })
  );
});

// Handle push events (fallback)
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received:", event);

  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.notification?.title || "Jalan Kerja";
    const options = {
      body: data.notification?.body || "You have a new notification",
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: `push-${Date.now()}`,
      data: data.data || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("[SW] Push event error:", error);
  }
});

// Install and activate events
self.addEventListener("install", (event) => {
  console.log("[SW] Installing");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating");
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches if any
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith("fcm-")) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});
