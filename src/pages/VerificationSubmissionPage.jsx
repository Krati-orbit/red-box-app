import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function VerificationSubmissionPage() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [deceasedEmail, setDeceasedEmail] = useState('');
    const [deceasedName, setDeceasedName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [dateOfDeath, setDateOfDeath] = useState('');
    const [deathCert, setDeathCert] = useState(null);
    const [idProof, setIdProof] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!deathCert || !idProof) {
            showToast('⚠️ Please upload both the death certificate and ID proof.');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload files to Storage
            const requestId = `REQ-${Date.now()}`;
            const dcRef = ref(storage, `verification_docs/${requestId}/death_certificate`);
            const idRef = ref(storage, `verification_docs/${requestId}/id_proof`);

            await uploadBytes(dcRef, deathCert);
            await uploadBytes(idRef, idProof);

            const deathCertURL = await getDownloadURL(dcRef);
            const idProofURL = await getDownloadURL(idRef);

            // 2. Create request in Firestore
            await addDoc(collection(db, 'verificationRequests'), {
                requestId,
                beneficiaryId: user.uid,
                beneficiaryName: user.displayName,
                beneficiaryEmail: user.email,
                deceasedEmail,
                deceasedName,
                relationship,
                dateOfDeath,
                deathCertURL,
                idProofURL,
                status: 'pending',
                requestDate: serverTimestamp(),
            });

            showToast('✅ Verification request submitted successfully. Our team will review it.');
            navigate('/dashboard');
        } catch (err) {
            console.error("Submission error:", err);
            showToast('❌ Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Submit Verification Request</h1>
                    <p className="page-subtitle">Provide details to unlock access to a Red Box vault</p>
                </div>
            </div>

            <div className="card fade-up">
                <form onSubmit={handleSubmit}>
                    <div style={{ fontWeight: 700, marginBottom: '1.5rem', color: 'var(--red)' }}>👤 Information of the Deceased</div>

                    <div className="form-group">
                        <label>Deceased's Full Name</label>
                        <input
                            type="text" className="input" required
                            value={deceasedName} onChange={e => setDeceasedName(e.target.value)}
                            placeholder="Full name as registered"
                        />
                    </div>

                    <div className="form-group">
                        <label>Deceased's Email Address</label>
                        <input
                            type="email" className="input" required
                            value={deceasedEmail} onChange={e => setDeceasedEmail(e.target.value)}
                            placeholder="Email used for Red Box account"
                        />
                    </div>

                    <div className="grid-2">
                        <div className="form-group">
                            <label>Your Relationship</label>
                            <select className="input" required value={relationship} onChange={e => setRelationship(e.target.value)}>
                                <option value="">Select...</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Legal Executor">Legal Executor</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date of Passing</label>
                            <input
                                type="date" className="input" required
                                value={dateOfDeath} onChange={e => setDateOfDeath(e.target.value)}
                            />
                        </div>
                    </div>

                    <div style={{ fontWeight: 700, margin: '2rem 0 1rem', color: 'var(--red)' }}>📄 Documentation Upload</div>

                    <div className="form-group">
                        <label>Death Certificate (PDF or Image)</label>
                        <input type="file" className="input" required onChange={e => setDeathCert(e.target.files[0])} accept="image/*,.pdf" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>Official document issued by government authorities.</div>
                    </div>

                    <div className="form-group">
                        <label>Your Government ID Proof (PDF or Image)</label>
                        <input type="file" className="input" required onChange={e => setIdProof(e.target.files[0])} accept="image/*,.pdf" />
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>Passport, Driver's License, or National ID.</div>
                    </div>

                    <div style={{ margin: '2rem 0' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text3)', lineHeight: '1.4' }}>
                            🛡️ <strong>Privacy Protection:</strong> Document access is strictly controlled. Files are stored encrypted and will only be used for verification purposes.
                        </p>
                    </div>

                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? '⏳ Submitting Request...' : '✅ Submit Verification'}
                    </button>
                </form>
            </div>
        </div>
    );
}
