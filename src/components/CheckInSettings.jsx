import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';

export default function CheckInSettings() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [settings, setSettings] = useState({
        checkInFrequency: 90,
        vacationMode: false,
        vacationUntil: '',
        backupEmails: []
    });

    const [newBackupEmail, setNewBackupEmail] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user) return;
            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user');
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr);
                    setSettings({
                        checkInFrequency: data.checkInFrequency || 90,
                        vacationMode: !!data.vacationModeUntil && new Date(data.vacationModeUntil) > new Date(),
                        vacationUntil: data.vacationModeUntil ? new Date(data.vacationModeUntil).toISOString().split('T')[0] : '',
                        backupEmails: data.backupEmails || []
                    });
                }
                setLoading(false);
                return;
            }
            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setSettings({
                        checkInFrequency: data.checkInFrequency || 90,
                        vacationMode: !!data.vacationModeUntil && data.vacationModeUntil.toDate() > new Date(),
                        vacationUntil: data.vacationModeUntil ? data.vacationModeUntil.toDate().toISOString().split('T')[0] : '',
                        backupEmails: data.backupEmails || []
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updateData = {
                checkInFrequency: settings.checkInFrequency,
                backupEmails: settings.backupEmails
            };

            if (settings.vacationMode && settings.vacationUntil) {
                updateData.vacationModeUntil = settings.vacationUntil;
            } else {
                updateData.vacationModeUntil = null;
            }

            if (user.uid.startsWith('mock_')) {
                const mockUserStr = localStorage.getItem('red_box_mock_user');
                if (mockUserStr) {
                    const data = JSON.parse(mockUserStr);
                    const updated = {
                        ...data,
                        ...updateData
                    };
                    localStorage.setItem('red_box_mock_user', JSON.stringify(updated));
                }
                showToast('✅ Settings updated successfully!');
                setSaving(false);
                return;
            }

            const firestoreUpdateData = {
                checkInFrequency: settings.checkInFrequency,
                backupEmails: settings.backupEmails
            };
            if (settings.vacationMode && settings.vacationUntil) {
                firestoreUpdateData.vacationModeUntil = Timestamp.fromDate(new Date(settings.vacationUntil));
            } else {
                firestoreUpdateData.vacationModeUntil = null;
            }

            await updateDoc(doc(db, 'users', user.uid), firestoreUpdateData);
            showToast('✅ Settings updated successfully!');
        } catch (error) {
            console.error("Error saving settings:", error);
            showToast('❌ Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    const addBackupEmail = () => {
        if (!newBackupEmail || !newBackupEmail.includes('@')) {
            showToast('⚠️ Please enter a valid email.');
            return;
        }
        if (settings.backupEmails.includes(newBackupEmail)) {
            showToast('⚠️ This email is already added.');
            return;
        }
        setSettings({
            ...settings,
            backupEmails: [...settings.backupEmails, newBackupEmail]
        });
        setNewBackupEmail('');
    };

    const removeBackupEmail = (email) => {
        setSettings({
            ...settings,
            backupEmails: settings.backupEmails.filter(e => e !== email)
        });
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="card fade-up">
            <h3 style={{ marginBottom: '1.5rem', fontFamily: "'Space Mono', monospace" }}>⏰ Check-in Settings</h3>

            <div className="form-group mb-4">
                <label className="label">Check-in Frequency</label>
                <p className="text-sm text-dim mb-2">How often should we ask if you're active?</p>
                <select
                    className="input"
                    value={settings.checkInFrequency}
                    onChange={(e) => setSettings({ ...settings, checkInFrequency: parseInt(e.target.value) })}
                >
                    <option value={30}>Every 30 Days (Strict)</option>
                    <option value={60}>Every 60 Days (Balanced)</option>
                    <option value={90}>Every 90 Days (Standard)</option>
                </select>
            </div>

            <div className="form-group mb-4">
                <label className="label flex items-center">
                    <input
                        type="checkbox"
                        checked={settings.vacationMode}
                        onChange={(e) => setSettings({ ...settings, vacationMode: e.target.checked })}
                        style={{ marginRight: '10px' }}
                    />
                    Vacation Mode (Pause Reminders)
                </label>
                {settings.vacationMode && (
                    <div className="mt-2">
                        <label className="label text-sm">Pause Until</label>
                        <input
                            type="date"
                            className="input"
                            value={settings.vacationUntil}
                            onChange={(e) => setSettings({ ...settings, vacationUntil: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-dim mt-1">Maximum 6 months from today.</p>
                    </div>
                )}
            </div>

            <div className="form-group mb-4">
                <label className="label">Backup Email Addresses</label>
                <p className="text-sm text-dim mb-2">We'll CC these addresses on urgent reminders.</p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        className="input"
                        placeholder="alt-email@example.com"
                        value={newBackupEmail}
                        onChange={(e) => setNewBackupEmail(e.target.value)}
                    />
                    <button className="btn btn-secondary btn-sm" onClick={addBackupEmail}>Add</button>
                </div>
                <div className="mt-2">
                    {settings.backupEmails.map(email => (
                        <span key={email} className="badge badge-gray mr-2 mb-2" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            {email}
                            <button
                                onClick={() => removeBackupEmail(email)}
                                style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: '5px', cursor: 'pointer', fontSize: '1.2rem' }}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <button
                className={`btn btn-primary w-full ${saving ? 'opacity-50' : ''}`}
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
    );
}
