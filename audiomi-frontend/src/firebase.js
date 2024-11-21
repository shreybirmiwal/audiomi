// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCXyTs0fxt-hdoPuEGhMgjcCi0qmOzuOas",
    authDomain: "audiomi.firebaseapp.com",
    projectId: "audiomi",
    storageBucket: "audiomi.firebasestorage.app",
    messagingSenderId: "21238960626",
    appId: "1:21238960626:web:69261500c1d305ac765b6b"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);