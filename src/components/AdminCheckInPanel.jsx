import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '../context/ToastContext';

export default function AdminCheckInPanel() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [triggering, setTriggering] = useState(null); // userId of user being triggered

    useEffect(() => {
        const fetchInactiveUsers = async () => {
            try {
                // Find users who haven't checked in for a long time or are marked inactive
                // For demo, we'll just fetch all users for now if there aren't many
                const q = query(collection(db, 'users'));
                const querySnapshot = await getDocs(q);
                const userList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(userList);
            } catch (error) {
                console.error("Error fetching users:", error);
                showToast('❌ Failed to load user list.');
            } finally {
                setLoading(false);
            }
        };
        fetchInactiveUsers();
    }, []);

    const triggerManualEmail = async (userId) => {
        setTriggering(userId);
        try {
            const functions = getFunctions();
            const triggerFn = httpsCallable(functions, 'triggerManualCheckIn');
            await triggerFn({ userId });
            showToast('📩 Manual check-in reminder sent!');
        } catch (error) {
            console.error("Error triggering email:", error);
            showToast('❌ Failed to send manual email.');
        } finally {
            setTriggering(null);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                isActive: !currentStatus
            });
            setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
            showToast(`✅ User marked as ${!currentStatus ? 'Active' : 'Inactive'}`);
        } catch (error) {
            console.error("Error updating status:", error);
            showToast('❌ Failed to update status.');
        }
    };

    if (loading) return <div>Loading Admin Panel...</div>;

    return (
        <div className="card fade-up">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: "'Space Mono', monospace" }}>🛡️ Admin Check-in Control</h3>
            <p className="text-dim mb-4">Monitor user activity and manage check-in processes.</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>User</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>Status</th>
                            <th style={{ padding: '10px' }}>Last Check-in</th>
                            <th style={{ padding: '10px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                <td style={{ padding: '10px' }}>{user.displayName || user.firstName || 'User'}</td>
                                <td style={{ padding: '10px' }}>{user.email}</td>
                                <td style={{ padding: '10px' }}>
                                    <span className={`badge ${user.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', fontSize: '0.85rem' }}>
                                    {user.lastCheckIn ? user.lastCheckIn.toDate().toLocaleDateString() : 'Never'}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => triggerManualEmail(user.id)}
                                            disabled={triggering === user.id}
                                        >
                                            {triggering === user.id ? '...' : '📩 Reminder'}
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => toggleStatus(user.id, user.isActive !== false)}
                                        >
                                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
