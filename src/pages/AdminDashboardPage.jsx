import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        pendingRequests: 0,
        approvedRequests: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalDocs: 0
    });
    const [loading, setLoading] = useState(true);
    const [recentRequests, setRecentRequests] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch stats (Real implementation would count docs, here we simulate/get limited)
                const reqSnap = await getDocs(collection(db, 'verificationRequests'));
                const requests = reqSnap.docs.map(d => ({ id: d.id, ...d.data() }));

                const userSnap = await getDocs(collection(db, 'users'));
                const users = userSnap.docs.map(d => d.data());

                setStats({
                    pendingRequests: requests.filter(r => r.status === 'pending').length,
                    approvedRequests: requests.filter(r => r.status === 'approved').length,
                    activeUsers: users.filter(u => u.isActive !== false).length,
                    inactiveUsers: users.filter(u => u.isActive === false).length,
                    totalDocs: users.reduce((acc, curr) => acc + (curr.docCount || 0), 0)
                });

                setRecentRequests(requests.slice(0, 5).sort((a, b) => (b.requestDate?.seconds || 0) - (a.requestDate?.seconds || 0)));
            } catch (err) {
                console.error("Error fetching admin stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Loading statistics...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Welcome to the Red Box central command</p>
                </div>
            </div>

            <div className="grid-3 mb-8">
                <div className="card">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pending Requests</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: stats.pendingRequests > 0 ? 'var(--red)' : 'inherit' }}>
                        {stats.pendingRequests}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Active Users</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green)' }}>
                        {stats.activeUsers}
                    </div>
                </div>
                <div className="card">
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Documents</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800 }}>
                        {stats.totalDocs}
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h3 style={{ margin: 0, fontFamily: "'Space Mono', monospace" }}>Recent Verification Requests</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/requests')}>View All →</button>
                </div>

                {recentRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text3)' }}>
                        No pending requests found.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border1)', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>BENEFICIARY</th>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>USER</th>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>DATE</th>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>STATUS</th>
                                    <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border1)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{req.beneficiaryName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{req.beneficiaryEmail}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{req.deceasedName || 'Unknown'}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                            {req.requestDate?.toDate().toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge ${req.status === 'pending' ? 'badge-red' :
                                                req.status === 'approved' ? 'badge-green' : 'badge-gray'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/admin/requests/${req.id}`)}>Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
