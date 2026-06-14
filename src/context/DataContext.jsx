// ============================================================
// FILE: src/context/DataContext.jsx
// ============================================================
// 💾 WHAT DOES THIS FILE DO?
//
// This is the "data store" for user content — specifically:
//   - Documents (files the user has uploaded/registered)
//   - Beneficiaries (trusted contacts who get access)
//
// Before Firebase, we stored this in localStorage (browser memory).
// NOW we store it in Firestore — a real cloud database — so data
// is saved permanently across devices and browser sessions. ☁️
//
// HOW FIRESTORE DATA IS ORGANIZED:
//   Firestore is like a folder system:
//
//   users/               ← collection (like a folder)
//     {userId}/          ← one document per user (their ID is the name)
//       documents/       ← sub-collection (like a subfolder)
//         {docId}: {...} ← each uploaded document
//       beneficiaries/   ← sub-collection
//         {benId}: {...} ← each beneficiary
//
// COMMUNICATION FLOW:
//   firebase.js  →  provides the 'db' Firestore instance
//   AuthContext  →  provides the 'user' so we know whose data to load
//   DataContext  →  reads/writes Firestore, shares data via context
//   DocumentsPage / UploadPage / BeneficiariesPage / AddBeneficiaryPage
//              →  call useData() to get/modify documents & beneficiaries
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react'

// Firestore functions we need — imported from the Firebase SDK:
import {
    collection,       // reference to a collection (folder) in Firestore
    onSnapshot,       // real-time listener — fires whenever data changes
    addDoc,           // add a new document to a collection
    deleteDoc,        // delete a specific document
    doc,              // reference to a SPECIFIC document by ID
    updateDoc,        // update fields on an existing document
    serverTimestamp,  // generates the current server time (not local device time)
    query,            // builds a query (like "get all, sorted by date")
    orderBy           // sort modifier for queries
} from 'firebase/firestore'

// 'db' is our Firestore database instance from firebase.js
import { db } from '../services/firebase'

// We need the logged-in user's ID (uid) so we know WHOSE data to load.
// Every user gets their own separate storage space in Firestore.
import { useAuth } from './AuthContext'

// Create the empty context container (the "radio station" with no signal yet)
const DataContext = createContext(null)

// ============================================================
// DataProvider — wraps the app and broadcasts data to all children
// ============================================================
export function DataProvider({ children }) {
    // Get the current logged-in user from AuthContext.
    // user?.uid = Firebase's unique ID for each user (e.g. "xK7mN2pQ...")
    const { user } = useAuth()
    const uid = user?.uid  // uid is undefined if no one is logged in

    // ── STATE ──────────────────────────────────────────────
    // docs = array of document objects from Firestore
    //        e.g. [{ id: "abc123", name: "Will.pdf", icon: "📄", ... }]
    const [docs, setDocs] = useState([])

    // bens = array of beneficiary objects from Firestore
    //        e.g. [{ id: "xyz789", name: "Mom", relation: "Mother", ... }]
    const [bens, setBens] = useState([])

    // ── REAL-TIME LISTENER: DOCUMENTS ────────────────────
    // useEffect runs once when component mounts, and again whenever 'uid' changes.
    // If the user logs out, uid becomes undefined → we clear the docs list.
    // If the user logs in, uid becomes their ID → we start listening to Firestore.
    useEffect(() => {
        // If no user is logged in, clear docs and stop.
        if (!uid) { setDocs([]); return }

        // If it is a mock user, read from localStorage and do NOT start Firestore listener
        if (uid.startsWith('mock_')) {
            const loadMockDocs = () => {
                const stored = localStorage.getItem(`red_box_docs_${uid}`)
                setDocs(stored ? JSON.parse(stored) : [])
            }
            loadMockDocs()
            // Add a window listener or just rely on state since add/delete are in this context
            window.addEventListener(`mock_docs_changed_${uid}`, loadMockDocs)
            return () => window.removeEventListener(`mock_docs_changed_${uid}`, loadMockDocs)
        }

        // Build a Firestore query:
        // "Give me all documents inside users/{uid}/documents,
        //  sorted by createdAt in descending order (newest first)"
        const q = query(
            collection(db, 'users', uid, 'documents'),
            orderBy('createdAt', 'desc')
        )

        // onSnapshot sets up a REAL-TIME listener.
        const unsub = onSnapshot(q, snap => {
            setDocs(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }, err => {
            console.error("Firestore docs listener error, using localStorage fallback:", err)
            const stored = localStorage.getItem(`red_box_docs_${uid}`)
            setDocs(stored ? JSON.parse(stored) : [])
        })

        // Return the unsubscribe function so the listener stops when the
        // component unmounts or the uid changes (prevents memory leaks)
        return unsub
    }, [uid]) // Re-run this effect whenever uid changes

    // ── REAL-TIME LISTENER: BENEFICIARIES ────────────────
    useEffect(() => {
        if (!uid) { setBens([]); return }

        if (uid.startsWith('mock_')) {
            const loadMockBens = () => {
                const stored = localStorage.getItem(`red_box_bens_${uid}`)
                setBens(stored ? JSON.parse(stored) : [])
            }
            loadMockBens()
            window.addEventListener(`mock_bens_changed_${uid}`, loadMockBens)
            return () => window.removeEventListener(`mock_bens_changed_${uid}`, loadMockBens)
        }

        const q = query(
            collection(db, 'users', uid, 'beneficiaries'),
            orderBy('createdAt', 'asc') // oldest added appears first
        )

        const unsub = onSnapshot(q, snap => {
            setBens(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        }, err => {
            console.error("Firestore bens listener error, using localStorage fallback:", err)
            const stored = localStorage.getItem(`red_box_bens_${uid}`)
            setBens(stored ? JSON.parse(stored) : [])
        })

        return unsub
    }, [uid])

    // ── ADD DOCUMENT ──────────────────────────────────────
    async function addDoc_(docData) {
        if (!uid) return // Safety check: don't write if no user is logged in

        if (uid.startsWith('mock_')) {
            const stored = localStorage.getItem(`red_box_docs_${uid}`)
            const currentDocs = stored ? JSON.parse(stored) : []
            const newDoc = {
                id: 'mock_doc_' + Math.random().toString(36).substr(2, 9),
                ...docData,
                createdAt: { toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000) }
            }
            const updatedDocs = [newDoc, ...currentDocs]
            localStorage.setItem(`red_box_docs_${uid}`, JSON.stringify(updatedDocs))
            window.dispatchEvent(new Event(`mock_docs_changed_${uid}`))
            return
        }

        await addDoc(collection(db, 'users', uid, 'documents'), {
            ...docData,              // spread all the document fields (name, icon, etc.)
            createdAt: serverTimestamp() // Firebase server records the exact time
        })
    }

    // ── DELETE DOCUMENT ───────────────────────────────────
    async function deleteDoc_(docId) {
        if (!uid) return

        if (uid.startsWith('mock_')) {
            const stored = localStorage.getItem(`red_box_docs_${uid}`)
            const currentDocs = stored ? JSON.parse(stored) : []
            const updatedDocs = currentDocs.filter(d => d.id !== docId)
            localStorage.setItem(`red_box_docs_${uid}`, JSON.stringify(updatedDocs))
            window.dispatchEvent(new Event(`mock_docs_changed_${uid}`))
            return
        }

        await deleteDoc(doc(db, 'users', uid, 'documents', docId))
    }

    // ── ADD BENEFICIARY ───────────────────────────────────
    async function addBen(ben) {
        if (!uid) return

        const initials = ben.name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')

        if (uid.startsWith('mock_')) {
            const stored = localStorage.getItem(`red_box_bens_${uid}`)
            const currentBens = stored ? JSON.parse(stored) : []
            const newBen = {
                id: 'mock_ben_' + Math.random().toString(36).substr(2, 9),
                ...ben,
                initials,
                createdAt: { toMillis: () => Date.now(), seconds: Math.floor(Date.now() / 1000) }
            }
            const updatedBens = [...currentBens, newBen]
            localStorage.setItem(`red_box_bens_${uid}`, JSON.stringify(updatedBens))
            window.dispatchEvent(new Event(`mock_bens_changed_${uid}`))
            return
        }

        await addDoc(collection(db, 'users', uid, 'beneficiaries'), {
            ...ben,         // name, email, phone, relation, etc.
            initials,       // the calculated initials
            createdAt: serverTimestamp()
        })
    }

    // ── DELETE BENEFICIARY ────────────────────────────────
    async function deleteBen(benId) {
        if (!uid) return

        if (uid.startsWith('mock_')) {
            const stored = localStorage.getItem(`red_box_bens_${uid}`)
            const currentBens = stored ? JSON.parse(stored) : []
            const updatedBens = currentBens.filter(b => b.id !== benId)
            localStorage.setItem(`red_box_bens_${uid}`, JSON.stringify(updatedBens))
            window.dispatchEvent(new Event(`mock_bens_changed_${uid}`))
            return
        }

        await deleteDoc(doc(db, 'users', uid, 'beneficiaries', benId))
    }

    // ── UPDATE BENEFICIARY ────────────────────────────────
    async function updateBen(benId, fields) {
        if (!uid) return

        if (uid.startsWith('mock_')) {
            const stored = localStorage.getItem(`red_box_bens_${uid}`)
            const currentBens = stored ? JSON.parse(stored) : []
            const updatedBens = currentBens.map(b => b.id === benId ? { ...b, ...fields, updatedAt: Date.now() } : b)
            localStorage.setItem(`red_box_bens_${uid}`, JSON.stringify(updatedBens))
            window.dispatchEvent(new Event(`mock_bens_changed_${uid}`))
            return
        }

        await updateDoc(doc(db, 'users', uid, 'beneficiaries', benId), {
            ...fields,
            updatedAt: serverTimestamp()
        })
    }

    // ── PROVIDE THE DATA ─────────────────────────────────
    // Any component that calls useData() receives these 6 things:
    //   docs     → the live array of documents
    //   bens     → the live array of beneficiaries
    //   addDoc   → function to add a doc
    //   deleteDoc→ function to delete a doc (by Firestore ID)
    //   addBen   → function to add a beneficiary
    //   deleteBen→ function to delete a beneficiary (by Firestore ID)
    return (
        <DataContext.Provider value={{ docs, bens, addDoc: addDoc_, deleteDoc: deleteDoc_, addBen, deleteBen, updateBen }}>
            {children}
        </DataContext.Provider>
    )
}

// Custom hook — any component calls useData() to access the above values.
// Example: const { docs, deleteDoc } = useData()
export function useData() {
    return useContext(DataContext)
}
