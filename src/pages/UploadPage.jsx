// ============================================================
// FILE: src/pages/UploadPage.jsx
// ============================================================
// 📤 UPLOAD PAGE — Where users add documents to their vault (URL: "/upload")
//
// WHAT IT DOES:
//   - Lets users pick a file via drag & drop OR file browser click
//   - Lets users give the document a custom name
//   - On submit → saves the document record to Firestore via addDoc()
//   - Then navigates back to /documents
//
// KEY REACT CONCEPTS HERE:
//   1. useRef  → used to "click" the hidden file input programmatically
//   2. Drag & drop events → onDragOver, onDragLeave, onDrop
//   3. Controlled input → docName state tied to a text input
//   4. Conditional rendering → show drop zone OR file preview
//
// COMMUNICATION:
//   DataContext  → addDoc() saves the document to Firestore
//   ToastContext → showToast() for validation errors and success
//   react-router → navigate('/documents') after upload
// ============================================================

import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useToast } from '../context/ToastContext'

export default function UploadPage() {
    // ── STATE ──────────────────────────────────────────────
    // file     → the actual File object selected by the user (or null)
    //            A File object has: .name, .size, .type, etc.
    const [file, setFile] = useState(null)

    // docName → the custom name the user gives this document
    const [docName, setDocName] = useState('')

    // dragover → true when the user is hovering a file over the drop zone
    //            Used to apply a visual highlight class to the drop area
    const [dragover, setDragover] = useState(false)

    // ── REF ───────────────────────────────────────────────
    // useRef creates a "reference" to a DOM element.
    // Here we use it to reference the hidden <input type="file">.
    // When the user clicks the drop zone (which looks nice),
    // we programmatically trigger a click on the hidden file input.
    // fileInputRef.current = the actual DOM <input> element
    const fileInputRef = useRef(null)

    // ── FROM CONTEXTS ─────────────────────────────────────
    const { addDoc } = useData()          // Firestore: save document record
    const { showToast } = useToast()      // show pop-up notifications
    const navigate = useNavigate()

    // ── FILE SELECTION HANDLER ────────────────────────────
    // Called when a file is selected (from click OR drag).
    // 'f' is the File object from the browser's file picker.
    function handleFile(f) {
        if (f) setFile(f)   // only update state if a file was actually given
    }

    // ── DRAG & DROP HANDLERS ──────────────────────────────
    function handleDrop(e) {
        e.preventDefault()         // prevent browser from opening the file
        setDragover(false)         // remove the visual highlight
        // e.dataTransfer.files = the files that were dragged
        // [0] = take the first file only
        handleFile(e.dataTransfer.files[0])
    }

    // ── UPLOAD HANDLER ────────────────────────────────────
    // Called when the user clicks "Upload Document" button.
    // Validates, then saves to Firestore via DataContext.
    function handleUpload() {
        // Validation: both fields are required
        if (!docName.trim()) { showToast('⚠️ Please enter a document name'); return }
        if (!file) { showToast('⚠️ Please select a file first'); return }

        // Call addDoc() from DataContext — this saves to Firestore.
        // We pass an object with all the document's metadata.
        // NOTE: The actual file is NOT uploaded to any server yet —
        // in this version we just store the metadata (name, filename, etc.)
        addDoc({
            name: docName.trim(),   // the custom name (e.g. "My Will")
            file: file.name,        // the original filename (e.g. "will.pdf")
            // toLocaleDateString formats the current date as "25 Feb 2026"
            addedAt: new Date().toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            }),
            icon: '📄',             // icon shown in the list
            tag: 'Document',        // badge text
            tagClass: 'badge-gray'  // badge CSS class
        })

        showToast('🔒 Document encrypted & uploaded!')
        navigate('/documents')      // go back to the documents list
    }

    // ── JSX ───────────────────────────────────────────────
    return (
        <div className="container" style={{ maxWidth: '680px' }}>
            <div className="page-header fade-up">
                <div>
                    <div className="page-title">Upload Document</div>
                    <div className="page-subtitle">Files are encrypted in your browser before upload</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/documents')}>← Back</button>
            </div>

            <div className="card fade-up">
                {/* CONDITIONAL RENDERING:
                    If no file selected → show the drop zone
                    If file selected   → show the file preview row
                    The condition is: !file (exclamation = "not") */}
                {!file ? (
                    /* ── DROP ZONE ─────────────────────────────────
                       A div styled to look like a file drop area.
                       Events:
                       - onClick → triggers the hidden file input click via ref
                       - onDragOver → fires while file is dragged over this div
                       - onDragLeave → fires when file moves away
                       - onDrop → fires when file is dropped here */
                    <div
                        className={`drop-zone${dragover ? ' dragover' : ''}`}
                        onClick={() => fileInputRef.current.click()}   // click the hidden input
                        onDragOver={e => { e.preventDefault(); setDragover(true) }}
                        onDragLeave={() => setDragover(false)}
                        onDrop={handleDrop}
                    >
                        <div className="drop-icon">📂</div>
                        <div className="drop-text">Drag &amp; drop your file here, or <strong>browse files</strong></div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '8px' }}>
                            PDF, DOC, TXT, images supported · Max 10MB
                        </div>

                        {/* Hidden file input — the actual browser file picker.
                            style={{ display: 'none' }} makes it invisible.
                            We trigger it via fileInputRef.current.click() above.
                            ref={fileInputRef} connects this element to our useRef. */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            style={{ display: 'none' }}
                            onChange={e => handleFile(e.target.files[0])}
                        />
                    </div>
                ) : (
                    /* ── FILE PREVIEW ───────────────────────────────
                       Shows the selected file name and size.
                       "Change" button clears the file so user can pick again. */
                    <div className="file-selected" style={{ marginBottom: '1.5rem' }}>
                        <span className="file-selected-icon">✅</span>
                        <span>{file.name}</span>
                        {/* file.size is in bytes. Divide by 1024 = KB. toFixed(1) = 1 decimal */}
                        <span style={{ color: 'var(--text3)', fontSize: '0.78rem' }}>
                            {(file.size / 1024).toFixed(1)} KB
                        </span>
                        {/* setFile(null) clears the selected file → shows drop zone again */}
                        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setFile(null)}>
                            Change
                        </button>
                    </div>
                )}

                {/* Document name input (controlled input) */}
                <div className="form-group">
                    <label>Document Name *</label>
                    <input
                        className="input"
                        type="text"
                        placeholder="e.g., Last Will and Testament"
                        value={docName}
                        onChange={e => setDocName(e.target.value)}
                    />
                </div>

                {/* Encryption settings UI (visual only — real encryption to be implemented) */}
                <div style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem' }}>🔐 Encryption Settings</div>
                    <div className="form-group">
                        <label>Encryption Password *</label>
                        <input className="input" type="password" placeholder="Strong password — min 8 characters" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Confirm Password *</label>
                        <input className="input" type="password" placeholder="Re-enter password" />
                    </div>
                    <div className="alert alert-red mt-3" style={{ padding: '10px 14px' }}>
                        <div className="alert-icon" style={{ fontSize: '1rem' }}>⚠️</div>
                        <div className="alert-text" style={{ fontSize: '0.8rem' }}>
                            Save this password safely. Without it, nobody can decrypt this document — not even us.
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handleUpload}>
                        📤 Upload Document
                    </button>
                    <button className="btn btn-ghost" onClick={() => navigate('/documents')}>Cancel</button>
                </div>
            </div>
        </div>
    )
}
