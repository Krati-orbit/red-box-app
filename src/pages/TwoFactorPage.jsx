import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function TwoFactorPage() {
    const { awaiting2FA, verify2FA, logout } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)

    // Redirect if not awaiting 2FA
    useEffect(() => {
        if (!awaiting2FA) {
            navigate('/login')
        }
    }, [awaiting2FA, navigate])

    async function handleSubmit(e) {
        e.preventDefault()
        if (code.length < 6) {
            showToast('⚠️ Please enter a 6-digit code')
            return
        }

        setLoading(true)
        const result = await verify2FA(code)
        setLoading(false)

        if (result.success) {
            showToast('✅ Verification successful!')
            navigate('/dashboard')
        } else {
            showToast(result.error || '❌ Invalid code')
        }
    }

    if (!awaiting2FA) return null

    return (
        <div className="auth-wrap">
            <div className="auth-box fade-up">
                <div className="auth-title">Verify Your Identity</div>
                <div className="auth-sub">
                    A verification code is required to access your account.
                </div>

                <div className="alert alert-blue mb-6">
                    <div className="alert-icon">📱</div>
                    <div className="alert-text">
                        Enter the 6-digit code from your <strong>
                            {awaiting2FA.method === 'app' ? 'Authenticator App' : awaiting2FA.method === 'email' ? 'Email' : 'SMS'}
                        </strong>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Verification Code</label>
                        <div className="input-icon-wrap">
                            <span className="input-icon">🔢</span>
                            <input
                                className="input"
                                type="text"
                                maxLength="6"
                                placeholder="000000"
                                style={{ letterSpacing: '8px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 700 }}
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                                autoFocus
                            />
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>

                    <button
                        className="btn btn-ghost"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                        type="button"
                        onClick={logout}
                    >
                        Cancel & Logout
                    </button>
                </form>

                <div className="auth-footer">
                    Lost access to your device? <a onClick={() => showToast('ℹ️ Use a backup code or contact support.')}>Use a backup code</a>
                </div>
            </div>
        </div>
    )
}
