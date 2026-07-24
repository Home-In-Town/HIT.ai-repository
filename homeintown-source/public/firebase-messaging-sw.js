// Firebase Cloud Messaging Service Worker
// NOTE: Environment variables cannot be used in service workers.
// These values are injected at build time via the Next.js public folder.
// For production, consider using a build script to inject env vars here.

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

// These values must match your .env.local configuration
// In a CI/CD pipeline, replace these placeholders with actual values at build time
firebase.initializeApp({
  apiKey: "AIzaSyCxCJC4cUJBpyiq4Obi8bWU75wEyfGwBNE",
  authDomain: "homeintown-414f2.firebaseapp.com",
  projectId: "homeintown-414f2",
  storageBucket: "homeintown-414f2.firebasestorage.app",
  messagingSenderId: "605606959327",
  appId: "1:605606959327:web:94523e76b01f0d5f6bb16a",
  measurementId: "G-Y4L7HN2Y08",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload);
  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icon.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});
