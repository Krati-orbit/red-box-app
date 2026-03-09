import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { TOTP } from 'otpauth'
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function TwoFactorSetup({ onComplete, onCancel }) {
    const { user } = useAuth()
    const { showToast } = useToast()
    const [step, setStep] = useState(1) // 1: Method Select, 2: Setup, 3: Verify, 4: Backup Codes
    const [method, setMethod] = useState('app')
    const [secret, setSecret] = useState(null)
    const [otpCode, setOtpCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [backupCodes, setBackupCodes] = useState([])

    // Generate TOTP Secret
    function generateSecret() {
        const newSecret = new TOTP({
            issuer: 'RedBox Vault',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30
        })
        setSecret(newSecret)
        setStep(2)
    }

    // Generate Random Backup Codes
    function generateBackupCodes() {
        const codes = Array.from({ length: 10 }, () =>
            Math.random().toString(36).substring(2, 10).toUpperCase()
        )
        setBackupCodes(codes)
        return codes
    }

    async function handleVerifyAndSave() {
        setLoading(true)
        try {
            let isValid = false
            if (method === 'app') {
                const delta = secret.validate({ token: otpCode, window: 1 })
                isValid = (delta !== null)
            } else {
                // For demo, any 6 digit code works for email/sms in setup
                isValid = otpCode.length === 6
            }

            if (!isValid) {
                showToast('❌ Invalid code. Please try again.')
                setLoading(false)
                return
            }

            const codes = generateBackupCodes()

            // Save to Firestore
            await updateDoc(doc(db, 'users', user.uid), {
                twoFactorEnabled: true,
                twoFactorMethod: method,
                twoFactorSecret: method === 'app' ? secret.secret.base32 : null,
                backupCodes: codes,
                updatedAt: new Date()
            })

            showToast('✅ 2FA enabled successfully!')
            setStep(4)
        } catch (err) {
            showToast('❌ Error: ' + err.message)
        }
        setLoading(false)
    }

    return (
        <div className="card fade-up" style={{ border: '2px solid var(--red-light)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>🛡️ Two-Factor Authentication Setup</div>
                <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
            </div>

            {/* STEP 1: SELECT METHOD */}
            {step === 1 && (
                <div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text2)', marginBottom: '1.5rem' }}>
                        Add an extra layer of security to your account. Choose how you'd like to receive verification codes.
                    </p>
                    <div className="grid-2" style={{ gap: '1rem' }}>
                        <div
                            className={`stat-card ${method === 'app' ? 'active' : ''}`}
                            style={{ cursor: 'pointer', border: method === 'app' ? '2px solid var(--red)' : '1px solid var(--border1)' }}
                            onClick={() => setMethod('app')}
                        >
                            <div className="stat-icon">📱</div>
                            <div className="stat-label">Authenticator App</div>
                            <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Google Authenticator, Authy, etc.</div>
                        </div>
                        <div
                            className={`stat-card ${method === 'email' ? 'active' : ''}`}
                            style={{ cursor: 'pointer', border: method === 'email' ? '2px solid var(--red)' : '1px solid var(--border1)' }}
                            onClick={() => setMethod('email')}
                        >
                            <div className="stat-icon">✉️</div>
                            <div className="stat-label">Email OTP</div>
                            <div style={{ fontSize: '0.7rem', marginTop: '4px' }}>Codes sent to {user.email}</div>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
                        onClick={method === 'app' ? generateSecret : () => setStep(2)}
                    >
                        Continue
                    </button>
                </div>
            )}

            {/* STEP 2: SETUP (QR OR CONFIRMATION) */}
            {step === 2 && (
                <div style={{ textAlign: 'center' }}>
                    {method === 'app' ? (
                        <>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Scan this QR code with your Authenticator app:
                            </p>
                            <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '8px', marginBottom: '1rem' }}>
                                <QRCodeSVG value={secret.toString()} size={180} />
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>
                                Can't scan? Use code: <strong style={{ letterSpacing: '1px' }}>{secret.secret.base32}</strong>
                            </div>
                        </>
                    ) : (
                        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            We will send a 6-digit verification code to <strong>{user.email}</strong> whenever you log in.
                        </p>
                    )}
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(3)}>
                        I've set it up, next →
                    </button>
                </div>
            )}

            {/* STEP 3: VERIFY */}
            {step === 3 && (
                <div>
                    <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        Enter the code from your {method === 'app' ? 'app' : 'email'} to verify setup:
                    </p>
                    <div className="form-group">
                        <input
                            className="input"
                            type="text"
                            placeholder="000000"
                            maxLength="6"
                            style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '4px' }}
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleVerifyAndSave}
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Verify & Enable'}
                    </button>
                </div>
            )}

            {/* STEP 4: BACKUP CODES */}
            {step === 4 && (
                <div>
                    <div className="alert alert-red mb-4">
                        <div className="alert-icon">⚠️</div>
                        <div className="alert-text">
                            <strong>Save your backup codes!</strong> If you lose your device, these are the only way to access your vault.
                        </div>
                    </div>
                    <div className="grid-2" style={{ background: 'var(--bg2)', padding: '1rem', borderRadius: '8px', gap: '8px', marginBottom: '1.5rem' }}>
                        {backupCodes.map(code => (
                            <div key={code} style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600 }}>{code}</div>
                        ))}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onComplete}>
                        I've saved them, finish
                    </button>
                </div>
            )}
        </div>
    )
}
