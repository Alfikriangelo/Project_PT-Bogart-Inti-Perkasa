// FirebaseContext.js
import React, { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBF0gk7aXu5zHS7br7eC-buIrF_TEzdq_Q",
  authDomain: "sips-ad324.firebaseapp.com",
  databaseURL:
    "https://sips-ad324-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sips-ad324",
  storageBucket: "sips-ad324.appspot.com",
  messagingSenderId: "249287359473",
  appId: "1:249287359473:web:eadb4b2b52b55fee54e250",
  measurementId: "G-LFZMFD5206",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Create Firebase context
const FirebaseContext = createContext({
  database,
  db,
  auth,
  signInWithEmailAndPassword,
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider
      value={{ database, db, auth, signInWithEmailAndPassword }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};
