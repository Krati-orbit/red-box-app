import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
    const { isAdmin, logout, initials, firstName } = useAuth();
    const navigate = useNavigate();

    // Secondary check: if not admin, redirect away
    if (!isAdmin) {
        return <div className="container" style={{ textAlign: 'center', padding: '100px' }}>
            <h2>🚫 Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>;
    }

    return (
        <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg1)' }}>
            {/* SIDEBAR */}
            <aside style={{
                width: '260px',
                background: 'var(--bg2)',
                borderRight: '1px solid var(--border1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 10
            }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--border1)' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--red)', fontFamily: "'Space Mono', monospace" }}>
                        RED BOX <span style={{ color: 'var(--text3)', fontSize: '0.8rem' }}>ADMIN</span>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '1rem' }}>
                        Navigation
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li className="mb-2">
                            <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                                <span style={{ marginRight: '10px' }}>📊</span> Dashboard
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink to="/admin/requests" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                                <span style={{ marginRight: '10px' }}>📁</span> Verification Requests
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                                <span style={{ marginRight: '10px' }}>👥</span> User Management
                            </NavLink>
                        </li>
                        <li className="mb-2">
                            <NavLink to="/admin/logs" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                                <span style={{ marginRight: '10px' }}>📜</span> Activity Logs
                            </NavLink>
                        </li>
                    </ul>

                    <div style={{ fontSize: '0.7rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2.5rem', marginBottom: '1rem', paddingLeft: '1rem' }}>
                        System
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        <li className="mb-2">
                            <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                                <span style={{ marginRight: '10px' }}>⚙️</span> Settings
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border1)' }}>
                    <button className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start' }} onClick={logout}>
                        <span style={{ marginRight: '10px' }}>🚪</span> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main style={{ marginLeft: '260px', flex: 1, padding: '2rem' }}>
                {/* ADMIN TOPBAR */}
                <header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '2rem' }}>
                    <div className="flex items-center gap-4">
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{firstName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Administrator</div>
                        </div>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'var(--red)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'white', fontSize: '0.9rem'
                        }}>
                            {initials}
                        </div>
                    </div>
                </header>

                <div className="admin-content-fade">
                    <Outlet />
                </div>
            </main>

            <style>{`
                .admin-nav-link {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    color: var(--text2);
                    text-decoration: none;
                    transition: all 0.2s ease;
                    font-size: 0.95rem;
                }
                .admin-nav-link:hover {
                    background: var(--bg3);
                    color: var(--text1);
                }
                .admin-nav-link.active {
                    background: var(--red-muted);
                    color: var(--red);
                    font-weight: 600;
                }
                .admin-content-fade {
                    animation: adminFadeIn 0.4s ease-out;
                }
                @keyframes adminFadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
