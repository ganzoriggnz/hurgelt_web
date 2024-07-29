// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBz_3ThpHDGzgP16vx4kUYkWiqlRTVK_nk",
  authDomain: "guru-mgl.firebaseapp.com",
  databaseURL:
    "https://guru-mgl-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "guru-mgl",
  storageBucket: "guru-mgl.appspot.com",
  messagingSenderId: "364857935332",
  appId: "1:364857935332:web:b5a5c012717b171e5073f1",
  measurementId: "G-8DKQE1NBPW",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
export default firebaseApp;

export const VAPID_KEY =
  "BODNDYYxRdtoSxO-9Z-2LLvvdWIWzxFjFHp6cboE0m_jvwpUbTtDKsuUPGBi382dpMhredYxlZfz9GWbDYJDv7U";
export const FIREBASE_SERVER_KEY =
  "AAAAVPM6ReQ:APA91bGuW3wRa32VtAEuLUM-FqxaJuDXEykWdN4UuHFQBB7IibpuTayUbzDp-NFjK5vxn8r546-uEvnrbA-mZKdioZOWecOHJjRKPj2v1j0mlzbQrcWpj34W1uYceYnSovk8HBJ_QQi5";
