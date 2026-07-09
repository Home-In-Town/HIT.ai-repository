importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.11.1/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCxCJC4cUJBpyiq4Obi8bWU75wEyfGwBNE",
  authDomain: "homeintown-414f2.firebaseapp.com",
  projectId: "homeintown-414f2",
  storageBucket: "homeintown-414f2.firebasestorage.app",
  messagingSenderId: "605606959327",
  appId: "1:605606959327:web:94523e76b01f0d5f6bb16a",
  measurementId: "G-Y4L7HN2Y08"
});

firebase.messaging();
