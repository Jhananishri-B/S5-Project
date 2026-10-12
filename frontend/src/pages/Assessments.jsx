import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLearningStore } from '../hooks/useLearningStore'
import { getQuizQuestions, computeDashboardMetrics } from '../services/learningStore'
import {
    CheckSquare,
    Sparkles,
    CheckCircle2,
    HelpCircle,
    TrendingUp,
    Clock,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    Layers,
    FileQuestion,
    Award,
    Zap,
    BookOpen
} from 'lucide-react'
export const Assessments = () => {
    const { sessions } = useLearningStore()
    const [selectedSessionId, setSelectedSessionId] = useState('')
    const quizSessions = useMemo(
        () => sessions.filter((s) => s.materials?.quiz || (s.generated?.practiceQuestions || []).length),
        [sessions]
    )
    const quizQuestions = useMemo(
        () => getQuizQuestions(sessions, selectedSessionId || null),
        [sessions, selectedSessionId]
    )
    const metrics = useMemo(() => computeDashboardMetrics(sessions), [sessions])

    useEffect(() => {
        if (!selectedSessionId && quizSessions[0]) setSelectedSessionId(quizSessions[0].id)
    }, [quizSessions, selectedSessionId])

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [includeDiagrams, setIncludeDiagrams] = useState(true)
    const [questionType, setQuestionType] = useState('Multiple Choice (MCQ)')
    const [numQuestions, setNumQuestions] = useState('10 Questions')
    const [difficulty, setDifficulty] = useState('Mixed')
    const [showFeedback, setShowFeedback] = useState(false)
    const [quizNotice, setQuizNotice] = useState(null)

    const currentQ = quizQuestions[currentQuestionIndex]

    const handleSelectOption = (optionId) => {
        setSelectedAnswers(prev => ({ ...prev, [currentQuestionIndex]: optionId }))
    }

    const handleNext = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setShowFeedback(false)
        } else {
            setShowFeedback(true)
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1)
            setShowFeedback(false)
        }
    }

    const handleGenerateQuiz = () => {
        if (!quizSessions.length) {
            setQuizNotice('Generate practice questions in Content Studio first.')
        } else {
            setCurrentQuestionIndex(0)
            setSelectedAnswers({})
            setQuizNotice('Quiz loaded from your saved materials.')
        }
        setTimeout(() => setQuizNotice(null), 4000)
    }

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* Header */}
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
                        <CheckSquare size={14} />
                        <span>Assessments & Practice</span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Assessments & Practice
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        Test your understanding with AI-generated quizzes and personalized practice.
                    </p>
                </div>

                {/* Right Action: Subject & Generate Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        value={selectedSessionId}
                        onChange={(e) => {
                            setSelectedSessionId(e.target.value)
                            setCurrentQuestionIndex(0)
                            setSelectedAnswers({})
                        }}
                        style={{
                            padding: '9px 14px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.88rem',
                            fontWeight: '600',
                            backgroundColor: '#ffffff'
                        }}
                    >
                        {quizSessions.length === 0 ? (
                            <option value="">No quizzes yet</option>
                        ) : (
                            quizSessions.map((s) => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))
                        )}
                    </select>
                    <button
                        onClick={handleGenerateQuiz}
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
                        + Generate New Quiz
                    </button>
                </div>
            </div>

            {quizNotice && (
                <div style={{ padding: '12px 18px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '0.84rem', color: '#1e3a8a' }}>
                    ℹ️ {quizNotice}
                </div>
            )}

            {/* Top 4 Stats Cards Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '16px'
            }}>
                {[
                    { label: 'Practice Quizzes', sub: 'MCQs, True/False, Short Answers', icon: HelpCircle, color: '#2563eb' },
                    { label: 'Instant Feedback', sub: 'Detailed explanations with visuals', icon: CheckCircle2, color: '#10b981' },
                    { label: 'Personalized Practice', sub: 'Questions based on your weak topics', icon: Zap, color: '#2563eb' },
                    { label: 'Track Progress', sub: 'See improvement over time', icon: TrendingUp, color: '#2563eb' },
                ].map((c, i) => {
                    const Icon = c.icon
                    return (
                        <div
                            key={i}
                            style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                padding: '16px 18px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px'
                            }}
                        >
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                backgroundColor: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: c.color,
                                flexShrink: 0
                            }}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a' }}>
                                    {c.label}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                    {c.sub}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Generate a Quiz Config Bar */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '18px 22px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>
                        Generate a Quiz
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Question Type:</span>
                        <select
                            value={questionType}
                            onChange={(e) => setQuestionType(e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        >
                            <option>Multiple Choice (MCQ)</option>
                            <option>True / False</option>
                            <option>Short Answer</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Number of Questions:</span>
                        <select
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        >
                            <option>10 Questions</option>
                            <option>5 Questions</option>
                            <option>15 Questions</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Difficulty Level:</span>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                        >
                            <option>Mixed</option>
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Include Diagrams:</span>
                        <button
                            onClick={() => setIncludeDiagrams(!includeDiagrams)}
                            style={{
                                width: '40px',
                                height: '22px',
                                borderRadius: '9999px',
                                backgroundColor: includeDiagrams ? '#2563eb' : '#cbd5e1',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                left: includeDiagrams ? '20px' : '2px',
                                width: '18px',
                                height: '18px',
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                transition: 'left 0.2s'
                            }} />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleGenerateQuiz}
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
                        cursor: 'pointer'
                    }}
                >
                    <Sparkles size={16} /> Generate Quiz
                </button>
            </div>

            {/* Main Grid: Left 8 cols (Current Quiz + Practice Options) & Right 4 cols (Progress, Weak Topics, Recent Quizzes) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '24px'
            }}>
                {/* Left Column (8 cols) */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Current Quiz Card */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        {/* Quiz Card Header: Title & Timer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                    Current Quiz
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {currentQ?.sessionTitle || selectedSessionId ? quizSessions.find((s) => s.id === selectedSessionId)?.title : '—'} – MCQ
                                </span>
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#64748b' }}>
                                Question {quizQuestions.length ? currentQuestionIndex + 1 : 0} of {quizQuestions.length}
                            </span>
                        </div>

                        {!currentQ ? (
                            <p style={{ color: '#64748b', margin: 0 }}>
                                No questions yet. <Link to="/content-studio" style={{ color: '#2563eb', fontWeight: 600 }}>Enable Practice Questions in Content Studio</Link>.
                            </p>
                        ) : (
                        <>
                        <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>
                            {currentQuestionIndex + 1}. {currentQ.question}
                        </div>

                        {/* Question Content Grid: Options on left, Diagram on right */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '20px',
                            alignItems: 'start'
                        }}>
                            {/* Radio Options List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {currentQ.options.map(opt => {
                                    const isSelected = selectedAnswers[currentQuestionIndex] === opt.id

                                    return (
                                        <div
                                            key={opt.id}
                                            onClick={() => handleSelectOption(opt.id)}
                                            style={{
                                                padding: '14px 16px',
                                                borderRadius: '10px',
                                                border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                                backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.15s'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                                                backgroundColor: '#ffffff',
                                                flexShrink: 0
                                            }} />
                                            <span style={{
                                                fontSize: '0.9rem',
                                                fontWeight: isSelected ? '700' : '500',
                                                color: isSelected ? '#1e3a8a' : '#334155'
                                            }}>
                                                {opt.id}. {opt.text}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>

                        {/* Feedback / Explanation (if shown) */}
                        {showFeedback && (
                            <div style={{
                                backgroundColor: '#ecfdf5',
                                border: '1px solid #a7f3d0',
                                borderRadius: '10px',
                                padding: '14px',
                                fontSize: '0.85rem',
                                color: '#065f46'
                            }}>
                                <strong>Explanation:</strong> {currentQ.explanation}
                            </div>
                        )}

                        {/* Bottom Nav: Previous & Next */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '9px 18px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    color: currentQuestionIndex === 0 ? '#94a3b8' : '#334155',
                                    cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <ArrowLeft size={16} /> Previous
                            </button>

                            <button
                                onClick={handleNext}
                                style={{
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    padding: '9px 22px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                                }}
                            >
                                Next <ArrowRight size={16} />
                            </button>
                        </div>
                        </>
                        )}
                    </div>

                    {/* More Practice Options Row */}
                    <div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', margin: '0 0 14px' }}>
                            More Practice Options
                        </h3>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '14px'
                        }}>
                            {[
                                { title: 'Flashcard Practice', desc: 'Quick revision with key terms', icon: RotateCcw },
                                { title: 'Diagram Lab', desc: 'Label diagrams and practice visually', icon: Layers },
                                { title: 'Short Answer Questions', desc: 'Write and check explanations', icon: FileQuestion },
                                { title: 'Previous Year Questions', desc: 'Practice with curated questions', icon: BookOpen },
                            ].map((opt, i) => {
                                const Icon = opt.icon
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between',
                                            minHeight: '130px'
                                        }}
                                    >
                                        <div>
                                            <div style={{ color: '#2563eb', marginBottom: '8px' }}>
                                                <Icon size={20} />
                                            </div>
                                            <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0f172a' }}>
                                                {opt.title}
                                            </div>
                                            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                                {opt.desc}
                                            </div>
                                        </div>
                                        <Link
                                            to="/learning-materials"
                                            style={{
                                                color: '#2563eb',
                                                fontSize: '0.8rem',
                                                fontWeight: '700',
                                                background: 'none',
                                                border: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                padding: 0,
                                                marginTop: '10px'
                                            }}
                                        >
                                            Start
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

                {/* Right Column (4 cols): Your Progress, Weak Topics, Recent Quizzes */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Your Progress */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Your Progress
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                                View Details →
                            </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '14px' }}>
                            {/* Circular gauge */}
                            <div style={{
                                width: '74px',
                                height: '74px',
                                borderRadius: '50%',
                                border: '5px solid #2563eb',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>{metrics.subjectProgress[0]?.progress ?? 0}%</span>
                                <span style={{ fontSize: '0.62rem', color: '#64748b' }}>Progress</span>
                            </div>

                            {/* Progress stats list */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Award size={14} color="#2563eb" />
                                    <span><strong>{quizSessions.length}</strong> Topics with quizzes</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle2 size={14} color="#10b981" />
                                    <span><strong>{Object.keys(selectedAnswers).length}</strong> Answered this session</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Zap size={14} color="#f59e0b" />
                                    <span><strong>{metrics.streak || 0}</strong> Day streak</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weak Topics */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Weak Topics
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                                View All →
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(sessions.filter((s) => s.progress < 70).length ? sessions.filter((s) => s.progress < 70) : sessions).slice(0, 4).map((s) => {
                                const w = { topic: s.title, score: s.progress || 0, color: s.progress < 50 ? '#ef4444' : '#2563eb' }
                                return (
                                <div key={w.topic}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#334155', fontWeight: '600' }}>{w.topic}</span>
                                        <span style={{ fontWeight: '700', color: w.color }}>{w.score}%</span>
                                    </div>
                                    <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${w.score}%`, height: '100%', backgroundColor: w.color, borderRadius: '9999px' }} />
                                    </div>
                                </div>
                            )})}
                            {!sessions.length && <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No topics yet.</p>}
                        </div>
                    </div>

                    {/* Recent Quizzes */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Recent Quizzes
                            </h3>
                            <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer' }}>
                                View All →
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {quizSessions.slice(0, 5).map((s) => {
                                const qCount = (s.generated?.practiceQuestions || []).length
                                const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'
                                return (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>{s.title}</div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{qCount} questions • {date}</div>
                                    </div>
                                    <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#334155' }}>{s.progress}%</span>
                                </div>
                            )})}
                            {!quizSessions.length && <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No recent quizzes.</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Assessments
