import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { auth } from '../services/firebase'
import {
    updateProfile,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from 'firebase/auth'

import TwoFactorSetup from '../components/TwoFactorSetup'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import CheckInSettings from '../components/CheckInSettings'
import AdminCheckInPanel from '../components/AdminCheckInPanel'

export default function ProfilePage() {
    const { user } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const [displayName, setDisplayName] = useState(user?.displayName || '')
    const [currentPwd, setCurrentPwd] = useState('')
    const [newPwd, setNewPwd] = useState('')
    const [confirmPwd, setConfirmPwd] = useState('')
    const [nameLoading, setNameLoading] = useState(false)
    const [pwdLoading, setPwdLoading] = useState(false)
    const [showPwd, setShowPwd] = useState(false)

    // 2FA State
    const [is2FAEnabled, setIs2FAEnabled] = useState(false)
    const [isSettingUp2FA, setIsSettingUp2FA] = useState(false)
    const [twoFactorMethod, setTwoFactorMethod] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    // Fetch 2FA status on load
    React.useEffect(() => {
        if (!user) return
        async function fetchSettings() {
            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user')
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr)
                    setIs2FAEnabled(data.twoFactorEnabled || false)
                    setTwoFactorMethod(data.twoFactorMethod || '')
                    setIsAdmin(data.isAdmin || false)
                }
                return
            }
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid))
                if (userDoc.exists()) {
                    setIs2FAEnabled(userDoc.data().twoFactorEnabled || false)
                    setTwoFactorMethod(userDoc.data().twoFactorMethod || '')
                    setIsAdmin(userDoc.data().isAdmin || false)
                }
            } catch (err) {
                console.error("fetchSettings error:", err)
            }
        }
        fetchSettings()
    }, [user])

    async function handleDisable2FA() {
        if (!window.confirm('Are you sure you want to disable 2FA? This will make your vault less secure.')) return
        try {
            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user')
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr)
                    data.twoFactorEnabled = false
                    data.twoFactorMethod = ''
                    data.twoFactorSecret = null
                    data.backupCodes = []
                    localStorage.setItem('red_box_mock_user', JSON.stringify(data))
                }
                setIs2FAEnabled(false)
                showToast('🛡️ 2FA disabled')
                return
            }
            await updateDoc(doc(db, 'users', user.uid), {
                twoFactorEnabled: false,
                twoFactorMethod: '',
                twoFactorSecret: null,
                backupCodes: [],
                updatedAt: new Date()
            })
            setIs2FAEnabled(false)
            showToast('🛡️ 2FA disabled')
        } catch (err) {
            showToast('❌ Error: ' + err.message)
        }
    }

    async function handleUpdateName(e) {
        e.preventDefault()
        if (!displayName.trim()) { showToast('⚠️ Name cannot be empty'); return }
        if (!/^[a-zA-Z\s\-'.]{2,60}$/.test(displayName.trim())) {
            showToast('⚠️ Name can only contain letters and spaces'); return
        }
        setNameLoading(true)
        try {
            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user')
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr)
                    data.displayName = displayName.trim()
                    localStorage.setItem('red_box_mock_user', JSON.stringify(data))
                }
                user.displayName = displayName.trim()
                showToast('✅ Display name updated!')
                setNameLoading(false)
                return
            }
            await updateProfile(auth.currentUser, { displayName: displayName.trim() })
            showToast('✅ Display name updated!')
        } catch (err) {
            showToast('❌ ' + err.message)
        }
        setNameLoading(false)
    }

    async function handleChangePassword(e) {
        e.preventDefault()
        if (!currentPwd) { showToast('⚠️ Enter your current password'); return }
        if (newPwd.length < 8) { showToast('⚠️ New password must be at least 8 characters'); return }
        if (newPwd !== confirmPwd) { showToast('❌ Passwords do not match'); return }
        setPwdLoading(true)
        try {
            if (user.uid.startsWith('mock_')) {
                showToast('✅ Password changed successfully (Mocked)!')
                setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
                setPwdLoading(false)
                return
            }
            const credential = EmailAuthProvider.credential(user.email, currentPwd)
            await reauthenticateWithCredential(auth.currentUser, credential)
            await updatePassword(auth.currentUser, newPwd)
            showToast('✅ Password changed successfully!')
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                showToast('❌ Current password is incorrect')
            } else {
                showToast('❌ ' + err.message)
            }
        }
        setPwdLoading(false)
    }

    const initials = (user?.displayName || user?.email || '?')
        .trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')

    return (
        <div className="container" style={{ maxWidth: '560px' }}>
            <div className="page-header fade-up">
                <div>
                    <div className="page-title">My Profile</div>
                    <div className="page-subtitle">Manage your account information</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>← Dashboard</button>
            </div>

            {/* Avatar card */}
            <div className="card fade-up" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem 2rem' }}>
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--red), #ff6b6b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
                    boxShadow: '0 4px 20px rgba(220,38,38,0.35)'
                }}>
                    {initials}
                </div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.displayName || 'No name set'}</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.9rem', marginTop: '2px' }}>{user?.email}</div>
                    <div style={{ color: 'var(--text3)', fontSize: '0.78rem', marginTop: '6px' }}>
                        🔐 Account secured · Member since {user?.metadata?.creationTime
                            ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                            : 'N/A'}
                    </div>
                </div>
            </div>

            {/* 🛡️ TWO-FACTOR AUTHENTICATION SECTION */}
            <div className="card fade-up">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>🛡️ Two-Factor Authentication</div>
                    <span className={`badge ${is2FAEnabled ? 'badge-green' : 'badge-gray'}`}>
                        {is2FAEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                </div>

                {!isSettingUp2FA ? (
                    <>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>
                            Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                        </p>
                        {is2FAEnabled ? (
                            <div style={{ background: 'var(--bg2)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border1)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>
                                    Method: {twoFactorMethod === 'app' ? 'Authenticator App (TOTP)' : 'Email OTP'}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '1rem' }}>
                                    Verification required on every login
                                </div>
                                <button className="btn btn-danger btn-sm" onClick={handleDisable2FA}>Disable 2FA</button>
                            </div>
                        ) : (
                            <button className="btn btn-primary" onClick={() => setIsSettingUp2FA(true)}>
                                Set Up Two-Factor Authentication
                            </button>
                        )}
                    </>
                ) : (
                    <TwoFactorSetup
                        onComplete={() => { setIsSettingUp2FA(false); setIs2FAEnabled(true); }}
                        onCancel={() => setIsSettingUp2FA(false)}
                    />
                )}
            </div>

            {/* Update Name */}
            <div className="card fade-up">
                <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>✏️ Update Display Name</div>
                <form onSubmit={handleUpdateName}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Full Name</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">👤</span>
                            <input className="input" type="text" placeholder="Your full name"
                                value={displayName} onChange={e => setDisplayName(e.target.value)} />
                        </div>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={nameLoading}>
                        {nameLoading ? '⏳ Saving…' : '💾 Save Name'}
                    </button>
                </form>
            </div>

            {/* Change Password — email accounts only */}
            {user?.providerData?.[0]?.providerId === 'password' && (
                <div className="card fade-up">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>🔑 Change Password</div>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🔒</span>
                                <input className="input" type={showPwd ? 'text' : 'password'}
                                    placeholder="Your current password"
                                    value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">🔑</span>
                                <input className="input" type={showPwd ? 'text' : 'password'}
                                    placeholder="Minimum 8 characters"
                                    value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                            <label>Confirm New Password</label>
                            <div className="input-icon-wrap">
                                <span className="input-icon">✅</span>
                                <input className="input" type={showPwd ? 'text' : 'password'}
                                    placeholder="Repeat new password"
                                    value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                            </div>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} />
                            Show passwords
                        </label>
                        <button className="btn btn-primary" type="submit" disabled={pwdLoading}>
                            {pwdLoading ? '⏳ Updating…' : '🔑 Change Password'}
                        </button>
                    </form>
                </div>
            )}

            {/* ⏰ CHECK-IN SETTINGS SECTION */}
            <CheckInSettings />

            {/* 🛡️ ADMIN PANEL (Only shown for admins) */}
            {isAdmin && <AdminCheckInPanel />}
        </div>
    )
}
