import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'
import {
    validateBeneficiaryForm, validateName, validateEmail,
    validatePhone, validateProfession, validateDob,
    validateAddress, validateIdNumber, validateNotes
} from '../utils/validators'

function FieldError({ msg }) {
    if (!msg) return null
    return <div className="field-error">{msg}</div>
}

export default function EditBeneficiaryPage() {
    const { id } = useParams()
    const { bens, updateBen } = useData()
    const { showToast } = useToast()
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [relation, setRelation] = useState('')
    const [phone, setPhone] = useState('')
    const [altPhone, setAltPhone] = useState('')
    const [profession, setProfession] = useState('')
    const [dob, setDob] = useState('')
    const [address, setAddress] = useState('')
    const [idType, setIdType] = useState('')
    const [idNumber, setIdNumber] = useState('')
    const [nomineeCondition, setNomineeCondition] = useState('')
    const [notes, setNotes] = useState('')
    const [activeTab, setActiveTab] = useState('basic')
    const [loaded, setLoaded] = useState(false)
    const [errors, setErrors] = useState({})

    // Guard: pre-fill only once — Firestore updates must not reset the form
    const hasLoaded = useRef(false)

    useEffect(() => {
        if (hasLoaded.current) return
        if (!bens.length) return
        const ben = bens.find(b => b.id === id)
        if (!ben) {
            showToast('❌ Beneficiary not found')
            navigate('/beneficiaries')
            return
        }
        setName(ben.name || '')
        setEmail(ben.email || '')
        setRelation(ben.relation || '')
        setPhone(ben.phone || '')
        setAltPhone(ben.altPhone || '')
        setProfession(ben.profession || '')
        setDob(ben.dob || '')
        setAddress(ben.address || '')
        setIdType(ben.idType || '')
        setIdNumber(ben.idNumber || '')
        setNomineeCondition(ben.nomineeCondition || '')
        setNotes(ben.notes || '')
        setLoaded(true)
        hasLoaded.current = true
    }, [bens, id])

    function touch(field, validator, ...args) {
        setErrors(prev => ({ ...prev, [field]: validator(...args) }))
    }
    function touchId() {
        setErrors(prev => ({ ...prev, idNumber: validateIdNumber(idType, idNumber) }))
    }

    async function handleUpdate(e) {
        e.preventDefault()
        const errs = validateBeneficiaryForm({ name, email, phone, altPhone, profession, dob, address, idType, idNumber, notes })
        if (!relation) errs.relation = 'Please select a relationship'
        if (Object.keys(errs).length > 0) {
            setErrors(errs)
            const basicFields = ['name', 'email', 'phone', 'altPhone', 'relation']
            const personalFields = ['profession', 'dob', 'address']
            const firstErr = Object.keys(errs)[0]
            if (basicFields.includes(firstErr)) setActiveTab('basic')
            else if (personalFields.includes(firstErr)) setActiveTab('personal')
            else setActiveTab('identity')
            showToast('⚠️ Please fix the highlighted errors')
            return
        }
        const initials = name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('')
        await updateBen(id, {
            name: name.trim(), email: email.trim(), phone: phone.trim(),
            altPhone: altPhone.trim(), relation, profession: profession.trim(),
            dob, address: address.trim(), idType,
            idNumber: idNumber.trim().toUpperCase(),
            nomineeCondition, notes: notes.trim(), initials,
        })
        showToast('✅ Beneficiary updated!')
        navigate('/beneficiaries')
    }

    const tabs = [
        { id: 'basic', label: '👤 Basic Info' },
        { id: 'personal', label: '📋 Personal Details' },
        { id: 'identity', label: '🪪 Identity & Notes' },
    ]

    if (!loaded) {
        return (
            <div className="container" style={{ maxWidth: '640px' }}>
                <div className="page-header fade-up"><div className="page-title">Edit Beneficiary</div></div>
                <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text2)' }}>
                    ⏳ Loading beneficiary details…
                </div>
            </div>
        )
    }

    return (
        <div className="container" style={{ maxWidth: '640px' }}>
            <div className="page-header fade-up">
                <div>
                    <div className="page-title">Edit Beneficiary</div>
                    <div className="page-subtitle">Update details for <strong>{name}</strong></div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/beneficiaries')}>← Back</button>
            </div>

            <div className="card fade-up" style={{ padding: '0' }}>
                <div className="ben-form-tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} type="button"
                            className={`ben-form-tab${activeTab === tab.id ? ' active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleUpdate} style={{ padding: '1.75rem' }}>
                    {/* ── TAB 1: BASIC INFO ── */}
                    {activeTab === 'basic' && (
                        <div>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <div className="input-icon-wrap"><span className="input-icon">👤</span>
                                    <input className={`input${errors.name ? ' input-error' : ''}`}
                                        type="text" placeholder="e.g., Priya Sharma" value={name}
                                        onChange={e => setName(e.target.value)}
                                        onBlur={() => touch('name', validateName, name)} />
                                </div>
                                <FieldError msg={errors.name} />
                            </div>
                            <div className="form-group">
                                <label>Email Address *</label>
                                <div className="input-icon-wrap"><span className="input-icon">✉️</span>
                                    <input className={`input${errors.email ? ' input-error' : ''}`}
                                        type="email" placeholder="priya@example.com" value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        onBlur={() => touch('email', validateEmail, email)} />
                                </div>
                                <FieldError msg={errors.email} />
                            </div>
                            <div className="form-group">
                                <label>Primary Phone</label>
                                <div className="input-icon-wrap"><span className="input-icon">📱</span>
                                    <input className={`input${errors.phone ? ' input-error' : ''}`}
                                        type="tel" placeholder="+91 98765 43210" value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        onBlur={() => touch('phone', validatePhone, phone)} />
                                </div>
                                <FieldError msg={errors.phone} />
                            </div>
                            <div className="form-group">
                                <label>Alternate Phone</label>
                                <div className="input-icon-wrap"><span className="input-icon">📞</span>
                                    <input className={`input${errors.altPhone ? ' input-error' : ''}`}
                                        type="tel" placeholder="Secondary number (optional)" value={altPhone}
                                        onChange={e => setAltPhone(e.target.value)}
                                        onBlur={() => touch('altPhone', validatePhone, altPhone)} />
                                </div>
                                <FieldError msg={errors.altPhone} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Relationship *</label>
                                <select className={`input${errors.relation ? ' input-error' : ''}`}
                                    value={relation}
                                    onChange={e => { setRelation(e.target.value); setErrors(p => ({ ...p, relation: null })) }}>
                                    <option value="">Select relationship...</option>
                                    <option>Spouse</option><option>Child</option>
                                    <option>Parent</option><option>Sibling</option>
                                    <option>Friend</option><option>Lawyer</option>
                                    <option>Executor</option><option>Financial Advisor</option>
                                    <option>Other</option>
                                </select>
                                <FieldError msg={errors.relation} />
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: PERSONAL DETAILS ── */}
                    {activeTab === 'personal' && (
                        <div>
                            <div className="form-group">
                                <label>Profession / Occupation</label>
                                <div className="input-icon-wrap"><span className="input-icon">💼</span>
                                    <input className={`input${errors.profession ? ' input-error' : ''}`}
                                        type="text" placeholder="e.g., Doctor, Engineer" value={profession}
                                        onChange={e => setProfession(e.target.value)}
                                        onBlur={() => touch('profession', validateProfession, profession)} />
                                </div>
                                <FieldError msg={errors.profession} />
                            </div>
                            <div className="form-group">
                                <label>Date of Birth</label>
                                <div className="input-icon-wrap"><span className="input-icon">🎂</span>
                                    <input className={`input${errors.dob ? ' input-error' : ''}`}
                                        type="date" value={dob} style={{ colorScheme: 'dark' }}
                                        onChange={e => setDob(e.target.value)}
                                        onBlur={() => touch('dob', validateDob, dob)} />
                                </div>
                                <FieldError msg={errors.dob} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Home Address</label>
                                <div className="input-icon-wrap">
                                    <span className="input-icon" style={{ top: '1rem', transform: 'none' }}>🏠</span>
                                    <textarea className={`input${errors.address ? ' input-error' : ''}`}
                                        placeholder="Full residential address…"
                                        style={{ paddingLeft: '42px', minHeight: '90px' }}
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        onBlur={() => touch('address', validateAddress, address)} />
                                </div>
                                <FieldError msg={errors.address} />
                                <div className="text-xs text-muted mt-1">Include house/flat no., street, city, state, PIN</div>
                            </div>
                        </div>
                    )}

                    {/* ── TAB 3: IDENTITY & NOTES ── */}
                    {activeTab === 'identity' && (
                        <div>
                            <div className="ben-form-identity-note mb-4">
                                <span>🔐</span><span>Identity details help verify the beneficiary. Visible only to you.</span>
                            </div>
                            <div className="form-group">
                                <label>ID Document Type</label>
                                <select className="input" value={idType}
                                    onChange={e => { setIdType(e.target.value); touchId() }}>
                                    <option value="">Select ID type...</option>
                                    <option>Aadhaar Card</option><option>PAN Card</option>
                                    <option>Passport</option><option>Voter ID</option>
                                    <option>Driving Licence</option><option>National ID</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>ID Number</label>
                                <div className="input-icon-wrap"><span className="input-icon">🪪</span>
                                    <input className={`input${errors.idNumber ? ' input-error' : ''}`}
                                        type="text"
                                        placeholder={
                                            idType === 'Aadhaar Card' ? '12 digits' :
                                                idType === 'PAN Card' ? 'Format: ABCDE1234F' :
                                                    idType === 'Passport' ? 'e.g. A1234567' :
                                                        idType === 'Voter ID' ? 'e.g. ABC1234567' :
                                                            'Enter ID document number'
                                        }
                                        value={idNumber}
                                        onChange={e => setIdNumber(e.target.value)}
                                        onBlur={touchId} />
                                </div>
                                <FieldError msg={errors.idNumber} />
                                <div className="text-xs text-muted mt-1">Stored securely, never shared with third parties</div>
                            </div>
                            <div className="form-group">
                                <label>Nominee Condition <span className="ben-optional-badge">optional</span></label>
                                <div className="ben-nominee-hint mb-2">🏷️ Select the death scenario under which this person becomes the nominee</div>
                                <select className="input" value={nomineeCondition} onChange={e => setNomineeCondition(e.target.value)}>
                                    <option value="">Not specified / Any condition</option>
                                    <optgroup label="Natural Causes">
                                        <option value="natural_old_age">Natural Death — Old Age</option>
                                        <option value="natural_illness">Natural Death — Illness / Disease</option>
                                        <option value="natural_cardiac">Natural Death — Cardiac Arrest</option>
                                    </optgroup>
                                    <optgroup label="Accidental">
                                        <option value="accident_road">Accidental Death — Road / Vehicle</option>
                                        <option value="accident_workplace">Accidental Death — Workplace</option>
                                        <option value="accident_drowning">Accidental Death — Drowning</option>
                                        <option value="accident_other">Accidental Death — Other</option>
                                    </optgroup>
                                    <optgroup label="Critical Illness">
                                        <option value="illness_cancer">Critical Illness — Cancer</option>
                                        <option value="illness_stroke">Critical Illness — Stroke</option>
                                        <option value="illness_organ_failure">Critical Illness — Organ Failure</option>
                                    </optgroup>
                                    <optgroup label="Other">
                                        <option value="suicide">Suicide</option>
                                        <option value="homicide">Homicide / Murder</option>
                                        <option value="terminal_illness">Terminal / Chronic Illness</option>
                                        <option value="any">Any Cause of Death</option>
                                        <option value="custom">Other (specify in notes)</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Special Notes / Instructions</label>
                                <textarea className={`input${errors.notes ? ' input-error' : ''}`}
                                    rows={4} placeholder="Any special instructions, conditions, or notes…"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    onBlur={() => touch('notes', validateNotes, notes)} />
                                <FieldError msg={errors.notes} />
                                <div className="text-xs text-muted mt-1">{notes.length}/1000 characters</div>
                            </div>
                        </div>
                    )}

                    {/* Tab Navigation */}
                    <div className="ben-form-actions">
                        {activeTab !== 'basic' && (
                            <button type="button" className="btn btn-ghost"
                                onClick={() => setActiveTab(activeTab === 'identity' ? 'personal' : 'basic')}>
                                ← Previous
                            </button>
                        )}
                        {activeTab !== 'identity' && (
                            <button type="button" className="btn btn-ghost"
                                onClick={() => setActiveTab(activeTab === 'basic' ? 'personal' : 'identity')}
                                style={{ marginLeft: activeTab === 'basic' ? 'auto' : undefined }}>
                                Next →
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Always-visible Save footer */}
            <div className="flex gap-3 mt-4 fade-up">
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpdate}>
                    💾 Save Changes
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => navigate('/beneficiaries')}>Cancel</button>
            </div>
        </div>
    )
}
