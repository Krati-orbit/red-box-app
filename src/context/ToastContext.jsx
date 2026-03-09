// ============================================================
// FILE: src/context/ToastContext.jsx
// ============================================================
// 🍞 WHAT IS A "TOAST"?
//
// A toast is a small pop-up notification that appears briefly
// at the bottom/corner of the screen, then disappears automatically.
// You've seen these: "✅ Saved!" or "🗑️ Deleted!" messages.
//
// WHY IS THIS ITS OWN CONTEXT?
// Any page can show a toast message — Login, Documents, Beneficiaries, etc.
// Instead of building toast logic in every page, we have ONE central
// toast system that everyone can use by calling showToast("message").
//
// COMMUNICATION FLOW:
//   ToastContext  →  provides showToast() to everyone
//   LoginPage     →  calls showToast("Welcome back!") after login
//   SignupPage    →  calls showToast("Account created!")
//   DocumentsPage →  calls showToast("Document deleted")
//   Navbar        →  calls showToast("Logged out") after logout
// ============================================================

import React, { createContext, useContext, useState, useRef, useCallback } from 'react'

// Create the container for our toast context
const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    // msg = the text message to display inside the toast
    // e.g. "🎉 Welcome back, Krati!"
    const [msg, setMsg] = useState('')

    // visible = whether the toast is currently shown or hidden
    // true → the CSS class 'show' is applied → toast is visible
    const [visible, setVisible] = useState(false)

    // useRef stores a reference to the current timer.
    // We need this so if showToast() is called again quickly, we can
    // CANCEL the old timer and start a fresh one.
    // (If you call it twice fast without this, the toast might disappear too early)
    // useRef value persists between renders without causing re-renders.
    // Think of it as a "sticky note" that doesn't trigger re-draws. 📝
    const timerRef = useRef(null)

    // useCallback wraps the function so it's NOT re-created on every render.
    // This is a performance optimization — since showToast is passed as a value
    // to many children, we don't want to create a brand new function object
    // every time this component renders.
    // The [] means "never recreate this function" (no dependencies).
    const showToast = useCallback((message, duration = 2800) => {
        // If a toast timer is already running, cancel it first
        if (timerRef.current) clearTimeout(timerRef.current)

        // Set the message text and make the toast visible
        setMsg(message)
        setVisible(true)

        // After 'duration' milliseconds (default 2.8 seconds), hide the toast
        // setTimeout returns a timer ID which we save so we can cancel it later
        timerRef.current = setTimeout(() => setVisible(false), duration)
    }, []) // [] = this function never depends on state, so never recreate it

    return (
        <ToastContext.Provider value={{ showToast }}>
            {/* Render all child components (the rest of the app) */}
            {children}

            {/* The actual toast UI — it's always in the DOM, but hidden by default.
                When visible=true, we add the 'show' class which makes it visible.
                CSS in index.css handles the animation and positioning.
                className evaluates to either "toast" or "toast show" */}
            <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
        </ToastContext.Provider>
    )
}

// Custom hook — any component calls useToast() to get showToast()
// Example: const { showToast } = useToast()
//          showToast('🎉 Done!')
export function useToast() {
    return useContext(ToastContext)
}
