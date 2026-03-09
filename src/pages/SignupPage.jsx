// ============================================================
// FILE: src/pages/SignupPage.jsx
// ============================================================
// 📝 SIGNUP PAGE — Where new users create their Red Box account
//
// WHAT THIS PAGE DOES:
//   1. Shows a "Sign up with Google" button (quickest way)
//   2. Shows a full form: name, email, password, confirm password
//   3. Has a live password strength indicator (color bars)
//   4. Validates all inputs and shows errors if invalid
//   5. On success → shows toast and goes to Dashboard
//
// HOW IT COMMUNICATES:
//   - AuthContext  → signup() creates account, loginWithGoogle() for Google
//   - ToastContext → showToast() for success notification
//   - react-router → navigate('/dashboard') after account creation
// ============================================================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// ============================================================
// HELPER: getPwdClass
// Given the password length, returns how many bars to fill
// and which CSS color class to use for the strength indicator.
//
// This is defined OUTSIDE the component because:
//   1. It doesn't need React state or hooks
//   2. It's a pure function (same input → same output, always)
//   3. Keeping it outside avoids recreating it on every render
// ============================================================
function getPwdClass(len) {
    if (len === 0) return { count: 0, cls: '' }         // no bars
    if (len < 4) return { count: 1, cls: 'filled' }    // 1 red bar (weak)
    if (len < 8) return { count: 2, cls: 'medium' }    // 2 orange bars
    if (len < 12) return { count: 3, cls: 'strong' }    // 3 green bars
    return { count: 4, cls: 'strong' }           // 4 green bars (strong)
}

export default function SignupPage() {
    // ── STATE ──────────────────────────────────────────────
    // One state variable per form field. All start as empty strings.
    // These are "controlled inputs" — the input's value is read from
    // state, and state is updated on every keystroke.
    const [name, setName] = useState('')  // user's full name
    const [email, setEmail] = useState('')  // email address
    const [password, setPassword] = useState('') // chosen password
    const [confirm, setConfirm] = useState('')  // re-entered password
    const [error, setError] = useState('')  // validation error message
    const [loading, setLoading] = useState(false) // button loading state

    // ── GET FUNCTIONS FROM CONTEXTS ───────────────────────
    const { signup, loginWithGoogle } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    // ── DERIVED STATE: password strength ──────────────────
    // 'pwd' is computed from the current password length every render.
    // It's NOT stored in useState — it's just calculated when needed.
    // pwd.count → how many bars to fill (0-4)
    // pwd.cls   → CSS class for bar color ("filled", "medium", "strong")
    const pwd = getPwdClass(password.length)

    // ── FORM SUBMIT HANDLER ───────────────────────────────
    async function handleSignup(e) {
        e.preventDefault() // prevent default browser form submit (page reload)
        setError('')
        setLoading(true)

        // signup() talks to Firebase: creates the account, sets display name
        // Returns { success: true, name: "..." } or { error: "..." }
        const result = await signup(name, email, password, confirm)
        setLoading(false)

        if (result.error) { setError(result.error); return }

        showToast('🎉 Welcome to Red Box, ' + result.name.split(' ')[0] + '!')
        navigate('/dashboard')
    }

    // ── GOOGLE SIGNUP HANDLER ─────────────────────────────
    // Same as Google login — Firebase doesn't distinguish between
    // "sign up" and "sign in" with Google. If it's a new account,
    // it gets created automatically.
    async function handleGoogle() {
        setError('')
        setLoading(true)
        const result = await loginWithGoogle()
        setLoading(false)
        if (result.error) { setError(result.error); return }
        showToast('🎉 Welcome to Red Box, ' + result.name.split(' ')[0] + '!')
        navigate('/dashboard')
    }

    // ── JSX (the actual UI) ───────────────────────────────
    return (
        <div className="auth-wrap">
            <div className="auth-box fade-up">
                <div className="auth-title">Create Your Red Box</div>
                <div className="auth-sub">Start securing your legacy today — it's free</div>

                {/* Google Sign-Up button */}
                <button className="btn-google" onClick={handleGoogle} disabled={loading} type="button">
                    <img
                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                        alt="Google"
                        width="20"
                    />
                    Sign up with Google
                </button>

                <div className="auth-divider"><span>or</span></div>

                {/* Email/Password signup form */}
                <form onSubmit={handleSignup}>

                    {/* Name field */}
                    <div className="form-group">
                        <label>Full Name</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">👤</span>
                            <input
                                className="input"
                                type="text"
                                placeholder="Your Full Name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Email field */}
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">✉️</span>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password field with strength indicator */}
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔒</span>
                            <input
                                className="input"
                                type="password"
                                placeholder="Min. 8 characters"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>

                        {/* Password strength bars
                            We render 4 bar divs using Array.map().
                            [0, 1, 2, 3].map(...) creates 4 elements.
                            Each bar gets a CSS class based on whether its
                            index (i) is less than pwd.count.
                            Example: if count=2, bars 0 and 1 get the class,
                            bars 2 and 3 don't → first 2 bars are colored. */}
                        <div className="pwd-strength">
                            {[0, 1, 2, 3].map(i => (
                                // key={i} is required by React when rendering lists.
                                // It helps React efficiently update only changed elements.
                                <div
                                    key={i}
                                    className={`pwd-bar${i < pwd.count ? ' ' + pwd.cls : ''}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Confirm Password field */}
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔒</span>
                            <input
                                className="input"
                                type="password"
                                placeholder="Re-enter password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Error box — only shown when 'error' is not empty */}
                    {error && (
                        <div style={{
                            color: '#e63535', fontSize: '0.85rem',
                            marginBottom: '10px', padding: '10px 14px',
                            background: 'rgba(230,53,53,0.1)',
                            borderRadius: '8px', border: '1px solid rgba(230,53,53,0.3)'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        type="submit"
                        disabled={loading}
                    >
                        {/* Ternary: show different text based on loading state */}
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>
                </form>

                {/* Footer link to Login page */}
                <div className="auth-footer">
                    Already have an account?{' '}
                    <a onClick={() => navigate('/login')}>Login</a>
                </div>
            </div>
        </div>
    )
}
