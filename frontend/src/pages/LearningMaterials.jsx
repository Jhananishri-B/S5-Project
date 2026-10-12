import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getLearningState } from '../services/learningStore'
import {
    BookOpen,
    Download,
    Share2,
    Printer,
    Bookmark,
    ChevronRight,
    ChevronLeft,
    Maximize2,
    Edit3,
    Layers,
    Video,
    FileText,
    HelpCircle,
    RotateCw,
    Plus
} from 'lucide-react'

export const LearningMaterials = () => {
    const [searchParams] = useSearchParams()
    const [library, setLibrary] = useState(getLearningState)
    const sessionIdParam = searchParams.get('session')
    const tabParam = searchParams.get('tab')

    useEffect(() => {
        const sync = () => setLibrary(getLearningState())
        window.addEventListener('learnbridge-storage', sync)
        return () => window.removeEventListener('learnbridge-storage', sync)
    }, [])

    const activeSession = useMemo(() => {
        const sessions = library.sessions || []
        if (!sessions.length) return null
        if (sessionIdParam) return sessions.find((s) => s.id === sessionIdParam) || sessions[0]
        return sessions[0]
    }, [library.sessions, sessionIdParam])

    const [activeTab, setActiveTab] = useState(tabParam || 'notes')
    useEffect(() => {
        if (tabParam) setActiveTab(tabParam)
    }, [tabParam])

    const [selectedTopicIndex, setSelectedTopicIndex] = useState(0)
    const [flashcardIndex, setFlashcardIndex] = useState(0)
    const [flashcardFlipped, setFlashcardFlipped] = useState(false)
    const [isLibrarySaved, setIsLibrarySaved] = useState(false)

    const flashcards = useMemo(() => {
        const kts = activeSession?.generated?.keyTerms || []
        if (!kts.length) return []
        return kts.map((k) => ({ q: `What is ${k.term}?`, a: k.def }))
    }, [activeSession])

    const topics = useMemo(() => {
        if (!activeSession?.notes) return activeSession ? [activeSession.title] : []
        return activeSession.notes.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean).slice(0, 8)
    }, [activeSession])

    const nextFlashcard = () => {
        if (!flashcards.length) return
        setFlashcardFlipped(false)
        setFlashcardIndex((prev) => (prev + 1) % flashcards.length)
    }

    const prevFlashcard = () => {
        if (!flashcards.length) return
        setFlashcardFlipped(false)
        setFlashcardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
    }

    const downloadAll = () => {
        if (!activeSession) return
        const blob = new Blob([JSON.stringify(activeSession, null, 2)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${(activeSession.title || 'materials').replace(/\s+/g, '_')}.json`
        a.click()
        URL.revokeObjectURL(a.href)
    }

    const shareMaterials = async () => {
        if (!activeSession) return
        const url = `${window.location.origin}/learning-materials?session=${activeSession.id}`
        try {
            await navigator.clipboard.writeText(url)
        } catch {
            /* ignore */
        }
    }

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header & Main Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        marginBottom: '6px'
                    }}>
                        <BookOpen size={14} />
                        <span>Learning Materials</span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Your Learning Materials
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        Access simplified notes, visual diagrams, ISL videos, key terms, flashcards and more.
                    </p>
                </div>

                {/* Right actions: Topic Selector & Download All */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        value={activeSession?.id || ''}
                        onChange={(e) => {
                            const s = (library.sessions || []).find((x) => x.id === e.target.value)
                            if (s) window.location.assign(`/learning-materials?session=${s.id}&tab=${activeTab}`)
                        }}
                        style={{
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: '600',
                            backgroundColor: '#ffffff',
                            color: '#0f172a'
                        }}
                    >
                        {(library.sessions || []).length === 0 ? (
                            <option value="">No saved topics yet</option>
                        ) : (
                            library.sessions.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.title}
                                </option>
                            ))
                        )}
                    </select>

                    <button
                        onClick={downloadAll}
                        disabled={!activeSession}
                        style={{
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            fontSize: '0.88rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                        }}
                    >
                        <Download size={16} /> Download All
                    </button>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '6px',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '10px',
                overflowX: 'auto'
            }}>
                {[
                    { id: 'notes', label: 'Simplified Notes', icon: FileText },
                    { id: 'diagrams', label: 'Visual Diagrams', icon: Layers },
                    { id: 'video', label: 'ISL Video', icon: Video },
                    { id: 'terms', label: 'Key Terms', icon: BookOpen },
                    { id: 'flashcards', label: 'Flashcards', icon: RotateCw },
                    { id: 'summary', label: 'Summary', icon: Edit3 },
                    { id: 'transcripts', label: 'Transcripts', icon: FileText },
                ].map(tab => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                fontWeight: isActive ? '700' : '500',
                                color: isActive ? '#2563eb' : '#64748b',
                                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <Icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Main Grid: Left 8 cols (2x2 Panel Grid) & Right 4 cols (Topic list + Related materials) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '24px'
            }}>
                {/* Left Column (8 cols): 2x2 Grid matching reference screenshot 4 */}
                <div style={{
                    gridColumn: 'span 8',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '20px'
                }}>
                    {/* Card 1: Simplified Notes */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} color="#2563eb" />
                                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                        Simplified Notes
                                    </h3>
                                </div>
                                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                    <Edit3 size={13} /> Edit View
                                </button>
                            </div>

                            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                                {activeSession ? `${activeSession.title} – Notes` : 'Saved notes'}
                            </h4>
                            {activeSession?.notes ? (
                                <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.55', marginBottom: '14px', whiteSpace: 'pre-wrap' }}>
                                    {activeSession.notes}
                                </p>
                            ) : (
                                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '14px' }}>
                                    Generate content in Content Studio to save notes here.
                                </p>
                            )}
                        </div>

                        {/* Key Takeaway Box */}
                        <div style={{
                            backgroundColor: '#eff6ff',
                            borderRadius: '8px',
                            padding: '12px',
                            border: '1px solid #bfdbfe'
                        }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '3px' }}>
                                💡 Key Takeaway
                            </div>
                            <p style={{ margin: 0, fontSize: '0.76rem', color: '#1e40af', lineHeight: '1.4' }}>
                                {activeSession?.notes?.split(/[.!?]+/).filter(Boolean).slice(-1)[0]?.trim() || 'Generate notes in Content Studio to see a takeaway.'}
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Visual Diagrams */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Layers size={18} color="#2563eb" />
                                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                        Visual Diagrams
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => activeSession && window.open(`/learning-materials?session=${activeSession.id}&tab=diagrams`, '_self')}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                >
                                    <Maximize2 size={13} /> View Fullscreen
                                </button>
                            </div>

                            {activeSession?.materials?.diagram ? (
                                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>Diagram for {activeSession.title} ({activeSession.subject}).</p>
                            ) : (
                                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No diagram for this topic.</p>
                            )}
                        </div>
                    </div>

                    {/* Card 3: ISL Video Explanation */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Video size={18} color="#2563eb" />
                                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                        ISL Video Explanation
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => activeSession && window.open(activeSession.youtubeUrl, '_blank', 'noopener,noreferrer')}
                                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                >
                                    <Maximize2 size={13} /> View in Fullscreen
                                </button>
                            </div>

                            <div style={{ marginBottom: '10px', minHeight: '120px', borderRadius: '8px', border: '1px dashed #cbd5e1', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
                                {activeSession?.islVideoUrl ? (
                                    <video src={activeSession.islVideoUrl} controls style={{ width: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                                ) : (
                                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, textAlign: 'center' }}>
                                        ISL video will appear here after you connect your LLM / video API key.
                                    </p>
                                )}
                            </div>

                            <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                                {activeSession ? `${activeSession.title} – ISL` : 'ISL Explanation'}
                            </h4>
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
                                {activeSession
                                    ? `Sign-language explanation for ${activeSession.subject}: ${activeSession.title}.`
                                    : 'Select or create a topic to generate an ISL video.'}
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Interactive Flashcards */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <RotateCw size={18} color="#2563eb" />
                                    <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                        Flashcards
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                                    style={{
                                        backgroundColor: '#eff6ff',
                                        border: '1px solid #bfdbfe',
                                        color: '#2563eb',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.78rem',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {flashcardFlipped ? "Show Question" : "+ Flip Card"}
                                </button>
                            </div>

                            {/* Flashcard Box */}
                            <div
                                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                                style={{
                                    height: '140px',
                                    backgroundColor: flashcardFlipped ? '#f0fdf4' : '#f8fafc',
                                    border: flashcardFlipped ? '2px solid #86efac' : '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '0.72rem', fontWeight: '700', color: flashcardFlipped ? '#16a34a' : '#2563eb', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    {flashcardFlipped ? "Answer" : "Question"}
                                </span>
                                <p style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: '1.4' }}>
                                    {flashcards.length
                                        ? flashcardFlipped
                                            ? flashcards[flashcardIndex].a
                                            : flashcards[flashcardIndex].q
                                        : 'Generate key terms in Content Studio for flashcards.'}
                                </p>
                                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>
                                    Click to flip
                                </span>
                            </div>
                        </div>

                        {/* Navigation arrows & counter */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <button
                                onClick={prevFlashcard}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>
                                {flashcardIndex + 1} / {flashcards.length}
                            </span>
                            <button
                                onClick={nextFlashcard}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    border: '1px solid #e2e8f0',
                                    backgroundColor: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column (4 cols): Chapter List, Related Materials, Quick Actions */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Chapter / Topic List */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 14px' }}>
                            Chapter / Topic List
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topics.map((t, idx) => {
                                const isSelected = selectedTopicIndex === idx
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedTopicIndex(idx)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                                            color: isSelected ? '#2563eb' : '#334155',
                                            fontWeight: isSelected ? '700' : '500',
                                            fontSize: '0.82rem',
                                            cursor: 'pointer',
                                            border: isSelected ? '1px solid #bfdbfe' : '1px solid transparent'
                                        }}
                                    >
                                        <span>{t}</span>
                                        <ChevronRight size={15} color={isSelected ? '#2563eb' : '#94a3b8'} />
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Related Materials */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Related Materials
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                                View All →
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { title: 'Practice Quiz', meta: '10 Questions', icon: '📝' },
                                { title: 'Summary Notes', meta: '2 pages', icon: '📄' },
                                { title: 'Mind Map', meta: 'Visual Overview', icon: '🧠' },
                                { title: 'Concept Map', meta: 'Relations between concepts', icon: '🗺️' },
                                { title: 'Previous Year Questions', meta: '5 Questions', icon: '📑' },
                            ].map(item => (
                                <div key={item.title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                        <div>
                                            <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0f172a' }}>{item.title}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.meta}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={15} color="#94a3b8" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                    }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                            Quick Actions
                        </h3>

                        <button
                            onClick={() => setIsLibrarySaved(!isLibrarySaved)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: isLibrarySaved ? '#ecfdf5' : '#eff6ff',
                                color: isLibrarySaved ? '#059669' : '#2563eb',
                                fontSize: '0.84rem',
                                fontWeight: '700',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <Bookmark size={16} fill={isLibrarySaved ? "#059669" : "none"} />
                            <span>{isLibrarySaved ? "Saved in Library" : "Add to My Library"}</span>
                        </button>

                        <button
                            onClick={shareMaterials}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                                fontSize: '0.84rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Share2 size={16} />
                            <span>Share</span>
                        </button>

                        <button
                            onClick={() => window.print()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '10px',
                                borderRadius: '8px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                                fontSize: '0.84rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            <Printer size={16} />
                            <span>Print Notes</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default LearningMaterials
