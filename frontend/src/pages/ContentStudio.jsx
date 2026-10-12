import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    UploadCloud,
    FileText,
    Clock,
    Sparkles,
    Download,
    Share2,
    CheckSquare,
    Square,
    Video,
    Layers,
    HelpCircle,
    BookOpen,
    Volume2,
    AlertCircle
} from 'lucide-react'
import { addLearningSession, buildGeneratedContent, youtubeSearchUrl } from '../services/learningStore'
import { useLearningStore } from '../hooks/useLearningStore'

const PREVIEW_TABS = [
    { id: 'transcript', label: 'Transcript & Caption', icon: Volume2, opt: 'transcript' },
    { id: 'simplifiedNotes', label: 'Simplified Notes', icon: FileText, opt: 'simplifiedNotes' },
    { id: 'diagrams', label: 'Visual Diagrams', icon: Layers, opt: 'diagrams' },
    { id: 'islVideo', label: 'ISL Video', icon: Video, opt: 'islVideo' },
    { id: 'keyTerms', label: 'Key Terms', icon: BookOpen, opt: 'keyTerms' },
    { id: 'practiceQuestions', label: 'Practice Questions', icon: HelpCircle, opt: 'practiceQuestions' },
]

export const ContentStudio = () => {
    const { sessions } = useLearningStore()
    const [selectedFile, setSelectedFile] = useState(null)
    const [previewId, setPreviewId] = useState(null)
    const [activeTab, setActiveTab] = useState('transcript')
    const [includeDiagrams, setIncludeDiagrams] = useState(true)
    const [subject, setSubject] = useState('Auto-detect')
    const [gradeLevel, setGradeLevel] = useState('Undergraduate')
    const [outputLanguage, setOutputLanguage] = useState('English')
    const [explanationLevel, setExplanationLevel] = useState('Standard')
    const [historyModalOpen, setHistoryModalOpen] = useState(false)
    const [processingNotice, setProcessingNotice] = useState(null)

    // Content option checkboxes
    const [options, setOptions] = useState({
        transcript: true,
        simplifiedNotes: true,
        diagrams: true,
        islVideo: true,
        keyTerms: true,
        practiceQuestions: true,
    })

    const toggleOption = (key) => {
        setOptions(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const pickFile = (file) => {
        if (!file) return
        if (file.size > 100 * 1024 * 1024) {
            setProcessingNotice({ type: 'error', message: 'File exceeds 100 MB limit.' })
            return
        }
        setSelectedFile(file)
        setProcessingNotice(null)
    }

    const handleFileChange = (e) => pickFile(e.target.files?.[0])

    const previewSession = useMemo(
        () => sessions.find((s) => s.id === previewId) || sessions[0] || null,
        [sessions, previewId]
    )

    const previewOpts = previewSession?.settings?.options
    const previewDiagrams = previewSession?.settings?.includeDiagrams ?? includeDiagrams

    const visibleTabs = useMemo(() => {
        const opts = previewSession && previewOpts ? previewOpts : options
        const diagramsOn = previewSession ? previewDiagrams : includeDiagrams
        return PREVIEW_TABS.filter((t) => opts[t.opt] && (t.opt !== 'diagrams' || diagramsOn))
    }, [previewSession, previewOpts, options, previewDiagrams, includeDiagrams])

    useEffect(() => {
        if (sessions.length && !previewId) setPreviewId(sessions[0].id)
    }, [sessions, previewId])

    useEffect(() => {
        if (visibleTabs.length && !visibleTabs.some((t) => t.id === activeTab)) {
            setActiveTab(visibleTabs[0].id)
        }
    }, [visibleTabs, activeTab])

    const handleGenerateClick = () => {
        if (!selectedFile) {
            setProcessingNotice({ type: 'error', message: 'Choose a file before generating content.' })
            return
        }
        const anyOption = Object.values(options).some(Boolean)
        if (!anyOption) {
            setProcessingNotice({ type: 'error', message: 'Select at least one content option.' })
            return
        }

        const fileName = selectedFile.name.replace(/\.[^.]+$/, '')
        const resolvedSubject = subject === 'Auto-detect' ? 'General' : subject
        const generated = buildGeneratedContent({
            title: fileName,
            subject: resolvedSubject,
            gradeLevel,
            outputLanguage,
            explanationLevel,
            options,
            includeDiagrams,
        })

        const session = addLearningSession({
            title: fileName,
            subject: resolvedSubject,
            progress: 10,
            notes: generated.notes,
            youtubeUrl: youtubeSearchUrl(fileName),
            sourceFile: selectedFile.name,
            materials: {
                notes: options.simplifiedNotes,
                diagram: options.diagrams && includeDiagrams,
                islVideo: options.islVideo,
                quiz: options.practiceQuestions,
            },
            settings: { subject, gradeLevel, outputLanguage, explanationLevel, includeDiagrams, options },
            generated,
        })

        setPreviewId(session.id)
        setProcessingNotice({
            type: 'info',
            message: `"${fileName}" generated and saved. Preview updated below and on your Dashboard.`,
        })
    }

    const handleDownloadAll = () => {
        if (!previewSession) return
        const blob = new Blob([JSON.stringify(previewSession, null, 2)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `${previewSession.title.replace(/\s+/g, '_')}_learning_pack.json`
        a.click()
        URL.revokeObjectURL(a.href)
    }

    const handleShare = async () => {
        if (!previewSession) return
        const url = `${window.location.origin}/learning-materials?session=${previewSession.id}`
        try {
            await navigator.clipboard.writeText(url)
            setProcessingNotice({ type: 'info', message: 'Link copied to clipboard.' })
        } catch {
            setProcessingNotice({ type: 'error', message: 'Could not copy link. Copy manually from the address bar after opening Learning Materials.' })
        }
    }

    const gen = previewSession?.generated
    const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString() : '—')

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {/* Header with Breadcrumb & Action */}
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
                        <FileText size={14} />
                        <span>Content Studio</span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Create Accessible Learning Content
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        Upload your study material and let AI generate simplified, accessible and engaging resources.
                    </p>
                </div>

                <button
                    onClick={() => setHistoryModalOpen(!historyModalOpen)}
                    style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '10px',
                        padding: '10px 18px',
                        fontSize: '0.88rem',
                        fontWeight: '600',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                >
                    <Clock size={16} color="#64748b" />
                    <span>View Upload History</span>
                </button>
            </div>

            {/* Upload & Configuration Section (2 Columns) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '24px',
                alignItems: 'stretch'
            }}>
                {/* Left Column (8 cols): File Upload & Processing Settings */}
                <div style={{
                    gridColumn: 'span 8',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '22px'
                }}>
                    {/* File Upload Box */}
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault()
                            pickFile(e.dataTransfer.files?.[0])
                        }}
                        style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '20px',
                        alignItems: 'center',
                        padding: '28px 24px',
                        border: '2px dashed #93c5fd',
                        borderRadius: '12px',
                        backgroundColor: '#f8fafc',
                        textAlign: 'center'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#2563eb',
                                marginBottom: '12px'
                            }}>
                                <UploadCloud size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
                                {selectedFile ? selectedFile.name : "Upload your File"}
                            </h3>
                            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 14px' }}>
                                Supports PDF, PPT, DOCX, TXT, MP4, MP3 (Max 100 MB)
                            </p>

                            <label style={{
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                padding: '9px 20px',
                                borderRadius: '8px',
                                fontSize: '0.88rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>Choose File</span>
                                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.ppt,.pptx,.docx,.txt,.mp4,.mp3" />
                            </label>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
                                or drag and drop here
                            </span>
                        </div>

                        {/* Supported Formats Legend */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderLeft: '1px solid #e2e8f0',
                            paddingLeft: '20px'
                        }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '10px' }}>
                                Supported Formats
                            </span>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '10px'
                            }}>
                                {[
                                    { ext: 'PDF', color: '#ef4444' },
                                    { ext: 'PPT', color: '#f97316' },
                                    { ext: 'DOCX', color: '#2563eb' },
                                    { ext: 'TXT', color: '#64748b' },
                                    { ext: 'MP4', color: '#0284c7' },
                                    { ext: 'MP3', color: '#a855f7' },
                                ].map(f => (
                                    <div key={f.ext} style={{
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        textAlign: 'center',
                                        fontSize: '0.72rem',
                                        fontWeight: '800',
                                        color: f.color
                                    }}>
                                        {f.ext}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Processing Settings */}
                    <div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                            Processing Settings
                        </h4>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '14px',
                            alignItems: 'center'
                        }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                    Subject
                                </label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem',
                                        color: '#0f172a',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option>Auto-detect</option>
                                    <option>Biology</option>
                                    <option>Physics</option>
                                    <option>Chemistry</option>
                                    <option>Mathematics</option>
                                    <option>Computer Science</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                    Grade Level
                                </label>
                                <select
                                    value={gradeLevel}
                                    onChange={(e) => setGradeLevel(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem',
                                        color: '#0f172a',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option>Undergraduate</option>
                                    <option>High School (Grades 9-12)</option>
                                    <option>Middle School (Grades 6-8)</option>
                                    <option>Primary School</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                    Output Language
                                </label>
                                <select
                                    value={outputLanguage}
                                    onChange={(e) => setOutputLanguage(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem',
                                        color: '#0f172a',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option>English</option>
                                    <option>Hindi</option>
                                    <option>Bilingual (English + Hindi)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                                    Explanation Level
                                </label>
                                <select
                                    value={explanationLevel}
                                    onChange={(e) => setExplanationLevel(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '0.85rem',
                                        color: '#0f172a',
                                        backgroundColor: '#ffffff'
                                    }}
                                >
                                    <option>Standard</option>
                                    <option>Simplified / Accessible</option>
                                    <option>Comprehensive</option>
                                </select>
                            </div>

                            {/* Include Diagrams Toggle */}
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                    Include Diagrams
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIncludeDiagrams(!includeDiagrams)}
                                    style={{
                                        width: '46px',
                                        height: '24px',
                                        backgroundColor: includeDiagrams ? '#2563eb' : '#cbd5e1',
                                        borderRadius: '9999px',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s',
                                        padding: 0
                                    }}
                                >
                                    <span style={{
                                        position: 'absolute',
                                        top: '2px',
                                        left: includeDiagrams ? '24px' : '2px',
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: '#ffffff',
                                        borderRadius: '50%',
                                        transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                                    }} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (4 cols): Content Options & Generate Button */}
                <div style={{
                    gridColumn: 'span 4',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px' }}>
                            Content Options
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 16px' }}>
                            Select the type of accessible content you want to generate.
                        </p>

                        {/* Checkbox Options List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                {
                                    key: 'transcript',
                                    label: 'Transcript & Caption',
                                    desc: 'Accurate text transcription with timestamps',
                                    icon: Volume2
                                },
                                {
                                    key: 'simplifiedNotes',
                                    label: 'Simplified Notes',
                                    desc: 'Easy-to-read summary and key points',
                                    icon: FileText
                                },
                                {
                                    key: 'diagrams',
                                    label: 'Visual Diagrams',
                                    desc: 'Illustrations, flowcharts and infographics',
                                    icon: Layers
                                },
                                {
                                    key: 'islVideo',
                                    label: 'ISL Video Support',
                                    desc: 'Add Indian Sign Language explanation',
                                    icon: Video
                                },
                                {
                                    key: 'keyTerms',
                                    label: 'Key Terms & Glossary',
                                    desc: 'Important terms with simple explanations',
                                    icon: BookOpen
                                },
                                {
                                    key: 'practiceQuestions',
                                    label: 'Practice Questions',
                                    desc: 'MCQs / Short answers with explanations',
                                    icon: HelpCircle
                                },
                            ].map(({ key, label, desc, icon: Icon }) => (
                                <div
                                    key={key}
                                    onClick={() => toggleOption(key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '10px',
                                        padding: '8px 10px',
                                        borderRadius: '8px',
                                        backgroundColor: options[key] ? '#f8fafc' : 'transparent',
                                        cursor: 'pointer',
                                        userSelect: 'none'
                                    }}
                                >
                                    <div style={{ color: options[key] ? '#2563eb' : '#94a3b8', marginTop: '2px' }}>
                                        {options[key] ? <CheckSquare size={18} /> : <Square size={18} />}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                                            {label}
                                        </div>
                                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                            {desc}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={handleGenerateClick}
                            style={{
                                width: '100%',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                padding: '12px 20px',
                                borderRadius: '10px',
                                fontSize: '0.92rem',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <Sparkles size={18} />
                            <span>Generate Content</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Processing Notice Banner */}
            {processingNotice && (
                <div style={{
                    backgroundColor: processingNotice.type === 'error' ? '#fef2f2' : '#eff6ff',
                    border: processingNotice.type === 'error' ? '1px solid #fecaca' : '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: processingNotice.type === 'error' ? '#991b1b' : '#1e3a8a',
                    fontSize: '0.88rem'
                }}>
                    <AlertCircle size={20} color={processingNotice.type === 'error' ? '#dc2626' : '#2563eb'} flexShrink={0} />
                    <span>{processingNotice.message}</span>
                </div>
            )}

            {/* Upload History Modal Placeholder */}
            {historyModalOpen && (
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '18px 24px',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem' }}>Upload History</h4>
                        <button type="button" onClick={() => setHistoryModalOpen(false)} style={{ background: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>Close ✕</button>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {sessions.length === 0 ? (
                            <p style={{ margin: 0 }}>No uploads yet. Generate content to build history.</p>
                        ) : (
                            sessions.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => { setPreviewId(s.id); setHistoryModalOpen(false) }}
                                    style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer', color: '#475569' }}
                                >
                                    • <code>{s.sourceFile || s.title}</code> — {s.subject} — {fmtDate(s.createdAt)}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Generated Content Preview Section */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0'
            }}>
                {/* Preview Header & Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '18px',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                            Generated Content Preview
                        </h2>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                            {previewSession
                                ? `From ${previewSession.sourceFile || previewSession.title} · ${previewSession.subject}`
                                : 'Generate content to see a preview from your upload and settings.'}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            disabled={!previewSession}
                            onClick={handleDownloadAll}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: previewSession ? 'pointer' : 'not-allowed',
                                opacity: previewSession ? 1 : 0.5,
                            }}
                        >
                            <Download size={15} /> Download All
                        </button>
                        <button
                            type="button"
                            disabled={!previewSession}
                            onClick={handleShare}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '8px',
                                padding: '8px 14px',
                                fontSize: '0.82rem',
                                fontWeight: '600',
                                color: '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: previewSession ? 'pointer' : 'not-allowed',
                                opacity: previewSession ? 1 : 0.5,
                            }}
                        >
                            <Share2 size={15} /> Share
                        </button>
                    </div>
                </div>

                {/* Preview Navigation Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '12px',
                    marginBottom: '20px',
                    overflowX: 'auto'
                }}>
                    {(previewSession ? visibleTabs : []).map(tab => {
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

                {!previewSession ? (
                    <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                        Upload a file, choose options, and click <strong>Generate Content</strong>.
                    </p>
                ) : activeTab === 'transcript' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                        <div style={{ gridColumn: 'span 7' }}>
                            <div style={{ marginBottom: '14px', padding: '16px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff' }}>
                                <p style={{ margin: '0 0 10px', fontWeight: 700 }}>{previewSession.title}</p>
                                <button
                                    type="button"
                                    onClick={() => window.open(previewSession.youtubeUrl, '_blank', 'noopener,noreferrer')}
                                    style={{ background: '#fff', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Open related video on YouTube
                                </button>
                            </div>
                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {(gen?.transcript || []).length === 0 ? (
                                    <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Transcript not generated for this run.</span>
                                ) : (
                                    gen.transcript.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', fontSize: '0.84rem' }}>
                                            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{item.time}</span>
                                            <span style={{ color: '#334155' }}>{item.text}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                        <div style={{ gridColumn: 'span 5', backgroundColor: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase' }}>Simplified Notes</span>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 12px' }}>{previewSession.title}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>{gen?.notes || previewSession.notes || '—'}</p>
                        </div>
                    </div>
                )}

                {previewSession && activeTab === 'simplifiedNotes' && (
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>{previewSession.title}</h3>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{gen?.notes || previewSession.notes}</p>
                        <Link to={`/learning-materials?session=${previewSession.id}&tab=notes`} style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>Open in Learning Materials →</Link>
                    </div>
                )}

                {previewSession && activeTab === 'diagrams' && (
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        {gen?.hasDiagram ? (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155' }}>
                                Visual diagram slot for <strong>{previewSession.title}</strong> ({previewSession.subject}). Full diagram rendering will attach when the media pipeline is connected.
                            </p>
                        ) : (
                            <p style={{ margin: 0, color: '#64748b' }}>Diagrams were not selected for this generation.</p>
                        )}
                    </div>
                )}

                {previewSession && activeTab === 'islVideo' && (
                    <div style={{ padding: '16px', borderRadius: '10px', border: '1px dashed #cbd5e1', background: '#f8fafc', textAlign: 'center' }}>
                        {previewSession.islVideoUrl ? (
                            <video src={previewSession.islVideoUrl} controls style={{ maxWidth: '100%', borderRadius: '8px' }} />
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                ISL video for <strong>{previewSession.title}</strong> will generate when your LLM / video API key is configured.
                            </p>
                        )}
                    </div>
                )}

                {previewSession && activeTab === 'keyTerms' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                        {(gen?.keyTerms || []).length === 0 && (
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Key terms were not generated for this run.</p>
                        )}
                        {(gen?.keyTerms || []).map((k) => (
                            <div key={k.term} style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#2563eb' }}>{k.term}</div>
                                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px' }}>{k.def}</div>
                            </div>
                        ))}
                    </div>
                )}

                {previewSession && activeTab === 'practiceQuestions' && (
                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        {(gen?.practiceQuestions || []).length === 0 && (
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Practice questions were not selected for this run.</p>
                        )}
                        {(gen?.practiceQuestions || []).map((q, i) => (
                            <p key={i} style={{ fontSize: '0.85rem', color: '#334155' }}>
                                {i + 1}. {q.q} <strong>Answer: {q.a}</strong>
                            </p>
                        ))}
                        <Link to="/assessments" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.85rem' }}>Go to Assessments →</Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ContentStudio
