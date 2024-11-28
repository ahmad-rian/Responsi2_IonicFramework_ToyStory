// src/utils/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCPZ6Lk0kn7gzOtC1dbcVyWYR9LdzE3YQ0",
  authDomain: "vue-firebase-8b3cc.firebaseapp.com",
  projectId: "vue-firebase-8b3cc",
  storageBucket: "vue-firebase-8b3cc.firebasestorage.app",
  messagingSenderId: "945078190359",
  appId: "1:945078190359:web:8278a4f8d201a61935b752",
  measurementId: "G-2MFRFJ5KQ1"
};

const firebase = initializeApp(firebaseConfig);
const auth = getAuth(firebase);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(firebase);

export { auth, googleProvider,db };
