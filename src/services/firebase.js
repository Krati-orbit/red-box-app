// ============================================================
// FILE: src/services/firebase.js
// ============================================================
// 🔥 FIREBASE — Our Backend-as-a-Service
//
// Instead of building our own server, we use Firebase (made by Google).
// Firebase gives us THREE things we use:
//
//   1. Authentication (auth)  → Who is the user? Are they logged in?
//   2. Google Sign-In         → Let users log in with their Google account
//   3. Firestore (db)         → A cloud database to store user data
//
// HOW THIS FILE IS USED:
//   Other files import { auth, googleProvider, db } from this file.
//   They never talk to Firebase directly — they always go through here.
//   This is called the "service layer" pattern — a single place for
//   all Firebase communication. 🏗️
// ============================================================

// 'firebase/app' is the core Firebase package. initializeApp() connects
// our app to our specific Firebase project using the config keys below.
import { initializeApp } from "firebase/app"

// getAuth()         → gives us the Authentication service
// GoogleAuthProvider → tells Firebase "I want to use Google for login"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// getFirestore() → gives us the Firestore cloud database service
import { getFirestore } from "firebase/firestore"

// getStorage() → gives us the Firebase Cloud Storage service
import { getStorage } from "firebase/storage"

// ============================================================
// 🔑 FIREBASE CONFIG
// These are like the "address + password" of our Firebase project.
// Firebase uses these to know WHICH project to connect to.
// It's safe to have these in frontend code — real security comes
// from Firestore Security Rules on the Firebase console.
// ============================================================
const firebaseConfig = {
    apiKey: "AIzaSyA74aMfRc0Q6gnB3BnTio75UDKagco5r8c",    // identifies your app
    authDomain: "red-boxx.firebaseapp.com",                // where login happens
    projectId: "red-boxx",                                 // your project name
    storageBucket: "red-boxx.firebasestorage.app",         // for file storage
    messagingSenderId: "789909330489",                      // for notifications
    appId: "1:789909330489:web:c470573c54154a68a28be8",    // unique app ID
    measurementId: "G-2H7RQM2XWL"                          // for analytics
}

// Initialize (start up) our Firebase app with the config above.
// Think of this like "logging in" to our Firebase project.
const app = initializeApp(firebaseConfig)

// ============================================================
// EXPORTS — We export 3 things so other files can import them:
// ============================================================

// 'auth' = the Authentication service instance.
// AuthContext.jsx will use this to sign in / sign out users.
export const auth = getAuth(app)

// 'googleProvider' = tells Firebase we want Google Sign-In.
// When user clicks "Sign in with Google", we pass this to Firebase.
export const googleProvider = new GoogleAuthProvider()

// 'db' = the Firestore database instance.
// DataContext.jsx will use this to read/write user data (docs, beneficiaries).
export const db = getFirestore(app)

// 'storage' = the Firebase Cloud Storage instance.
// Used for uploading files (e.g. death certificates, ID proofs).
export const storage = getStorage(app)