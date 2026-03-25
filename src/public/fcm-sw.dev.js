importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyDkPwfV2i-7RQcWaJEtf_pUh8haYWxa4k0",
  authDomain: "jalan-kerja-dev.firebaseapp.com",
  projectId: "jalan-kerja-dev",
  storageBucket: "jalan-kerja-dev.firebasestorage.app",
  messagingSenderId: "52014148654",
  appId: "1:52014148654:web:f1bb0bbaa8b1abe3ee43bf",
  measurementId: "G-26BLZM35CF",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title || "New Message";
  const notificationOptions = {
    body: payload.notification.body || "You have a new message",
    icon:
      payload.notification.icon ||
      "https://via.placeholder.com/64x64.png?text=FCM",
    badge: "https://via.placeholder.com/24x24.png?text=!",
    data: payload.data,
    requireInteraction: true,
    actions: [
      {
        action: "open",
        title: "Open App",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow("/"));
  } else if (event.action === "close") {
    return;
  } else {
    event.waitUntil(clients.openWindow("/"));
  }
});

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
