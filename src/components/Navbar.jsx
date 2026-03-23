import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
    const { isLoggedIn, initials, firstName, logout, user, isAdmin } = useAuth()
    const { showToast } = useToast()
    const { docs, bens } = useData()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()
    const location = useLocation()

    const [dropOpen, setDropOpen] = useState(false)
    const [notifOpen, setNotifOpen] = useState(false)
    const dropRef = useRef(null)
    const notifRef = useRef(null)

    // Close dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close on route change
    useEffect(() => {
        setDropOpen(false)
        setNotifOpen(false)
    }, [location.pathname])

    // Smart notifications from user data
    const notifications = []
    if (bens.length === 0)
        notifications.push({ id: 'n1', icon: '👥', text: 'No beneficiaries yet. Add a trusted contact.', action: '/beneficiaries/add' })
    if (docs.length === 0)
        notifications.push({ id: 'n2', icon: '📄', text: 'No documents uploaded. Secure your files.', action: '/upload' })
    const bensNoPhone = bens.filter(b => !b.phone)
    if (bensNoPhone.length > 0)
        notifications.push({ id: 'n3', icon: '📱', text: `${bensNoPhone.length} beneficiar${bensNoPhone.length > 1 ? 'ies are' : 'y is'} missing a phone number.`, action: '/beneficiaries' })
    const bensNoId = bens.filter(b => !b.idType)
    if (bensNoId.length > 0)
        notifications.push({ id: 'n4', icon: '🪪', text: `${bensNoId.length} beneficiar${bensNoId.length > 1 ? 'ies are' : 'y is'} missing ID details.`, action: '/beneficiaries' })
    if (docs.length > 0 && bens.length === 0)
        notifications.push({ id: 'n5', icon: '⚠️', text: 'You have documents but no beneficiary to receive them!', action: '/beneficiaries/add' })

    const unread = notifications.length

    function handleLogout() {
        logout()
        showToast('👋 Logged out successfully')
        navigate('/')
    }

    const isActive = (path) => location.pathname.startsWith(path)

    return (
        <nav>
            <div className="logo" onClick={() => navigate('/')}>
                <div className="logo-icon">📦</div>
                <div className="logo-text">RED <span>BOX</span></div>
            </div>

            {isLoggedIn ? (
                <div className="nav-links">
                    {/* Quick Upload */}
                    <button className="btn btn-primary btn-sm nav-upload-btn"
                        onClick={() => navigate('/upload')} title="Upload a document">
                        ＋ Upload
                    </button>

                    {/* Nav links */}
                    <button className={`nav-link${isActive('/dashboard') ? ' active' : ''}`}
                        onClick={() => navigate('/dashboard')}>Dashboard</button>
                    <button className={`nav-link${isActive('/documents') ? ' active' : ''}`}
                        onClick={() => navigate('/documents')}>Documents</button>
                    <button className={`nav-link${isActive('/beneficiaries') ? ' active' : ''}`}
                        onClick={() => navigate('/beneficiaries')}>Beneficiaries</button>
                    <button className={`nav-link${isActive('/legal-knowledge') ? ' active' : ''}`}
                        onClick={() => navigate('/legal-knowledge')}>Legal Hub</button>

                    <div className="nav-divider" />

                    {/* Theme Toggle */}
                    <button
                        className="nav-icon-btn"
                        onClick={toggleTheme}
                        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                        aria-label="Toggle Theme"
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {/* Notifications Bell */}
                    <div className="nav-notif-wrap" ref={notifRef}>
                        <button className={`nav-icon-btn${notifOpen ? ' active' : ''}`}
                            onClick={() => { setNotifOpen(o => !o); setDropOpen(false) }}
                            title="Notifications" aria-label="Notifications">
                            🔔
                            {unread > 0 && <span className="nav-badge">{unread}</span>}
                        </button>
                        {notifOpen && (
                            <div className="nav-dropdown nav-notif-panel">
                                <div className="nav-dropdown-header">
                                    <span>🔔 Notifications</span>
                                    <span className="nav-badge-pill">{unread} alerts</span>
                                </div>
                                {notifications.length === 0 ? (
                                    <div className="nav-notif-empty">✅ All clear! No action needed.</div>
                                ) : (
                                    notifications.map(n => (
                                        <button key={n.id} className="nav-notif-item"
                                            onClick={() => { navigate(n.action); setNotifOpen(false) }}>
                                            <span className="nav-notif-icon">{n.icon}</span>
                                            <span className="nav-notif-text">{n.text}</span>
                                            <span className="nav-notif-arrow">→</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Avatar Dropdown */}
                    <div className="nav-avatar-wrap" ref={dropRef}>
                        <button className={`nav-avatar-btn${dropOpen ? ' active' : ''}`}
                            onClick={() => { setDropOpen(o => !o); setNotifOpen(false) }}
                            title="Account menu" aria-label="Account menu">
                            <div className="nav-avatar">{initials}</div>
                            <span className="nav-avatar-name">{firstName}</span>
                            <span className={`nav-caret${dropOpen ? ' open' : ''}`}>▾</span>
                        </button>
                        {dropOpen && (
                            <div className="nav-dropdown">
                                <div className="nav-dropdown-header">
                                    <div className="nav-dropdown-user-info">
                                        <div className="nav-dropdown-avatar">{initials}</div>
                                        <div>
                                            <div className="nav-dropdown-name">{user?.displayName || firstName}</div>
                                            <div className="nav-dropdown-email">{user?.email}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="nav-dropdown-divider" />
                                <button className="nav-dropdown-item" onClick={() => navigate('/profile')}>👤 My Profile</button>
                                <button className="nav-dropdown-item" onClick={() => navigate('/dashboard')}>📊 Dashboard</button>
                                <button className="nav-dropdown-item" onClick={() => navigate('/upload')}>📤 Upload Document</button>
                                {isAdmin && (
                                    <>
                                        <div className="nav-dropdown-divider" />
                                        <button className="nav-dropdown-item" style={{ color: 'var(--red)', fontWeight: 600 }} onClick={() => navigate('/admin/dashboard')}>🛡️ Admin Panel</button>
                                    </>
                                )}
                                <div className="nav-dropdown-divider" />
                                <button className="nav-dropdown-item nav-dropdown-item--danger" onClick={handleLogout}>🚪 Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="nav-links">
                    <button className="nav-link" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Get Started</button>
                </div>
            )}
        </nav>
    )
}
