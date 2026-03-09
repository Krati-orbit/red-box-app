import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

export default function DocumentsPage() {
    const { docs, deleteDoc } = useData()
    const { showToast } = useToast()
    const navigate = useNavigate()

    function handleDelete(id) {
        deleteDoc(id)
        showToast('🗑️ Document deleted')
    }

    return (
        <div className="container">
            <div className="page-header fade-up">
                <div>
                    <div className="page-title">Documents</div>
                    <div className="page-subtitle">
                        {docs.length === 0 ? 'No documents yet' : `${docs.length} file${docs.length !== 1 ? 's' : ''} secured and encrypted`}
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/upload')}>📤 Upload Document</button>
            </div>

            <div className="alert alert-blue mb-6 fade-up">
                <div className="alert-icon">🔐</div>
                <div className="alert-text"><strong>All files are encrypted</strong> client-side before upload. Only you — and your chosen beneficiaries after verification — can access them.</div>
            </div>

            <div className="fade-up delay-1">
                {docs.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <div className="empty-title">No documents yet</div>
                        <div className="empty-sub">Upload your first document to get started.</div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/upload')}>📤 Upload Document</button>
                    </div>
                ) : docs.map((doc) => (
                    <div key={doc.id} className="doc-row">
                        <div className="doc-icon">{doc.icon}</div>
                        <div className="doc-info">
                            <div className="doc-name">{doc.name}</div>
                            <div className="doc-meta">🔒 AES-256 · {doc.file} · Added {doc.addedAt}</div>
                        </div>
                        <div className="doc-actions">
                            <span className={`badge ${doc.tagClass}`}>{doc.tag}</span>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id)}>🗑️</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
