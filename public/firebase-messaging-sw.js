// Import the functions you need from the SDKs you need
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvag-VHRFU5izt_i-MctGH-6jKCkRLa-8",
  authDomain: "guru-mgl.firebaseapp.com",
  databaseURL: "https://guru-mgl-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "guru-mgl",
  storageBucket: "guru-mgl.appspot.com",
  messagingSenderId: "364857935332",
  appId: "1:364857935332:web:b5a5c012717b171e5073f1",
  measurementId: "G-8DKQE1NBPW"
};

// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './logo.png',
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});