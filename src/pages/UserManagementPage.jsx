import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function UserManagementPage() {
    const { isSuperAdmin, user: adminUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { showToast } = useToast();

    useEffect(() => {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return unsub;
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!isSuperAdmin) {
            showToast('🚫 Only Superadmins can change roles');
            return;
        }
        try {
            await updateDoc(doc(db, 'users', userId), { role: newRole });

            // Log action
            await addDoc(collection(db, 'adminLogs'), {
                adminId: adminUser.uid,
                adminName: adminUser.displayName || adminUser.email,
                action: 'Role Changed',
                targetId: userId,
                details: `Role changed to ${newRole}`,
                timestamp: serverTimestamp()
            });

            showToast(`✅ Role updated to ${newRole}`);
        } catch (err) {
            console.error(err);
            showToast('❌ Failed to update role');
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await updateDoc(doc(db, 'users', userId), {
                isActive: newStatus
            });

            // Log action
            await addDoc(collection(db, 'adminLogs'), {
                adminId: adminUser.uid,
                adminName: adminUser.displayName || adminUser.email,
                action: newStatus ? 'User Activated' : 'User Deactivated',
                targetId: userId,
                details: `Manual status override`,
                timestamp: serverTimestamp()
            });

            showToast(`✅ User ${newStatus ? 'Activated' : 'Deactivated'}`);
        } catch (err) {
            console.error(err);
            showToast('❌ Failed to update status');
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div>Loading user directory...</div>;

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Monitor activity and manage system access</p>
                </div>
                <div className="input-icon-wrap" style={{ width: '300px' }}>
                    <span className="input-icon">🔍</span>
                    <input
                        type="text"
                        className="input input-sm"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="card">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border1)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>USER</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>ROLE</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>STATUS</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>LAST CHECK-IN</th>
                                <th style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text3)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid var(--border1)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{user.displayName || 'No Name'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{user.email}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {isSuperAdmin ? (
                                            <select
                                                className="input input-sm"
                                                style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                                                value={user.role || 'user'}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                                <option value="superadmin">Superadmin</option>
                                            </select>
                                        ) : (
                                            <span style={{ textTransform: 'capitalize' }}>{user.role || 'user'}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${user.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                                            {user.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                                        {user.lastCheckIn ? user.lastCheckIn.toDate().toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div className="flex gap-2">
                                            <button
                                                className={`btn btn-sm ${user.isActive === false ? 'btn-primary' : 'btn-ghost'}`}
                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                            >
                                                {user.isActive === false ? 'Activate' : 'Deactivate'}
                                            </button>
                                        </div>
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
