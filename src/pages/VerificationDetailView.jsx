import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function VerificationDetailView() {
    const { requestId } = useParams();
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        const fetchRequest = async () => {
            try {
                const docSnap = await getDoc(doc(db, 'verificationRequests', requestId));
                if (docSnap.exists()) {
                    setRequest({ id: docSnap.id, ...docSnap.data() });
                    setAdminNotes(docSnap.data().adminNotes || '');
                } else {
                    showToast('❌ Request not found.');
                    navigate('/admin/requests');
                }
            } catch (err) {
                console.error("Error fetching request:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [requestId]);

    const handleAction = async (status) => {
        if (!adminNotes && status === 'rejected') {
            showToast('⚠️ Please provide a reason in the notes for rejection.');
            return;
        }

        setActionLoading(true);
        try {
            const reqRef = doc(db, 'verificationRequests', requestId);
            await updateDoc(reqRef, {
                status,
                adminNotes,
                verifiedBy: user.uid,
                verifiedAt: serverTimestamp()
            });

            // Log activity
            await addDoc(collection(db, 'adminLogs'), {
                adminId: user.uid,
                adminName: user.displayName,
                action: `Verification ${status}`,
                targetId: requestId,
                details: `Request for deceased: ${request.deceasedName}. Notes: ${adminNotes}`,
                timestamp: serverTimestamp()
            });

            showToast(`✅ Request ${status} successfully.`);
            navigate('/admin/requests');
        } catch (err) {
            console.error("Action error:", err);
            showToast('❌ Failed to update request status.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div>Loading request details...</div>;
    if (!request) return null;

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Review Request #{request.requestId}</h1>
                    <p className="page-subtitle">Submitted on {request.requestDate?.toDate().toLocaleString()}</p>
                </div>
                <button className="btn btn-ghost" onClick={() => navigate('/admin/requests')}>← Back to List</button>
            </div>

            <div className="grid-2 mb-6">
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--red)' }}>👤 Deceased Person</div>
                    <div className="mb-2"><strong>Name:</strong> {request.deceasedName}</div>
                    <div className="mb-2"><strong>Email:</strong> {request.deceasedEmail}</div>
                    <div className="mb-2"><strong>Date of Death:</strong> {request.dateOfDeath}</div>
                </div>
                <div className="card">
                    <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--blue)' }}>🏠 Beneficiary (Claimant)</div>
                    <div className="mb-2"><strong>Name:</strong> {request.beneficiaryName}</div>
                    <div className="mb-2"><strong>Relationship:</strong> {request.relationship}</div>
                    <div className="mb-2"><strong>Email:</strong> {request.beneficiaryEmail}</div>
                </div>
            </div>

            <div className="card mb-6">
                <div style={{ fontWeight: 700, marginBottom: '1rem' }}>📄 Evidence & Documentation</div>
                <div className="flex gap-4">
                    <a href={request.deathCertURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1">
                        👁️ View Death Certificate
                    </a>
                    <a href={request.idProofURL} target="_blank" rel="noopener noreferrer" className="btn btn-secondary flex-1">
                        👁️ View Claimant ID
                    </a>
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
                    Files open in a new tab for security verification.
                </div>
            </div>

            <div className="card">
                <div style={{ fontWeight: 700, marginBottom: '1rem' }}>⚖️ Admin Verdict</div>
                <div className="form-group">
                    <label>Internal Notes / Rejection Reason</label>
                    <textarea
                        className="input" style={{ height: '100px', resize: 'vertical' }}
                        value={adminNotes} onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Add verification notes, missing info details, or rejection reasons here..."
                    />
                </div>

                <div className="flex gap-4 mt-6">
                    <button
                        className="btn btn-primary flex-1" style={{ background: 'var(--green)' }}
                        disabled={actionLoading}
                        onClick={() => handleAction('approved')}
                    >
                        ✅ Approve Request
                    </button>
                    <button
                        className="btn btn-secondary flex-1" style={{ color: 'var(--red)' }}
                        disabled={actionLoading}
                        onClick={() => handleAction('rejected')}
                    >
                        ❌ Reject Request
                    </button>
                    <button className="btn btn-ghost flex-1" disabled={actionLoading} onClick={() => handleAction('under_review')}>
                        ⏳ Mark Under Review
                    </button>
                </div>

                {request.status !== 'pending' && (
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <span className={`badge ${request.status === 'approved' ? 'badge-green' : 'badge-red'
                            }`}>
                            Current Status: {request.status.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
