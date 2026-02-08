// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX8Ob1Z12kNG8vqVca9Ja1FJjLWtMM6Ak",
  authDomain: "chore-quest-19da2.firebaseapp.com",
  projectId: "chore-quest-19da2",
  storageBucket: "chore-quest-19da2.firebasestorage.app",
  messagingSenderId: "192656625358",
  appId: "1:192656625358:web:48f9921afdc18059c78a9f",
  measurementId: "G-5G22TNVM9X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);