// ============================================================
// FILE: src/pages/HomePage.jsx
// ============================================================
// 🏠 HOME PAGE — The landing/marketing page (URL: "/")
//
// This is the FIRST thing a visitor sees before they log in.
// It has NO authentication requirement — anyone can visit it.
//
// WHAT IT SHOWS:
//   - Hero section: big headline, CTA buttons, stats
//   - Feature grid: 6 cards describing app features
//   - Bottom CTA: one more "Create Your Red Box" button
//
// NOTICE: This page is very simple — it has NO state (useState),
// NO context (no useAuth/useData), and NO async operations.
// It's a purely "presentational" component. 🎨
//
// The only tool it uses is useNavigate() to route to Signup/Login
// when buttons are clicked.
//
// COMMUNICATION:
//   react-router → navigate('/signup') or navigate('/login')
// ============================================================

import React from 'react'
import { useNavigate } from 'react-router-dom'
export default function HomePage() {
    // useNavigate() gives us the navigate function to change pages.
    // We don't need any context here — this page is purely static content.
    const navigate = useNavigate()

    return (
        <div className="page-home">

            {/* ── HERO SECTION ─────────────────────────────── */}
            <div className="hero hero-split fade-up">

                {/* Main Hero Content (now centered via CSS) */}
                <div className="hero-content">
                    <div className="hero-tag">
                        <div className="hero-dot" /> End-to-End Encrypted
                    </div>

                    <h1 className="hero-title">
                        Secure Your<br />
                        <span className="accent">Legacy,</span>{' '}
                        <span className="line2">Protect What Matters</span>
                    </h1>

                    <p className="hero-sub">
                        Your most important documents, passwords, and memories — secured
                        and accessible only when it truly matters.
                    </p>

                    <div className="hero-cta">
                        <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                            🔒 Create Your Red Box
                        </button>
                        <button className="btn btn-ghost" onClick={() => navigate('/login')}>
                            Sign In →
                        </button>
                        <button className="btn btn-secondary" style={{ marginLeft: '10px' }} onClick={() => navigate('/request-verification')}>
                            👥 Request Access
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div>
                            <div className="hero-stat-val">256-bit</div>
                            <div className="hero-stat-label">AES Encryption</div>
                        </div>
                        <div>
                            <div className="hero-stat-val">100%</div>
                            <div className="hero-stat-label">Private & Secure</div>
                        </div>
                        <div>
                            <div className="hero-stat-val">0</div>
                            <div className="hero-stat-label">Knowledge on Our Side</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── FEATURE GRID ────────────────────────────────
                We define feature data as an array of objects, then
                use .map() to render each one as a JSX element.
                This is much cleaner than copy-pasting 6 divs! ✨
                The 'delay-${i+1}' class staggers the fade-up animations
                so each card appears slightly after the previous one. */}
            <div className="features-grid">
                {[
                    { icon: '📄', title: 'Upload Documents', desc: 'Store your will, property papers, passwords with military-grade AES-256 encryption. Only you hold the key.' },
                    { icon: '👥', title: 'Add Beneficiaries', desc: 'Designate trusted people who receive access to specific documents after proper verification.' },
                    { icon: '⏱️', title: "Deadman's Switch", desc: "Regular check-ins confirm you're active. Miss them? Your beneficiaries are automatically notified." },
                    { icon: '🛡️', title: 'Verified Release', desc: 'Documents unlock only after manual verification — ensuring your wishes are honored exactly as intended.' },
                    { icon: '🔐', title: 'Zero Knowledge', desc: 'Encrypted client-side in your browser. Even our servers cannot read your files. Ever.' },
                    { icon: '🕊️', title: 'Peace of Mind', desc: 'Know that your loved ones will have what they need, exactly when they need it.' },
                ].map((f, i) => (
                    // key={i} is required when rendering a list with .map()
                    // React uses it to track each element efficiently
                    <div key={i} className={`feature-cell fade-up delay-${i + 1}`}>
                        <div className="feature-icon">{f.icon}</div>
                        <div className="feature-title">{f.title}</div>
                        <div className="feature-desc">{f.desc}</div>
                    </div>
                ))}
            </div>

            {/* ── BOTTOM CTA SECTION ─────────────────────── */}
            <div className="cta-section fade-up">
                <div className="cta-title">Ready to Secure Your Legacy?</div>
                <div className="cta-sub">Start free. No credit card needed.</div>
                <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                    Create Your Red Box →
                </button>
            </div>
        </div>
    )
}
