import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function AdminActivityLogsPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'adminLogs'),
            orderBy('timestamp', 'desc'),
            limit(100)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const logsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLogs(logsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <div className="container">Loading logs...</div>;

    return (
        <div className="container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Admin Activity Logs</h1>
                    <p className="page-subtitle">Track all administrative actions and system updates</p>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg2)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem' }}>Admin</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                            <th style={{ padding: '1rem' }}>Target</th>
                            <th style={{ padding: '1rem' }}>Details</th>
                            <th style={{ padding: '1rem' }}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>
                                    No activity logs found.
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{log.adminName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>ID: {log.adminId?.substring(0, 8)}...</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${log.action.includes('Approved') ? 'badge-green' :
                                                log.action.includes('Rejected') ? 'badge-red' : 'badge-blue'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{log.targetId}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', maxWidth: '300px' }}>{log.details}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text3)' }}>
                                        {log.timestamp?.toDate().toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
