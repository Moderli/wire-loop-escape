// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAHUc7hyKZDuIDPPFKmA1MRGrBX5VaNxmM",
  authDomain: "cowency-f966d.firebaseapp.com",
  databaseURL: "https://cowency-f966d-default-rtdb.firebaseio.com",
  projectId: "cowency-f966d",
  storageBucket: "cowency-f966d.firebasestorage.app",
  messagingSenderId: "780277566477",
  appId: "1:780277566477:web:af49ff9874098617ef5944",
  measurementId: "G-GBDC2GNEDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);