import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function CheckInSuccess() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Invalid check-in link. No token provided.');
                return;
            }

            try {
                // We call our Cloud Function locally or on production
                // In production, this would be the actual function URL
                const response = await fetch(`https://us-central1-red-boxx.cloudfunctions.net/verifyCheckInToken?token=${token}`);
                const data = await response.json();

                if (data.success) {
                    setStatus('success');
                    setMessage('Your check-in has been recorded. Your account is active.');
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed. The link may have expired.');
                }
            } catch (error) {
                console.error("Verification error:", error);

                // For DEMO purposes, if the function isn't deployed yet, 
                // we'll show a "Simulated Success" if we're on localhost
                if (window.location.hostname === 'localhost') {
                    setStatus('success');
                    setMessage('[SIMULATION] Check-in successful! (Function URL not yet active)');
                } else {
                    setStatus('error');
                    setMessage('Unable to reach the verification server.');
                }
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <div className="card fade-up" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '3rem' }}>
                {status === 'verifying' && (
                    <>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⌛</div>
                        <h2 className="page-title">Verifying...</h2>
                        <p className="text-dim">Please wait while we secure your account.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
                        <h2 className="page-title" style={{ color: 'var(--green)' }}>Success!</h2>
                        <p className="mb-6">{message}</p>
                        <button className="btn btn-primary w-full" onClick={() => navigate('/dashboard')}>
                            Go to Dashboard
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
                        <h2 className="page-title" style={{ color: 'var(--red)' }}>Oops!</h2>
                        <p className="mb-6">{message}</p>
                        <button className="btn btn-secondary w-full" onClick={() => navigate('/login')}>
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
