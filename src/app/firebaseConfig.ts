// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFgmHI9_fynVf4XHkt4Ww7Vp4RpP9cJHY",
  authDomain: "team-phoenix-b8300.firebaseapp.com",
  projectId: "team-phoenix-b8300",
  storageBucket: "team-phoenix-b8300.firebasestorage.app",
  messagingSenderId: "950070671935",
  appId: "1:950070671935:web:6541a32abefef2f4e5d68a",
  measurementId: "G-SPGT4VETDP"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);