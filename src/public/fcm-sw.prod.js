importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyBiIpwcysQyHfnVGgsNHxrZD6YnS7Rs1y8",
  authDomain: "jalan-kerja-prod.firebaseapp.com",
  projectId: "jalan-kerja-prod",
  storageBucket: "jalan-kerja-prod.firebasestorage.app",
  messagingSenderId: "903917952518",
  appId: "1:903917952518:web:076f9672a6126561c22d87",
  measurementId: "G-KDBLLS5HJF",
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
