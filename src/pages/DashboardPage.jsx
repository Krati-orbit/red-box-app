// ============================================================
// FILE: src/pages/DashboardPage.jsx
// ============================================================
// 📊 DASHBOARD PAGE — The home screen after logging in (URL: "/dashboard")
//
// This is a PROTECTED page — you only reach it if you're logged in.
// The <Protected> wrapper in App.jsx ensures this.
//
// WHAT IT SHOWS:
//   - A welcome header with the user's first name
//   - A "Check In" banner (for the deadman's switch feature)
//   - 3 stat cards: document count, beneficiary count, security status
//   - Quick action shortcuts: Upload, Add Beneficiary
//   - Recent documents (up to 3, from Firestore in real-time)
//
// HOW IT READS LIVE DATA:
//   It reads 'docs' and 'bens' from DataContext.
//   DataContext has a Firestore real-time listener (onSnapshot).
//   So if you upload a document on another device, it reflects here INSTANTLY.
//
// COMMUNICATION:
//   AuthContext  → firstName (to say "Welcome back, Krati 👋")
//   DataContext  → docs.length, bens.length, docs (recent list)
//   ToastContext → showToast() for check-in confirmation
//   react-router → navigate() to go to other pages
// ============================================================

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

export default function DashboardPage() {
    // ── READ FROM CONTEXTS ────────────────────────────────
    // firstName → e.g. "Krati" (shown in the welcome header)
    const { firstName, user } = useAuth()

    // docs → live array of the user's documents from Firestore
    // bens → live array of the user's beneficiaries from Firestore
    // Both update automatically when Firestore data changes!
    const { docs, bens } = useData()

    // showToast → function to show a brief popup notification
    const { showToast } = useToast()

    // navigate → function to go to a different page URL
    const navigate = useNavigate()

    const [lastCheckIn, setLastCheckIn] = React.useState('Loading...')
    const [daysLeft, setDaysLeft] = React.useState(90)

    React.useEffect(() => {
        if (!user) return
        const fetchCheckInStatus = async () => {
            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user')
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr)
                    const last = data.lastCheckIn ? new Date(data.lastCheckIn) : new Date(data.createdAt || Date.now())
                    const diff = Math.floor((new Date() - last) / (1000 * 60 * 60 * 24))
                    const frequency = data.checkInFrequency || 90

                    setLastCheckIn(diff === 0 ? 'Today' : `${diff} days ago`)
                    setDaysLeft(frequency - diff)
                } else {
                    setLastCheckIn('Today')
                    setDaysLeft(90)
                }
                return
            }
            try {
                const { getDoc, doc } = await import('firebase/firestore')
                const { db } = await import('../services/firebase')
                const userDoc = await getDoc(doc(db, 'users', user.uid))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    const last = data.lastCheckIn ? data.lastCheckIn.toDate() : data.createdAt.toDate()
                    const diff = Math.floor((new Date() - last) / (1000 * 60 * 60 * 24))
                    const frequency = data.checkInFrequency || 90

                    setLastCheckIn(diff === 0 ? 'Today' : `${diff} days ago`)
                    setDaysLeft(frequency - diff)
                }
            } catch (err) {
                console.error("fetchCheckInStatus error:", err)
            }
        }
        fetchCheckInStatus()
    }, [user])

    const handleManualCheckIn = async () => {
        try {
            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user')
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr)
                    data.lastCheckIn = new Date().toISOString()
                    data.isActive = true
                    localStorage.setItem('red_box_mock_user', JSON.stringify(data))
                }
                setLastCheckIn('Today')
                setDaysLeft(90)
                showToast('✅ Check-in successful! Account is active.')
                return
            }

            const { updateDoc, doc, serverTimestamp } = await import('firebase/firestore')
            const { db } = await import('../services/firebase')
            await updateDoc(doc(db, 'users', user.uid), {
                lastCheckIn: serverTimestamp(),
                isActive: true
            })
            setLastCheckIn('Today')
            setDaysLeft(90)
            showToast('✅ Check-in successful! Account is active.')
        } catch (error) {
            console.error("Check-in error:", error)
            showToast('❌ Check-in failed.')
        }
    }

    return (
        <div className="container">

            {/* ── PAGE HEADER ─────────────────────────────── */}
            <div className="page-header fade-up">
                <div>
                    {/* Curly braces {} inside JSX are used to inject JavaScript expressions.
                        {firstName} injects the value of the firstName variable here. */}
                    <div className="page-title">Welcome, {firstName} 👋</div>
                    <div className="page-subtitle">Your legacy vault is active and secure</div>
                </div>
                <span className="badge badge-green">● Active</span>
            </div>

            {/* ── CHECK-IN BANNER ──────────────────────────
                The Deadman's Switch: users must regularly check in.
                Clicking "Check In Now" just shows a toast for now.
                'delay-1' makes it animate in slightly after the header. */}
            <div className="checkin-banner fade-up delay-1">
                <div className="checkin-left">
                    <div className="checkin-clock">⏰</div>
                    <div>
                        <div className="checkin-title">Last Check-in: <strong>{lastCheckIn}</strong></div>
                        <div className="checkin-sub">
                            {daysLeft > 0
                                ? `Next reminder in ${daysLeft} days.`
                                : `Reminder SENT. Please check in immediately!`
                            }
                        </div>
                    </div>
                </div>
                {/* Arrow function in onClick: () => showToast(...)
                    We wrap showToast in an arrow function because onClick
                    needs a function REFERENCE, not a function call.
                    If we wrote onClick={showToast('...')} it would run
                    immediately on render instead of on click! */}
                <button
                    className="btn btn-primary btn-sm"
                    onClick={handleManualCheckIn}
                >
                    Check In Now
                </button>
            </div>

            {/* ── STAT CARDS ──────────────────────────────
                3 cards in a CSS grid row (grid-3 class = 3 equal columns).
                docs.length and bens.length update live from Firestore!
                Clicking each card navigates to the relevant page. */}
            <div className="grid-3 fade-up delay-2" style={{ marginBottom: '1.75rem' }}>
                <div className="stat-card" onClick={() => navigate('/documents')}>
                    <div className="stat-icon">📄</div>
                    {/* docs.length = number of documents in the array */}
                    <div className="stat-value">{docs.length}</div>
                    <div className="stat-label">Secured Documents</div>
                </div>
                <div className="stat-card" onClick={() => navigate('/beneficiaries')}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-value">{bens.length}</div>
                    <div className="stat-label">Beneficiaries</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🛡️</div>
                    <div className="stat-value text-green" style={{ fontSize: '1.5rem' }}>Secure</div>
                    <div className="stat-label">Security Status</div>
                </div>
            </div>

            {/* ── QUICK ACTIONS + RECENT DOCS ──────────────
                2 cards side by side (grid-2 = 2 equal columns). */}
            <div className="grid-2 fade-up delay-3">

                {/* Quick Actions card */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>Quick Actions</div>
                    </div>
                    <div className={`quick-action ${docs.length === 0 ? 'highlight-pulse' : ''}`} onClick={() => navigate('/upload')}>
                        <div className="qa-icon">📤</div>
                        <div>
                            <div className="qa-title">Upload Document</div>
                            <div className="qa-sub">Add files to your vault</div>
                        </div>
                        <div className="qa-arrow">→</div>
                    </div>
                    <div className={`quick-action ${bens.length === 0 ? 'highlight-pulse' : ''}`} onClick={() => navigate('/beneficiaries/add')}>
                        <div className="qa-icon">➕</div>
                        <div>
                            <div className="qa-title">Add Beneficiary</div>
                            <div className="qa-sub">Designate trusted contacts</div>
                        </div>
                        <div className="qa-arrow">→</div>
                    </div>
                </div>

                {/* Recent Documents card */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div style={{ fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>Recent Documents</div>
                        <a className="text-sm text-red" onClick={() => navigate('/documents')} style={{ cursor: 'pointer' }}>
                            View all →
                        </a>
                    </div>

                    {/* Conditional rendering:
                        If no docs → show an empty state message
                        If there are docs → show up to 3 of them
                        docs.slice(0, 3) = take only the first 3 items from the array */}
                    {docs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text3)', fontSize: '0.85rem' }}>
                            📂 No documents yet.{' '}
                            <a style={{ color: 'var(--red)', cursor: 'pointer' }} onClick={() => navigate('/upload')}>
                                Upload your first →
                            </a>
                        </div>
                    ) : docs.slice(0, 3).map((doc, i) => (
                        // key={i} helps React track each list item efficiently
                        <div key={i} className="doc-row" onClick={() => navigate('/documents')}>
                            <div className="doc-icon">{doc.icon}</div>
                            <div className="doc-info">
                                <div className="doc-name">{doc.name}</div>
                                <div className="doc-meta">🔒 Encrypted · Added {doc.addedAt}</div>
                            </div>
                            <span className={`badge ${doc.tagClass}`}>{doc.tag}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
