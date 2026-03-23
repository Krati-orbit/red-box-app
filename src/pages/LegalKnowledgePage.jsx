import React, { useState } from 'react'

export default function LegalKnowledgePage() {
    const [activeTab, setActiveTab] = useState('wills')
    const [selectedResource, setSelectedResource] = useState(null)

    // Data for rulebooks and articles
    const resources = {
        wills: [
            {
                id: 'isa1925',
                title: 'Indian Succession Act, 1925',
                type: 'Rulebook',
                description: 'The complete legislative act governing Wills, execution, and probate in India. Essential for understanding testamentary rights.',
                url: 'https://mha.gov.in/sites/default/files/Indian_Succession_Act_1925.pdf', // Example actual public link
                thumbnail: '🏛️',
                actionText: 'Read Full Act'
            },
            {
                id: 'reg1908',
                title: 'Registration Act, 1908',
                type: 'Rulebook',
                description: 'Details the law regarding the registration of documents, including the optional registration of Wills under Section 18.',
                url: 'https://legislative.gov.in/sites/default/files/A1908-16.pdf',
                thumbnail: '📑',
                actionText: 'View Act'
            },
            {
                id: 'll_wills',
                title: '"Law of Wills" For Common Man',
                type: 'Article/Guide',
                description: 'A comprehensive, simplified breakdown of Will execution, testators, codicils, and unprivileged wills from LiveLaw.',
                url: 'https://www.livelaw.in/law-firms/law-firm-articles-/law-of-wills-common-man-will-indian-succession-act-codicil-testator-general-clauses-act-execution-registration-act-mitakshra-coparcenary-217504',
                thumbnail: '📜',
                actionText: 'Read Article'
            }
        ],
        succession: [
            {
                id: 'hsa1956',
                title: 'Hindu Succession Act, 1956',
                type: 'Rulebook',
                description: 'Codifies the law relating to intestate succession among Hindus, Buddhists, Jains, and Sikhs.',
                url: 'https://legislative.gov.in/sites/default/files/A1956-30.pdf',
                thumbnail: '⚖️',
                actionText: 'Read Full Act'
            }
        ]
    }

    // Modal/Iframe Viewer Component
    const ResourceViewer = ({ resource, onClose }) => {
        if (!resource) return null;

        return (
            <div className="modal-overlay" style={styles.modalOverlay}>
                <div className="modal-container" style={styles.modalContainer}>
                    <div style={styles.modalHeader}>
                        <div>
                            <span style={styles.resourceBadge}>{resource.type}</span>
                            <h2 style={styles.modalTitle}>{resource.title}</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={styles.externalLinkBtn}
                                title="Open in new tab if the viewer is blocked"
                            >
                                Open Externally ↗
                            </a>
                            <button onClick={onClose} style={styles.closeBtn}>×</button>
                        </div>
                    </div>
                    <div style={styles.iframeContainer}>
                        {/* Notice for websites that block iframes (X-Frame-Options) */}
                        <div style={styles.iframeFallbackText}>
                            If the document fails to load below, the source website may restrict embedding. Use the <strong>Open Externally</strong> button above.
                        </div>
                        <iframe
                            src={resource.url}
                            style={styles.iframe}
                            title={resource.title}
                            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container page-enter" style={styles.pageWrap}>
            <header className="page-header" style={styles.header}>
                <div style={styles.headerContent}>
                    <div style={styles.headerIcon}>⚖️</div>
                    <div>
                        <h1 style={styles.pageTitle}>Legal Library</h1>
                        <p style={styles.pageSubtitle}>Direct access to official acts, rulebooks, and expert interpretations.</p>
                    </div>
                </div>
            </header>

            {/* Premium Tab Navigation */}
            <div style={styles.tabContainer}>
                <button
                    onClick={() => setActiveTab('wills')}
                    style={{ ...styles.tabBtn, ...(activeTab === 'wills' ? styles.activeTab : {}) }}
                >
                    Law of Wills
                </button>
                <button
                    onClick={() => setActiveTab('succession')}
                    style={{ ...styles.tabBtn, ...(activeTab === 'succession' ? styles.activeTab : {}) }}
                >
                    Succession Laws
                </button>
            </div>

            {/* Premium Card Grid */}
            <div style={styles.gridContainer}>
                {resources[activeTab].map((item) => (
                    <div
                        key={item.id}
                        style={styles.card}
                        className="legal-resource-card"
                        onClick={() => setSelectedResource(item)}
                    >
                        <div style={styles.cardTop}>
                            <div style={styles.cardIcon}>{item.thumbnail}</div>
                            <span style={styles.typeBadge}>{item.type}</span>
                        </div>
                        <h3 style={styles.cardTitle}>{item.title}</h3>
                        <p style={styles.cardDesc}>{item.description}</p>
                        <div style={styles.cardAction}>
                            {item.actionText} →
                        </div>
                    </div>
                ))}
            </div>

            {/* The Viewer Modal */}
            {selectedResource && (
                <ResourceViewer
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                />
            )}

            {/* Custom CSS for hover effects since we can't use framer-motion or external css easily here */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .legal-resource-card {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .legal-resource-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
                    border-color: var(--primary);
                }
                .legal-resource-card:hover div:last-child {
                    color: var(--primary);
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
            `}} />
        </div>
    )
}

// Inline styles for high-end UI
const styles = {
    pageWrap: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
    },
    header: {
        marginBottom: '3rem',
        padding: '2rem',
        background: 'linear-gradient(145deg, var(--bg-card), var(--bg-body))',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
    },
    headerIcon: {
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)'
    },
    pageTitle: {
        margin: 0,
        fontSize: '2.5rem',
        fontWeight: '800',
        letterSpacing: '-1px',
        color: 'var(--text-main)',
    },
    pageSubtitle: {
        margin: '0.5rem 0 0 0',
        fontSize: '1.1rem',
        color: 'var(--text-secondary)'
    },
    tabContainer: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '0.5rem',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        width: 'fit-content'
    },
    tabBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-muted)',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    activeTab: {
        background: 'var(--primary)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem'
    },
    card: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '2rem',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.5rem'
    },
    cardIcon: {
        fontSize: '2.5rem',
        background: 'var(--bg-body)',
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '16px',
        border: '1px solid var(--border-color)'
    },
    typeBadge: {
        background: 'var(--bg-body)',
        color: 'var(--text-secondary)',
        fontSize: '0.8rem',
        fontWeight: '600',
        padding: '0.4rem 0.8rem',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    cardTitle: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        marginBottom: '1rem',
        lineHeight: '1.3'
    },
    cardDesc: {
        color: 'var(--text-secondary)',
        fontSize: '0.95rem',
        lineHeight: '1.6',
        flexGrow: 1,
        marginBottom: '2rem'
    },
    cardAction: {
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },

    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
    },
    modalContainer: {
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-color)'
    },
    modalHeader: {
        padding: '1.5rem 2rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-card)'
    },
    resourceBadge: {
        fontSize: '0.8rem',
        color: 'var(--primary)',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '0.2rem',
        display: 'block'
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.5rem',
        color: 'var(--text-main)'
    },
    externalLinkBtn: {
        padding: '0.6rem 1.2rem',
        background: 'var(--bg-body)',
        color: 'var(--text-main)',
        textDecoration: 'none',
        borderRadius: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        border: '1px solid var(--border-color)',
        transition: 'background 0.2s'
    },
    closeBtn: {
        background: 'var(--bg-body)',
        border: '1px solid var(--border-color)',
        color: 'var(--text-main)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        fontSize: '1.5rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    },
    iframeContainer: {
        flexGrow: 1,
        position: 'relative',
        background: '#f8f9fa' // Always light for PDF readability usually
    },
    iframeFallbackText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#6c757d',
        maxWidth: '400px',
        zIndex: 0
    },
    iframe: {
        width: '100%',
        height: '100%',
        border: 'none',
        position: 'relative',
        zIndex: 1,
        background: 'white'
    }
}
