import React, { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
    Hand,
    Search,
    Video,
    BookOpen,
    Award,
    CheckCircle,
    Bookmark,
    Plus,
    Check,
    Play,
} from 'lucide-react'
import { useLearningStore } from '../hooks/useLearningStore'
import {
    getISLTermsCatalog,
    computeISLStats,
    toggleIslBookmark,
    addIslTermRequest,
} from '../services/learningStore'

const CATEGORY_TABS = ['All Terms', 'Science', 'Mathematics', 'Computer Science', 'Chemistry', 'Physics', 'Biology', 'Common Terms']
const SCIENCE = ['Biology', 'Chemistry', 'Physics']

export const ISLResourceCenter = () => {
    const { sessions, islBookmarks, refresh } = useLearningStore()
    const allTerms = useMemo(() => getISLTermsCatalog(), [sessions])

    const [searchTerm, setSearchTerm] = useState('')
    const [appliedSearch, setAppliedSearch] = useState('')
    const [selectedSubject, setSelectedSubject] = useState('All Subjects')
    const [selectedGrade, setSelectedGrade] = useState('All Levels')
    const [selectedAvailability, setSelectedAvailability] = useState('All')
    const [activeCategoryTab, setActiveCategoryTab] = useState('All Terms')
    const [selectedTermId, setSelectedTermId] = useState(null)
    const [detailSubTab, setDetailSubTab] = useState('description')
    const [requestInput, setRequestInput] = useState('')
    const [requestSuccess, setRequestSuccess] = useState(false)

    const stats = useMemo(() => computeISLStats(allTerms), [allTerms])

    const subjectOptions = useMemo(() => {
        const subs = [...stats.subjects].sort()
        return ['All Subjects', ...subs]
    }, [stats.subjects])

    const gradeOptions = useMemo(() => {
        const grades = new Set(allTerms.map((t) => t.gradeLevel).filter(Boolean))
        return ['All Levels', ...grades]
    }, [allTerms])

    const filteredTerms = useMemo(() => {
        const q = appliedSearch.toLowerCase()
        return allTerms.filter((term) => {
            const matchesSearch =
                !q ||
                term.term.toLowerCase().includes(q) ||
                term.description.toLowerCase().includes(q)
            const matchesSubject = selectedSubject === 'All Subjects' || term.subject === selectedSubject
            const matchesGrade = selectedGrade === 'All Levels' || term.gradeLevel === selectedGrade
            const matchesAvailability =
                selectedAvailability === 'All' ||
                (selectedAvailability === 'Verified Only' && term.verified) ||
                (selectedAvailability === 'Pending / Community' && !term.verified)
            const matchesCategory =
                activeCategoryTab === 'All Terms' ||
                (activeCategoryTab === 'Science' && SCIENCE.includes(term.subject)) ||
                (activeCategoryTab === 'Common Terms' && term.subject === 'General') ||
                term.subject === activeCategoryTab
            return matchesSearch && matchesSubject && matchesGrade && matchesAvailability && matchesCategory
        })
    }, [allTerms, appliedSearch, selectedSubject, selectedGrade, selectedAvailability, activeCategoryTab])

    const selectedTerm = filteredTerms.find((t) => t.id === selectedTermId) || filteredTerms[0] || null

    useEffect(() => {
        if (filteredTerms.length && !filteredTerms.some((t) => t.id === selectedTermId)) {
            setSelectedTermId(filteredTerms[0].id)
        }
    }, [filteredTerms, selectedTermId])

    const subjectBrowse = useMemo(() => {
        const counts = {}
        allTerms.forEach((t) => {
            counts[t.subject] = (counts[t.subject] || 0) + 1
        })
        return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
    }, [allTerms])

    const relatedForSelected = useMemo(() => {
        if (!selectedTerm) return []
        return allTerms
            .filter((t) => selectedTerm.relatedTerms.includes(t.term) || (t.sessionId === selectedTerm.sessionId && t.id !== selectedTerm.id))
            .slice(0, 8)
    }, [allTerms, selectedTerm])

    const handleClearFilters = () => {
        setSearchTerm('')
        setAppliedSearch('')
        setSelectedSubject('All Subjects')
        setSelectedGrade('All Levels')
        setSelectedAvailability('All')
        setActiveCategoryTab('All Terms')
    }

    const handleSearch = () => setAppliedSearch(searchTerm.trim())

    const handlePlay = (term) => {
        if (!term?.videoUrl) return
        window.open(term.videoUrl, '_blank', 'noopener,noreferrer')
    }

    const handleBookmark = (termId, e) => {
        e?.stopPropagation?.()
        toggleIslBookmark(termId)
        refresh()
    }

    const statCards = [
        { label: 'ISL Videos', value: String(stats.videoCount), sub: stats.videoCount ? 'With media linked' : 'Generate ISL in Content Studio', icon: Video },
        { label: 'Academic Terms', value: String(stats.termCount), sub: 'From your library', icon: BookOpen },
        { label: 'Subjects Covered', value: String(stats.subjectCount), sub: stats.subjectCount ? [...stats.subjects].slice(0, 3).join(', ') : '—', icon: Award },
        { label: 'Coverage', value: `${stats.coveragePct}%`, sub: 'Verified vs total terms', icon: CheckCircle },
    ]

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', marginBottom: '6px' }}>
                    <Hand size={14} />
                    <span>ISL Resource Center</span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>ISL Resource Center</h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                    ISL entries are built from topics and key terms you generate in Content Studio.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
                {statCards.map((s) => {
                    const Icon = s.icon
                    return (
                        <div key={s.label} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                                <Icon size={22} />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>{s.value}</div>
                                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#334155' }}>{s.label}</div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{s.sub}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', padding: '18px 20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Search your ISL terms..."
                            style={{ width: '100%', padding: '10px 16px 10px 42px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                    </div>
                    <button type="button" onClick={handleSearch} style={{ backgroundColor: '#2563eb', color: '#fff', padding: '10px 22px', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Search size={16} /> Search
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                            Subject:{' '}
                            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                                {subjectOptions.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </label>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                            Grade Level:{' '}
                            <select value={selectedGrade} onChange={(e) => setSelectedGrade(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                                {gradeOptions.map((o) => (
                                    <option key={o}>{o}</option>
                                ))}
                            </select>
                        </label>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748b' }}>
                            Sign Availability:{' '}
                            <select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}>
                                <option>All</option>
                                <option>Verified Only</option>
                                <option>Pending / Community</option>
                            </select>
                        </label>
                    </div>
                    <button type="button" onClick={handleClearFilters} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}>
                        Clear Filters
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                {CATEGORY_TABS.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategoryTab(cat)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '9999px',
                            fontSize: '0.84rem',
                            fontWeight: activeCategoryTab === cat ? '700' : '500',
                            color: activeCategoryTab === cat ? '#2563eb' : '#64748b',
                            backgroundColor: activeCategoryTab === cat ? '#eff6ff' : 'transparent',
                            border: activeCategoryTab === cat ? '1px solid #bfdbfe' : '1px solid transparent',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Your ISL Terms</h2>
                            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Showing {filteredTerms.length} terms</span>
                        </div>

                        {filteredTerms.length === 0 ? (
                            <div style={{ padding: '28px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#64748b', textAlign: 'center' }}>
                                No terms yet.{' '}
                                <Link to="/content-studio" style={{ color: '#2563eb', fontWeight: 600 }}>
                                    Generate content in Content Studio
                                </Link>{' '}
                                to populate ISL resources.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                {filteredTerms.map((t) => {
                                    const isSelected = selectedTerm?.id === t.id
                                    const bookmarked = islBookmarks.includes(t.id)
                                    return (
                                        <div
                                            key={t.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setSelectedTermId(t.id)}
                                            onKeyDown={(e) => e.key === 'Enter' && setSelectedTermId(t.id)}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: '12px',
                                                padding: '12px',
                                                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    height: '88px',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #1e293b, #334155)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '10px',
                                                    position: 'relative',
                                                }}
                                            >
                                                <Video size={28} color="#94a3b8" />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handlePlay(t)
                                                    }}
                                                    style={{ position: 'absolute', background: '#2563eb', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    aria-label="Play"
                                                >
                                                    <Play size={16} fill="#fff" color="#fff" />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '0.92rem', fontWeight: '800', margin: '0 0 2px' }}>{t.term}</h4>
                                                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{t.subject}</span>
                                                </div>
                                                <button type="button" onClick={(e) => handleBookmark(t.id, e)} style={{ background: 'none', border: 'none', color: bookmarked ? '#2563eb' : '#94a3b8', cursor: 'pointer' }} aria-label="Bookmark">
                                                    <Bookmark size={16} fill={bookmarked ? '#2563eb' : 'none'} />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 16px' }}>Browse by Subject</h3>
                        {subjectBrowse.length === 0 ? (
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Subjects appear when you add learning content.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                {subjectBrowse.map(([name, count]) => (
                                    <button
                                        key={name}
                                        type="button"
                                        onClick={() => {
                                            setSelectedSubject(name)
                                            setActiveCategoryTab(name === 'General' ? 'Common Terms' : name)
                                        }}
                                        style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px 10px', border: '1px solid #e2e8f0', textAlign: 'center', cursor: 'pointer' }}
                                    >
                                        <div style={{ fontSize: '0.84rem', fontWeight: '700' }}>{name}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{count} term{count !== 1 ? 's' : ''}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: '0 0 14px' }}>Term Details</h3>
                        {!selectedTerm ? (
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Select a term from your library.</p>
                        ) : (
                            <>
                                <div style={{ marginBottom: '14px', minHeight: '140px', borderRadius: '10px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {selectedTerm.verified && selectedTerm.videoUrl?.startsWith('http') && !selectedTerm.videoUrl.includes('youtube.com/results') ? (
                                        <video src={selectedTerm.videoUrl} controls style={{ width: '100%', maxHeight: '180px', borderRadius: '8px' }} />
                                    ) : (
                                        <button type="button" onClick={() => handlePlay(selectedTerm)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Play size={16} /> Open video on YouTube
                                        </button>
                                    )}
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px' }}>{selectedTerm.term}</h2>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#2563eb' }}>{selectedTerm.subject}</span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569' }}>{selectedTerm.gradeLevel}</span>
                                    {selectedTerm.verified ? (
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Check size={12} /> Verified
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#fff7ed', color: '#c2410c' }}>Pending ISL media</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>
                                    {['description', 'related', 'examples'].map((tab) => (
                                        <button key={tab} type="button" onClick={() => setDetailSubTab(tab)} style={{ background: 'none', border: 'none', padding: '4px 8px', fontSize: '0.8rem', fontWeight: detailSubTab === tab ? '700' : '500', color: detailSubTab === tab ? '#2563eb' : '#64748b', cursor: 'pointer', textTransform: 'capitalize' }}>
                                            {tab === 'related' ? 'Related Terms' : tab}
                                        </button>
                                    ))}
                                </div>
                                {detailSubTab === 'description' && (
                                    <div>
                                        <p style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>{selectedTerm.description}</p>
                                        {selectedTerm.keyPoints.length > 0 && (
                                            <>
                                                <h4 style={{ fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px' }}>Key Points (Simplified)</h4>
                                                <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: '#475569' }}>
                                                    {selectedTerm.keyPoints.map((pt, i) => (
                                                        <li key={i}>{pt}</li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                        <Link to={`/learning-materials?session=${selectedTerm.sessionId}&tab=notes`} style={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: 600 }}>
                                            View source notes →
                                        </Link>
                                    </div>
                                )}
                                {detailSubTab === 'related' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {selectedTerm.relatedTerms.length === 0 ? (
                                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No related terms in this topic.</p>
                                        ) : (
                                            selectedTerm.relatedTerms.map((rt) => (
                                                <button
                                                    key={rt}
                                                    type="button"
                                                    onClick={() => {
                                                        const match = allTerms.find((x) => x.term === rt)
                                                        if (match) setSelectedTermId(match.id)
                                                    }}
                                                    style={{ padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem', fontWeight: '600', color: '#2563eb', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                                                >
                                                    {rt}
                                                </button>
                                            ))
                                        )}
                                    </div>
                                )}
                                {detailSubTab === 'examples' && (
                                    <p style={{ fontSize: '0.82rem', color: '#475569' }}>
                                        Use <strong>{selectedTerm.term}</strong> in context: review your simplified notes in Learning Materials for sentences from your upload.
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0 0 14px' }}>Related Terms</h3>
                        {relatedForSelected.length === 0 ? (
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>None for this selection.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {relatedForSelected.map((rel) => (
                                    <button
                                        key={rel.id}
                                        type="button"
                                        onClick={() => setSelectedTermId(rel.id)}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                    >
                                        <div>
                                            <div style={{ fontSize: '0.84rem', fontWeight: '700' }}>{rel.term}</div>
                                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{rel.subject}</div>
                                        </div>
                                        <Bookmark size={15} color={islBookmarks.includes(rel.id) ? '#2563eb' : '#94a3b8'} fill={islBookmarks.includes(rel.id) ? '#2563eb' : 'none'} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: '700', margin: '0 0 4px' }}>Can&apos;t find a term?</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 14px' }}>Request a term — saved locally until the review API is connected.</p>
                        {requestSuccess ? (
                            <div style={{ padding: '8px 12px', backgroundColor: '#ecfdf5', borderRadius: '6px', color: '#059669', fontSize: '0.8rem', fontWeight: '600' }}>Request saved.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input type="text" placeholder="Enter academic term name..." value={requestInput} onChange={(e) => setRequestInput(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }} />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (addIslTermRequest(requestInput)) {
                                            setRequestSuccess(true)
                                            setRequestInput('')
                                            refresh()
                                            setTimeout(() => setRequestSuccess(false), 3000)
                                        }
                                    }}
                                    style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', padding: '8px 14px', borderRadius: '8px', fontSize: '0.84rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                >
                                    <Plus size={15} /> Request Term
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ISLResourceCenter
