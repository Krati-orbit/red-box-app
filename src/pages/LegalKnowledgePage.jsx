import React, { useState } from 'react'

// ─── Data from Nyaaya.org (https://nyaaya.org/legal-explainers/money-and-property/inheritance/wills/) ───
const willsExplainers = [
    {
        id: 'making-a-will',
        icon: '✍️',
        title: 'Making a Will',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/making-a-will/',
        summary: 'You can make a will at any point during your lifetime if you are of sound mind and above 18.',
        content: [
            'You can make a will at any point during your lifetime if you are a person of sound mind and over the age of 18.',
            'The person making the will should be aware of what they are doing.',
            'A person with mental disabilities can also make a will when they are aware of what they are doing.',
            'If a person is under the influence of alcohol and does not know what they are doing, then they cannot make a will.'
        ]
    },
    {
        id: 'valid-will',
        icon: '✅',
        title: 'What Makes a Valid Will?',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/valid-will/',
        summary: 'A valid will must contain your signature or thumb impression, done in the presence of two witnesses.',
        content: [
            'The will must have your signature (or your thumb impression).',
            'The signing or fingerprinting should be done in the presence of two other people who will act as witnesses.',
            'Both witnesses must sign the will or put their thumb-impression in your presence.',
            'You can also direct someone else to sign your will in your presence.',
            'There is no prescribed format or prescribed place for signing. Anyone can be a witness — including the executor of the will.'
        ]
    },
    {
        id: 'contents-of-will',
        icon: '📋',
        title: 'Contents of a Will',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/contents-of-a-will/',
        summary: 'You can include any movable or immovable property which you have acquired yourself and own completely.',
        content: [
            'You can give away all property over which you have complete ownership.',
            'You cannot give away property which you do not own.',
            'In some cases, you may only have a life interest in property — meaning you can use it for your lifetime but do not own it.',
            'You may include any movable or immovable property which you have acquired by yourself.',
            'If you are a member of a Hindu joint family, you can only give away your own portion of the ancestral property in a will.'
        ]
    },
    {
        id: 'appointing-executor',
        icon: '👤',
        title: 'Appointing an Executor',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/appointing-an-executor-for-a-will/',
        summary: 'The executor is the person responsible for carrying out the instructions in your will after your death.',
        content: [
            'The person you give the duty of carrying out the instructions given in your will, after your death, is called the executor.',
            'You can appoint any person who is of sound mind and above 18 years of age as your executor.',
            'You must choose a person with whom you have full confidence and who is willing and capable of acting as executor.',
            'If you haven\'t appointed an executor, the court has the power to appoint an administrator who will execute your will.'
        ]
    },
    {
        id: 'registering-will',
        icon: '🏛️',
        title: 'Registering a Will',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/registering-a-will/',
        summary: 'Registering a will is not compulsory, but adds an extra layer of security and authenticity.',
        content: [
            'Registering a will is not compulsory.',
            'You may register the will personally or through an authorised agent.',
            'You have to deposit the will in a sealed cover with your name on it to the Registrar of Sub-Assurances of your local division.',
            'Generally, you do not have to pay stamp duty on wills, but registration fees apply and vary by state.',
            'To recover the will (e.g., for changes), you or your authorised agent can apply to the Registrar.',
            'On your death, a person can apply to the Registrar to view the contents of the will.',
            'If you made changes through a codicil, you should ideally register the codicil in the same manner.'
        ]
    },
    {
        id: 'changing-will',
        icon: '✏️',
        title: 'Changing a Will',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/changing-a-will/',
        summary: 'Wills can be modified or changed anytime, any number of times, even after registration.',
        content: [
            'You can change your will as many times as you want, even if it has been registered.',
            'If making substantive changes, you should execute a codicil — a written statement that supplements or modifies an existing will.',
            'A codicil must be executed in the same manner as the original will.',
            'You can also make smaller changes by deleting, modifying, or inserting new language. In such cases, you and your witnesses should sign in the margins near the changes.',
            'No other changes can be made to an already executed will unless required for clarity or legibility.'
        ]
    },
    {
        id: 'probate',
        icon: '⚖️',
        title: 'Probate Process of the Will',
        source: 'Nyaaya.org',
        sourceUrl: 'https://nyaaya.org/legal-explainer/probate-process-of-the-will/',
        summary: 'Probate is a court certification of the genuineness and validity of the will\'s execution.',
        content: [
            'In certain cases, it is necessary to obtain a probate to establish your right as a beneficiary of the will.',
            'Probate is a certification by the court confirming the genuineness and validity of execution of the will.',
            'Getting a probate does not mean that your title to the property has been established — it is official evidence of the executor\'s right to administer the estate.',
            'There is no specific deadline to obtain probate, but long delays should be avoided.',
            'Probate is compulsory for wills of Hindus, Buddhists, Jains and Sikhs in Chennai and Mumbai (or if their property is there).',
            'It is also applicable to Christians outside Kerala and Parsis (who died after 1962) in Kolkata, Chennai and Mumbai.',
            'Consult a lawyer to determine if probate is required for your specific situation.'
        ]
    }
]

// ─── Rulebook/Article Resources ───
const resources = {
    wills: [
        {
            id: 'isa1925',
            title: 'Indian Succession Act, 1925',
            type: 'Rulebook',
            description: 'The complete legislative act governing Wills, execution, and probate in India. Essential for understanding testamentary rights.',
            url: 'https://mha.gov.in/sites/default/files/Indian_Succession_Act_1925.pdf',
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

export default function LegalKnowledgePage() {
    const [activeTab, setActiveTab] = useState('explainers')
    const [resourceTab, setResourceTab] = useState('wills')
    const [selectedResource, setSelectedResource] = useState(null)
    const [expandedCard, setExpandedCard] = useState(null)

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
                        <p style={styles.pageSubtitle}>Official acts, rulebooks and expert legal explainers — all in one place.</p>
                    </div>
                </div>
            </header>

            {/* Main Tab Navigation */}
            <div style={styles.tabContainer}>
                <button
                    onClick={() => setActiveTab('explainers')}
                    style={{ ...styles.tabBtn, ...(activeTab === 'explainers' ? styles.activeTab : {}) }}
                >
                    📖 Wills Explained
                </button>
                <button
                    onClick={() => setActiveTab('resources')}
                    style={{ ...styles.tabBtn, ...(activeTab === 'resources' ? styles.activeTab : {}) }}
                >
                    📚 Acts & Rulebooks
                </button>
            </div>

            {/* ──── EXPLAINERS TAB ──── */}
            {activeTab === 'explainers' && (
                <div>
                    {/* Nyaaya attribution banner */}
                    <div style={styles.sourceBanner}>
                        <span style={styles.sourceBannerIcon}>🔗</span>
                        <span>
                            Legal explainers sourced from{' '}
                            <a href="https://nyaaya.org/legal-explainers/money-and-property/inheritance/wills/" target="_blank" rel="noopener noreferrer" style={styles.sourceLink}>
                                Nyaaya.org
                            </a>
                            {' '}— India's trusted open-access legal resource.
                        </span>
                    </div>

                    <div style={styles.explainerGrid}>
                        {willsExplainers.map((item) => {
                            const isOpen = expandedCard === item.id
                            return (
                                <div
                                    key={item.id}
                                    style={{ ...styles.explainerCard, ...(isOpen ? styles.explainerCardOpen : {}) }}
                                    className="legal-explainer-card"
                                >
                                    {/* Card Header — always visible */}
                                    <div
                                        style={styles.explainerCardHeader}
                                        onClick={() => setExpandedCard(isOpen ? null : item.id)}
                                    >
                                        <div style={styles.explainerCardLeft}>
                                            <div style={styles.explainerIcon}>{item.icon}</div>
                                            <div>
                                                <h3 style={styles.explainerTitle}>{item.title}</h3>
                                                <p style={styles.explainerSummary}>{item.summary}</p>
                                            </div>
                                        </div>
                                        <div style={{ ...styles.chevron, ...(isOpen ? styles.chevronOpen : {}) }}>
                                            ›
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {isOpen && (
                                        <div style={styles.explainerBody}>
                                            <ul style={styles.contentList}>
                                                {item.content.map((point, i) => (
                                                    <li key={i} style={styles.contentItem}>
                                                        <span style={styles.bullet}>•</span>
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <a
                                                href={item.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={styles.readMoreBtn}
                                            >
                                                Read full explainer on Nyaaya ↗
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ──── RESOURCES TAB ──── */}
            {activeTab === 'resources' && (
                <div>
                    {/* Sub-tabs */}
                    <div style={{ ...styles.tabContainer, marginBottom: '2rem' }}>
                        <button
                            onClick={() => setResourceTab('wills')}
                            style={{ ...styles.tabBtn, ...(resourceTab === 'wills' ? styles.activeTab : {}) }}
                        >
                            Law of Wills
                        </button>
                        <button
                            onClick={() => setResourceTab('succession')}
                            style={{ ...styles.tabBtn, ...(resourceTab === 'succession' ? styles.activeTab : {}) }}
                        >
                            Succession Laws
                        </button>
                    </div>

                    <div style={styles.gridContainer}>
                        {resources[resourceTab].map((item) => (
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
                </div>
            )}

            {/* The Viewer Modal */}
            {selectedResource && (
                <ResourceViewer
                    resource={selectedResource}
                    onClose={() => setSelectedResource(null)}
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .legal-explainer-card {
                    transition: box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .legal-explainer-card:hover {
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                    border-color: var(--primary);
                }
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
    pageWrap: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2rem'
    },
    header: {
        marginBottom: '2.5rem',
        padding: '2rem',
        background: 'linear-gradient(145deg, var(--bg-card), var(--bg-body))',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
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
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.4)',
        flexShrink: 0
    },
    pageTitle: {
        margin: 0,
        fontSize: '2.5rem',
        fontWeight: '800',
        letterSpacing: '-1px',
        color: 'var(--text-main)'
    },
    pageSubtitle: {
        margin: '0.5rem 0 0 0',
        fontSize: '1.05rem',
        color: 'var(--text-secondary)'
    },
    tabContainer: {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        padding: '0.4rem',
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
        whiteSpace: 'nowrap'
    },
    activeTab: {
        background: 'var(--primary)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
    },

    // ── Source attribution banner ──
    sourceBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.9rem 1.4rem',
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(99,102,241,0.03))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '12px',
        marginBottom: '1.75rem',
        fontSize: '0.95rem',
        color: 'var(--text-secondary)'
    },
    sourceBannerIcon: { fontSize: '1.1rem' },
    sourceLink: {
        color: 'var(--primary)',
        fontWeight: '600',
        textDecoration: 'none'
    },

    // ── Explainer Cards ──
    explainerGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
    },
    explainerCard: {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden'
    },
    explainerCardOpen: {
        borderColor: 'var(--primary)',
        boxShadow: '0 4px 20px rgba(99,102,241,0.12)'
    },
    explainerCardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.5rem',
        cursor: 'pointer',
        gap: '1rem'
    },
    explainerCardLeft: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1.2rem',
        flex: 1
    },
    explainerIcon: {
        fontSize: '2rem',
        background: 'var(--bg-body)',
        width: '56px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        flexShrink: 0
    },
    explainerTitle: {
        margin: '0 0 0.35rem 0',
        fontSize: '1.2rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        lineHeight: '1.3'
    },
    explainerSummary: {
        margin: 0,
        fontSize: '0.92rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.5'
    },
    chevron: {
        fontSize: '1.8rem',
        color: 'var(--text-muted)',
        fontWeight: '300',
        transform: 'rotate(0deg)',
        transition: 'transform 0.25s ease',
        lineHeight: 1,
        flexShrink: 0
    },
    chevronOpen: {
        transform: 'rotate(90deg)',
        color: 'var(--primary)'
    },
    explainerBody: {
        padding: '0 1.5rem 1.5rem 1.5rem',
        borderTop: '1px solid var(--border-color)'
    },
    contentList: {
        listStyle: 'none',
        margin: '1.25rem 0 1.5rem 0',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
    },
    contentItem: {
        display: 'flex',
        gap: '0.75rem',
        fontSize: '0.97rem',
        color: 'var(--text-secondary)',
        lineHeight: '1.65'
    },
    bullet: {
        color: 'var(--primary)',
        fontWeight: '700',
        flexShrink: 0,
        marginTop: '0.05rem'
    },
    readMoreBtn: {
        display: 'inline-block',
        padding: '0.6rem 1.2rem',
        background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
        color: 'white',
        borderRadius: '8px',
        textDecoration: 'none',
        fontSize: '0.88rem',
        fontWeight: '600',
        letterSpacing: '0.3px',
        transition: 'opacity 0.2s'
    },

    // ── Resource Cards ──
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
        fontSize: '1.3rem',
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

    // ── Modal Styles ──
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
        background: '#f8f9fa'
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
