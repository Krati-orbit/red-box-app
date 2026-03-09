import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useToast } from '../context/ToastContext';

import { useNavigate } from 'react-router-dom';

export default function VerificationRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(
            collection(db, 'verificationRequests'),
            orderBy('requestDate', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        return unsub;
    }, []);

    const filteredRequests = requests.filter(req =>
        filter === 'all' ? true : req.status === filter
    );

    if (loading) return <div>Loading requests...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Verification Requests</h1>
                    <p className="page-subtitle">Manage beneficiary access requests and death certificates</p>
                </div>
                <div className="flex gap-2">
                    {['all', 'pending', 'under_review', 'approved', 'rejected'].map(s => (
                        <button
                            key={s}
                            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setFilter(s)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border1)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>REQUEST ID</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>BENEFICIARY</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>USER (DECEASED)</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>DATE</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>STATUS</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRequests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--border1)' }}>
                                    <td style={{ padding: '1rem', fontSize: '0.75rem', fontFamily: 'monospace' }}>#{req.id.slice(0, 8)}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{req.beneficiaryName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{req.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>{req.userName}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                        {req.requestDate?.toDate().toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${req.status === 'pending' ? 'badge-red' :
                                            req.status === 'approved' ? 'badge-green' :
                                                req.status === 'under_review' ? 'badge-blue' : 'badge-gray'
                                            }`}>
                                            {req.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/requests/${req.id}`)}>Review Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
