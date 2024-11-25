// FirebaseContext.js
import React, { createContext, useContext } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {};

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
