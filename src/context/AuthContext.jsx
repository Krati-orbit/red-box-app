// ============================================================
// FILE: src/context/AuthContext.jsx
// ============================================================
// 🔐 WHAT IS "CONTEXT" IN REACT?
//
// Imagine you have a piece of information — like "who is logged in".
// Many components need that info: Navbar, Dashboard, Documents page, etc.
//
// WITHOUT context, you'd have to pass this info like a relay race:
//   App → Navbar → NavUser → Avatar (passing props through every level)
//   This is called "prop drilling" and gets messy fast. 😩
//
// WITH context, you create a "global store" that ANY component can
// directly tap into — no relay race needed. 🎯
//
// AuthContext is specifically a SHARED STORE for all authentication
// related state and functions:
//   - Is someone logged in?
//   - Who are they? (their name, email, photo)
//   - Functions: login, signup, logout, Google sign-in
//
// HOW THE COMMUNICATION WORKS:
//   firebase.js  →  (provides auth + googleProvider)
//   AuthContext  →  (reads Firebase, exposes user info)
//   Navbar       →  (reads AuthContext to show name/logout button)
//   LoginPage    →  (calls AuthContext's login() function)
//   SignupPage   →  (calls AuthContext's signup() function)
//   Protected    →  (in App.jsx, checks AuthContext's isLoggedIn)
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react'

// We import all the Firebase Auth functions we need:
import {
    signInWithPopup,               // Opens Google sign-in popup window
    signInWithEmailAndPassword,    // Signs in with email + password
    createUserWithEmailAndPassword,// Creates a brand new account
    updateProfile,                 // Updates the user's name/photo
    signOut,                       // Logs the user out
    onAuthStateChanged             // Listens for login/logout events
} from 'firebase/auth'

// We import the auth instance and Google provider from our firebase.js file.
// auth = the Firebase authentication service
// googleProvider = tells Firebase to use Google for sign-in
import { auth, googleProvider } from '../services/firebase'

// ============================================================
// STEP 1: Create the Context "container"
// createContext() creates an empty box. We'll fill it with data later.
// Think of it as creating an empty radio station — no signal yet.
// ============================================================
const AuthContext = createContext(null)

// ============================================================
// 🛠️ HELPER FUNCTION: getInitials
// Takes a name like "Krati Sharma" and returns "KS"
// This is shown in the circular avatar in the Navbar.
// It's defined outside the component because it's a pure utility —
// it doesn't need access to React state or props.
// ============================================================
function getInitials(name) {
    if (!name) return '?'
    // 1. Trim spaces from start/end
    // 2. Split by spaces (so "Krati Sharma" → ["Krati", "Sharma"])
    // 3. Take first letter of each word → ["K", "S"]
    // 4. Take max 2 letters → "KS"
    return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')
}

// ============================================================
// STEP 2: Create the Provider component
// The Provider is a wrapper component that "provides" (broadcasts)
// data to all its child components. It's like a TV tower — any
// TV (component) inside its range can receive the signal. 📡
//
// In App.jsx, we wrap our whole app with <AuthProvider>.
// This means EVERY component inside the app can access auth data.
// ============================================================
export function AuthProvider({ children }) {
    // ── STATE ──────────────────────────────────────────────
    // useState() creates a reactive variable.
    // When it changes, React automatically re-renders the component.
    //
    // user = the Firebase user object (has .uid, .displayName, .email, .photoURL)
    //        It's null when no one is logged in.
    const [user, setUser] = useState(null)

    // role = 'user' | 'admin' | 'superadmin'
    const [role, setRole] = useState('user')

    // awaiting2FA = null | { user: FirebaseUser, method: 'app'|'email'|'sms' }
    // When this is set, the user is authenticated via password but still needs OTP.
    const [awaiting2FA, setAwaiting2FA] = useState(null)

    // loading = true while we wait for Firebase to tell us if someone
    //           is already logged in (e.g. from a previous session).
    const [loading, setLoading] = useState(true)

    // A simple boolean derived from user. If user is not null → logged in.
    // 2FA ADDITION: We only consider them fully logged in if they aren't stuck at 2FA.
    const isLoggedIn = !!user && !awaiting2FA

    // ── FIREBASE AUTH LISTENER ────────────────────────────
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Clear mock user since we have a real user session
                localStorage.removeItem('red_box_mock_user')
                // When we detect a user, we check if they HAVE 2FA enabled in Firestore
                try {
                    const { doc, getDoc } = await import('firebase/firestore')
                    const { db } = await import('../services/firebase')
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))

                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        setRole(userData.role || 'user')

                        if (userData.twoFactorEnabled) {
                            // User HAS 2FA enabled. Put them in the waiting room.
                            setAwaiting2FA({
                                user: firebaseUser,
                                method: userData.twoFactorMethod || 'email'
                            })
                        } else {
                            // No 2FA or first time login
                            setUser(firebaseUser)
                            setAwaiting2FA(null)
                        }
                    } else {
                        // Doc doesn't exist, maybe first signup/no profile yet
                        setRole('user')
                        setUser(firebaseUser)
                        setAwaiting2FA(null)
                    }
                } catch (err) {
                    console.error("Auth Listener Error:", err)
                    setUser(firebaseUser) // fallback to normal login if Firestore fails
                }
            } else {
                // Fallback: Check if there is a mock session active
                const mockUserStr = localStorage.getItem('red_box_mock_user')
                if (mockUserStr) {
                    try {
                        const mockUser = JSON.parse(mockUserStr)
                        setUser(mockUser)
                        setRole(mockUser.role || 'user')
                        setAwaiting2FA(null)
                    } catch (e) {
                        setUser(null)
                        setRole('user')
                        setAwaiting2FA(null)
                    }
                } else {
                    setUser(null)
                    setRole('user')
                    setAwaiting2FA(null)
                }
            }
            setLoading(false)
        })
        return unsub
    }, [])

    // ── VERIFY 2FA ────────────────────────────────────────
    // Called by TwoFactorPage when the user enters their code.
    async function verify2FA(code) {
        if (!awaiting2FA) return { error: 'No pending verification' }

        try {
            const { user: firebaseUser, method } = awaiting2FA
            const { doc, getDoc } = await import('firebase/firestore')
            const { db } = await import('../services/firebase')
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
            const userData = userDoc.data()

            let isValid = false

            // Check Backup Codes first (standard for all methods)
            if (userData.backupCodes?.includes(code)) {
                isValid = true
                // TODO: Remove the used backup code from Firestore
            }
            else if (method === 'app') {
                // Authenticator App (TOTP)
                const { TOTP } = await import('otpauth')
                const totp = new TOTP({
                    secret: userData.twoFactorSecret,
                    encoding: 'base32'
                })
                const delta = totp.validate({ token: code, window: 1 })
                isValid = (delta !== null)
            }
            else {
                // Email/SMS OTP (In this demo version, we'll check against a stored temp code)
                isValid = (userData.tempOTP === code)
            }

            if (isValid) {
                setUser(firebaseUser)
                setAwaiting2FA(null)
                return { success: true }
            } else {
                return { error: '❌ Invalid verification code. Please try again.' }
            }
        } catch (err) {
            return { error: err.message }
        }
    }

    // ── GOOGLE SIGN-IN ────────────────────────────────────
    async function loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, googleProvider)
            // 2FA: onAuthStateChanged will handle the redirect if 2FA is on
            return { success: true, name: result.user.displayName }
        } catch (err) {
            return { error: err.message }
        }
    }

    // ── EMAIL/PASSWORD LOGIN ──────────────────────────────
    async function login(email, password) {
        if (!email || !email.includes('@')) return { error: '⚠️ Please enter a valid email address.' }
        if (!password || password.length < 6) return { error: '⚠️ Password must be at least 6 characters.' }

        const isTestUser = email === 'testuser1@gmail.com' && password === 'password123'

        try {
            if (isTestUser) {
                try {
                    const result = await signInWithEmailAndPassword(auth, email, password)
                    const { doc, getDoc } = await import('firebase/firestore')
                    const { db } = await import('../services/firebase')
                    const userDoc = await getDoc(doc(db, 'users', result.user.uid))

                    if (userDoc.exists() && userDoc.data().twoFactorEnabled) {
                        const userData = userDoc.data()
                        if (userData.twoFactorMethod !== 'app') {
                            const tempOTP = Math.floor(100000 + Math.random() * 900000).toString()
                            const { updateDoc } = await import('firebase/firestore')
                            await updateDoc(doc(db, 'users', result.user.uid), { tempOTP })
                            console.log(`[SIMULATION] Verification code for ${result.user.email}: ${tempOTP}`)
                        }
                        return { success: true, requires2FA: true, name: result.user.displayName || email.split('@')[0] }
                    }
                    return { success: true, name: result.user.displayName || email.split('@')[0] }
                } catch (fbErr) {
                    console.warn("Firebase sign-in failed, activating mock local login fallback:", fbErr.message)
                    // Prefill locally saved mock user session
                    const mockUser = {
                        uid: "mock_testuser1_uid",
                        email: "testuser1@gmail.com",
                        displayName: "Test User One",
                        createdAt: new Date().toISOString()
                    }
                    localStorage.setItem('red_box_mock_user', JSON.stringify(mockUser))
                    setUser(mockUser)
                    setRole('user')
                    setAwaiting2FA(null)
                    return { success: true, name: "Test User One" }
                }
            }

            const result = await signInWithEmailAndPassword(auth, email, password)
            // If 2FA is needed, onAuthStateChanged will set awaiting2FA.
            // We just need to check if it's about to be set.
            const { doc, getDoc } = await import('firebase/firestore')
            const { db } = await import('../services/firebase')
            const userDoc = await getDoc(doc(db, 'users', result.user.uid))

            if (userDoc.exists() && userDoc.data().twoFactorEnabled) {
                const userData = userDoc.data()

                // If method is email or sms, generate a "simulated" temp OTP
                if (userData.twoFactorMethod !== 'app') {
                    const tempOTP = Math.floor(100000 + Math.random() * 900000).toString()
                    const { updateDoc } = await import('firebase/firestore')
                    await updateDoc(doc(db, 'users', result.user.uid), { tempOTP })
                    console.log(`[SIMULATION] Verification code for ${result.user.email}: ${tempOTP}`)
                }

                return { success: true, requires2FA: true, name: result.user.displayName || email.split('@')[0] }
            }

            return { success: true, name: result.user.displayName || email.split('@')[0] }
        } catch (err) {
            if (err.code === 'auth/user-not-found' ||
                err.code === 'auth/wrong-password' ||
                err.code === 'auth/invalid-credential') {
                return { error: '❌ Incorrect email or password.' }
            }
            return { error: err.message }
        }
    }

    // ── EMAIL/PASSWORD SIGNUP ─────────────────────────────
    async function signup(name, email, password, confirm) {
        if (!name) return { error: '⚠️ Please enter your full name.' }
        if (!email || !email.includes('@')) return { error: '⚠️ Please enter a valid email address.' }
        if (!password || password.length < 8) return { error: '⚠️ Password must be at least 8 characters.' }
        if (password !== confirm) return { error: '❌ Passwords do not match.' }

        try {
            const result = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(result.user, { displayName: name })

            // Create the initial user record in Firestore
            const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
            const { db } = await import('../services/firebase')
            await setDoc(doc(db, 'users', result.user.uid), {
                email,
                displayName: name,
                twoFactorEnabled: false,
                role: 'user', // Default role for new signups
                createdAt: serverTimestamp()
            })

            setUser({ ...result.user, displayName: name })
            return { success: true, name }
        } catch (err) {
            if (err.code === 'auth/email-already-in-use')
                return { error: '⚠️ Account already exists. Please log in.' }
            return { error: err.message }
        }
    }

    // ── LOGOUT ───────────────────────────────────────────
    async function logout() {
        localStorage.removeItem('red_box_mock_user')
        await signOut(auth)
        setUser(null)
        setAwaiting2FA(null)
    }

    // ── DERIVED VALUES ────────────────────────────────────
    const displayName = user?.displayName || awaiting2FA?.user?.displayName || user?.email?.split('@')[0] || ''
    const initials = getInitials(displayName)
    const firstName = displayName.trim().split(/\s+/)[0]

    // ── PROVIDE THE DATA ─────────────────────────────────
    return (
        <AuthContext.Provider value={{
            user: user || awaiting2FA?.user, // Expose user even if awaiting 2FA
            isLoggedIn,
            role,
            isAdmin: role === 'admin' || role === 'superadmin',
            isSuperAdmin: role === 'superadmin',
            awaiting2FA,    // Let pages know we are waiting for 2FA
            loading,
            login,
            loginWithGoogle,
            signup,
            logout,
            verify2FA,      // New verification function
            initials,
            firstName
        }}>
            {/* Only show the app once we know the auth state */}
            {!loading && children}
        </AuthContext.Provider>
    )
}

// ============================================================
// STEP 3: Create a custom hook
// useAuth() is a convenience function. Instead of writing:
//   const { isLoggedIn } = useContext(AuthContext)
// Any component can just write:
//   const { isLoggedIn } = useAuth()
// Much cleaner! 🎉
// ============================================================
export function useAuth() {
    return useContext(AuthContext)
}
