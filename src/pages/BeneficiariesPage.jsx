import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

// Human-friendly label map for nominee condition values
const NOMINEE_CONDITION_LABELS = {
    '': 'Any / Not specified',
    'natural_old_age': 'Natural Death — Old Age',
    'natural_illness': 'Natural Death — Illness / Disease',
    'natural_cardiac': 'Natural Death — Cardiac Arrest',
    'accident_road': 'Accidental — Road / Vehicle',
    'accident_workplace': 'Accidental — Workplace',
    'accident_drowning': 'Accidental — Drowning',
    'accident_other': 'Accidental — Other',
    'illness_cancer': 'Critical Illness — Cancer',
    'illness_stroke': 'Critical Illness — Stroke',
    'illness_organ_failure': 'Critical Illness — Organ Failure',
    'suicide': 'Suicide',
    'homicide': 'Homicide / Murder',
    'terminal_illness': 'Terminal / Chronic Illness',
    'any': 'Any Cause of Death',
    'custom': 'Other (see notes)',
}

export default function BeneficiariesPage() {
    const { bens, deleteBen } = useData()
    const { showToast } = useToast()
    const navigate = useNavigate()

    // Track which beneficiary card is expanded (by id, or null)
    const [expandedId, setExpandedId] = useState(null)

    function handleDelete(id) {
        deleteBen(id)
        if (expandedId === id) setExpandedId(null)
        showToast('🗑️ Beneficiary removed')
    }

    function toggleExpand(id) {
        setExpandedId(prev => prev === id ? null : id)
    }

    return (
        <div className="container">
            <div className="page-header fade-up">
                <div>
                    <div className="page-title">Beneficiaries</div>
                    <div className="page-subtitle">
                        {bens.length === 0
                            ? 'No beneficiaries added yet'
                            : `${bens.length} trusted contact${bens.length !== 1 ? 's' : ''} secured`}
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/beneficiaries/add')}>➕ Add Beneficiary</button>
            </div>

            <div className="alert alert-blue mb-6 fade-up">
                <div className="alert-icon">🔒</div>
                <div className="alert-text">
                    Beneficiary details are stored privately in your account.
                    They are notified and given access only <strong>after manual verification</strong>.
                </div>
            </div>

            <div className="fade-up delay-1">
                {bens.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <div className="empty-title">No beneficiaries yet</div>
                        <div className="empty-sub">Add trusted contacts who can access your documents.</div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/beneficiaries/add')}>➕ Add Beneficiary</button>
                    </div>
                ) : bens.map((ben) => (
                    <div key={ben.id} className={`ben-card${expandedId === ben.id ? ' ben-card--expanded' : ''}`}>
                        {/* ── CARD HEADER ── */}
                        <div className="ben-card-header">
                            <div className="ben-avatar">{ben.initials}</div>
                            <div className="ben-info">
                                <div className="ben-name">{ben.name}</div>
                                <div className="ben-detail">
                                    {ben.relation}
                                    {ben.profession ? ` · ${ben.profession}` : ''}
                                    {' · '}{ben.email}
                                    {ben.phone ? ' · ' + ben.phone : ''}
                                </div>
                                {ben.updatedAt && (
                                    <div className="text-xs" style={{ color: 'var(--text3)', marginTop: '2px' }}>
                                        ✏️ Updated {new Date(ben.updatedAt.toDate?.() ?? ben.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className="badge badge-green">Active</span>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    title="Edit beneficiary details"
                                    onClick={() => navigate(`/beneficiaries/edit/${ben.id}`)}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    title={expandedId === ben.id ? 'Collapse' : 'View Details'}
                                    onClick={() => toggleExpand(ben.id)}
                                >
                                    {expandedId === ben.id ? '▲ Hide' : '▼ Details'}
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ben.id)}>🗑️</button>
                            </div>
                        </div>

                        {/* ── EXPANDED DETAILS PANEL ── */}
                        {expandedId === ben.id && (
                            <div className="ben-detail-panel">
                                <div className="ben-detail-grid">

                                    {/* Contact */}
                                    <div className="ben-detail-section">
                                        <div className="ben-detail-section-title">📱 Contact</div>
                                        <div className="ben-detail-row">
                                            <span className="ben-detail-label">Email</span>
                                            <span className="ben-detail-value">{ben.email || '—'}</span>
                                        </div>
                                        <div className="ben-detail-row">
                                            <span className="ben-detail-label">Phone</span>
                                            <span className="ben-detail-value">{ben.phone || '—'}</span>
                                        </div>
                                        {ben.altPhone && (
                                            <div className="ben-detail-row">
                                                <span className="ben-detail-label">Alt. Phone</span>
                                                <span className="ben-detail-value">{ben.altPhone}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Personal */}
                                    <div className="ben-detail-section">
                                        <div className="ben-detail-section-title">📋 Personal</div>
                                        <div className="ben-detail-row">
                                            <span className="ben-detail-label">Profession</span>
                                            <span className="ben-detail-value">{ben.profession || '—'}</span>
                                        </div>
                                        <div className="ben-detail-row">
                                            <span className="ben-detail-label">Date of Birth</span>
                                            <span className="ben-detail-value">
                                                {ben.dob
                                                    ? new Date(ben.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                                    : '—'}
                                            </span>
                                        </div>
                                        {ben.address && (
                                            <div className="ben-detail-row">
                                                <span className="ben-detail-label">Address</span>
                                                <span className="ben-detail-value" style={{ whiteSpace: 'pre-wrap' }}>{ben.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Identity & Nomination */}
                                    {(ben.idType || ben.idNumber || ben.nomineeCondition !== undefined) && (
                                        <div className="ben-detail-section">
                                            <div className="ben-detail-section-title">🪪 Identity & Nomination</div>
                                            {ben.idType && (
                                                <div className="ben-detail-row">
                                                    <span className="ben-detail-label">ID Type</span>
                                                    <span className="ben-detail-value">{ben.idType}</span>
                                                </div>
                                            )}
                                            {ben.idNumber && (
                                                <div className="ben-detail-row">
                                                    <span className="ben-detail-label">ID Number</span>
                                                    <span className="ben-detail-value ben-id-masked">
                                                        {'•'.repeat(Math.max(0, ben.idNumber.length - 4)) + ben.idNumber.slice(-4)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="ben-detail-row">
                                                <span className="ben-detail-label">Nominee Condition</span>
                                                {ben.nomineeCondition ? (
                                                    <span className="ben-nominee-tag">
                                                        ⚠️ {NOMINEE_CONDITION_LABELS[ben.nomineeCondition] ?? ben.nomineeCondition}
                                                    </span>
                                                ) : (
                                                    <span className="ben-detail-value text-muted">Any / Not specified</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                </div>

                                {/* Notes */}
                                {ben.notes && (
                                    <div className="ben-notes-block">
                                        <div className="ben-detail-section-title" style={{ marginBottom: '8px' }}>📝 Notes & Instructions</div>
                                        <div className="ben-notes-text">{ben.notes}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
