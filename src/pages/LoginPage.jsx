// ============================================================
// FILE: src/pages/LoginPage.jsx
// ============================================================
// 🔑 LOGIN PAGE — Where users sign in to their account
//
// WHAT THIS PAGE DOES:
//   1. Shows a "Sign in with Google" button (one-click login)
//   2. Shows an email + password form as an alternative
//   3. Validates input and shows error messages if something's wrong
//   4. On success → shows a toast and navigates to the Dashboard
//
// HOW IT COMMUNICATES:
//   - Reads  from AuthContext  → gets login() and loginWithGoogle()
//   - Reads  from ToastContext → gets showToast()
//   - Uses   react-router      → navigate('/dashboard') after login
//
// WHAT IS A "PAGE" COMPONENT?
//   In React, a "page" is just a regular component that represents
//   a full screen of content. React Router decides which page to
//   show based on the current URL. There's nothing special about a
//   page vs. a component — it's just a naming convention. 📄
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
    // ── STATE (controlled form inputs) ────────────────────
    // In React, form inputs are "controlled" — meaning the input's
    // value is tied to a state variable. When the user types, we
    // update the state. The state then updates the input's value.
    // This creates a two-way binding between the UI and the state.
    //
    // email    → what the user typed in the email field
    // password → what the user typed in the password field
    // error    → error message to display (empty string = no error)
    // loading  → true while we're waiting for Firebase to respond
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // ── GET FROM CONTEXTS ─────────────────────────────────
    // login()          → Firebase email/password sign-in function
    // loginWithGoogle()→ Firebase Google popup sign-in function
    const { login, loginWithGoogle } = useAuth()

    // showToast() → shows a brief notification popup
    const { showToast } = useToast()

    // navigate() → changes the URL to navigate to another page
    const navigate = useNavigate()

    // ── AUTO-REDIRECT IF 2FA PENDING ──────────────────────
    const { awaiting2FA, isLoggedIn } = useAuth()
    React.useEffect(() => {
        if (awaiting2FA) navigate('/verify-2fa')
        if (isLoggedIn) navigate('/dashboard')
    }, [awaiting2FA, isLoggedIn, navigate])

    // ── FORM SUBMIT HANDLER (email/password login) ────────
    // This function runs when the user clicks "Login to Red Box"
    async function handleLogin(e) {
        // e.preventDefault() stops the browser's default form behavior.
        // By default, a form submission refreshes the page — we DON'T want that.
        e.preventDefault()

        setError('')       // clear any previous error message
        setLoading(true)   // show loading state on button

        // Call login() from AuthContext → it talks to Firebase
        const result = await login(email, password)

        setLoading(false)

        if (result.error) {
            setError(result.error)
            return
        }

        // 2FA CHECK:
        if (result.requires2FA) {
            showToast('🔐 Two-Factor Authentication required')
            navigate('/verify-2fa')
            return
        }

        // Success! Show toast and go to the dashboard
        showToast('🎉 Welcome back, ' + result.name.split(' ')[0] + '!')
        navigate('/dashboard')
    }

    // ── GOOGLE SIGN-IN HANDLER ────────────────────────────
    async function handleGoogle() {
        setError('')
        setLoading(true)

        const result = await loginWithGoogle()
        setLoading(false)

        if (result.error) { setError(result.error); return }

        // If Google sign-in also requires 2FA, the AuthContext listener will handle it,
        // but we should still check if we need to redirect manually based on awaiting2FA
        // However, standard Google login usually bypasses app-level 2FA unless we force it.
        // For this demo, we'll let onAuthStateChanged handle the 'awaiting2FA' state.

        showToast('🎉 Welcome, ' + result.name.split(' ')[0] + '!')
        navigate('/dashboard')
    }

    // ── JSX (the actual UI) ───────────────────────────────
    return (
        <div className="auth-wrap">
            {/* auth-box is the white card in the center of the screen */}
            {/* 'fade-up' class triggers a CSS animation (slides up from below) */}
            <div className="auth-box fade-up">
                <div className="auth-title">Welcome Back</div>
                <div className="auth-sub">Login to access your Red Box vault</div>

                {/* ── GOOGLE BUTTON ──────────────────────────
                    The Google logo image is served directly from Google's CDN.
                    'disabled={loading}' prevents double-clicking while processing. */}
                <button
                    className="btn-google"
                    onClick={handleGoogle}
                    disabled={loading}
                    type="button"
                >
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        width="20"
                    />
                    Continue with Google
                </button>

                {/* Divider line with "or" text in the middle */}
                <div className="auth-divider"><span>or</span></div>

                {/* ── EMAIL/PASSWORD FORM ─────────────────── */}
                {/* onSubmit connects to our handleLogin function */}
                <form onSubmit={handleLogin}>

                    {/* Email field */}
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">✉️</span>
                            {/* onChange fires every time the user types a character.
                                e.target.value = the current text in the input box.
                                We save it to state with setEmail() */}
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}                          // controlled: tied to state
                                onChange={e => setEmail(e.target.value)} // update state on type
                            />
                        </div>
                    </div>

                    {/* Password field */}
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔑</span>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {/* CONDITIONAL RENDERING:
                            Only show the error div if 'error' is a non-empty string.
                            The && operator is a short-circuit: if the left side is false/empty,
                            React skips the right side entirely (no error div rendered). */}
                        {error && (
                            <div style={{ color: '#e63535', fontSize: '0.8rem', marginTop: '6px' }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Submit button — shows "Logging in…" while loading */}
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Logging in…' : 'Login to Red Box'}
                    </button>
                </form>

                {/* Link to Signup page */}
                <div className="auth-footer">
                    Don't have an account?{' '}
                    {/* ' ' (space) is needed because JSX collapses whitespace */}
                    <a onClick={() => navigate('/signup')}>Sign up free</a>
                </div>
            </div>
        </div>
    )
}
