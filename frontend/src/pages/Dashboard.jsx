import React, { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    BookOpen,
    CheckCircle,
    Clock,
    Target,
    Play,
    Bookmark,
    ArrowRight,
    FileText,
    Lightbulb,
    Video,
    Calendar,
} from 'lucide-react'
import { useLearningStore } from '../hooks/useLearningStore'
import {
    computeDashboardMetrics,
    sessionToMaterialCards,
    buildTodaysPlan,
    updateSession,
} from '../services/learningStore'

const formatDate = () =>
    new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

const materialLink = (mat) => {
    const tab =
        mat.type === 'notes' ? 'notes' : mat.type === 'video' ? 'video' : mat.type === 'quiz' ? 'summary' : 'diagrams'
    return { pathname: '/learning-materials', search: `?session=${mat.sessionId}&tab=${tab}` }
}

export const Dashboard = () => {
    const navigate = useNavigate()
    const { sessions, youtubeTabUrl, toggleBookmark, isBookmarked } = useLearningStore()

    const metrics = useMemo(() => computeDashboardMetrics(sessions), [sessions])
    const continueSession = sessions.find((s) => s.progress < 100) || sessions[0]
    const materialCards = useMemo(() => sessions.flatMap(sessionToMaterialCards), [sessions])
    const todaysPlan = useMemo(() => buildTodaysPlan(continueSession), [continueSession])

    const stats = [
        {
            id: 'materials',
            label: 'Learning Materials',
            value: String(metrics.materialCount),
            subtext: metrics.materialCount ? 'From your library' : 'Generate in Content Studio',
            color: '#2563eb',
            bgColor: '#eff6ff',
        },
        {
            id: 'topics',
            label: 'Topics Completed',
            value: String(metrics.topicsCompleted),
            subtext: `Out of ${metrics.topicsTotal} topics`,
            color: '#10b981',
            bgColor: '#ecfdf5',
        },
        {
            id: 'study_time',
            label: 'Total Study Time',
            value: `${metrics.studyHours} hours`,
            subtext: sessions.length ? 'Based on your sessions' : 'Start learning to track',
            color: '#3b82f6',
            bgColor: '#eff6ff',
        },
        {
            id: 'streak',
            label: 'Current Streak',
            value: metrics.streak ? `${metrics.streak} days` : '—',
            subtext: metrics.streak ? 'Keep it up!' : 'No activity yet',
            color: '#2563eb',
            bgColor: '#eff6ff',
        },
    ]

    const openYoutubeContinue = () => {
        const url = continueSession?.youtubeUrl || youtubeTabUrl || 'https://www.youtube.com'
        window.open(url, '_blank', 'noopener,noreferrer')
        if (continueSession) {
            const next = Math.min(100, (continueSession.progress || 0) + 15)
            updateSession(continueSession.id, { progress: next })
        }
    }

    const openMaterial = (mat) => {
        const { pathname, search } = materialLink(mat)
        navigate({ pathname, search })
    }

    const recommended = sessions.length
        ? []
        : [
              { id: 'rec-studio', title: 'Create your first accessible notes', subject: 'Content Studio', path: '/content-studio', action: 'Open Studio →' },
              { id: 'rec-isl', title: 'Browse verified ISL terms', subject: 'ISL', path: '/isl-resources', action: 'Explore →' },
          ]

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Welcome back!
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        {sessions.length
                            ? 'Continue learning with accessible and personalized materials.'
                            : 'Upload content in Content Studio to build your learning library.'}
                    </p>
                </div>
                <div
                    style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)',
                        padding: '12px 20px',
                        borderRadius: '14px',
                        border: '1px solid #bfdbfe',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        boxShadow: '0 2px 6px rgba(37, 99, 235, 0.05)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', color: '#1e3a8a', fontSize: '0.92rem' }}>
                        <Calendar size={16} color="#2563eb" />
                        <span>{formatDate()}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '14px',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: stat.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: stat.color,
                            }}
                        >
                            {stat.id === 'materials' && <BookOpen size={24} />}
                            {stat.id === 'topics' && <CheckCircle size={24} />}
                            {stat.id === 'study_time' && <Clock size={24} />}
                            {stat.id === 'streak' && <Target size={24} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>{stat.label}</div>
                            <div style={{ fontSize: '1.45rem', fontWeight: '800', color: '#0f172a' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.subtext}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '28px' }}>
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Continue Learning</h2>
                            <Link to="/learning-materials" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>

                        {continueSession ? (
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div
                                    style={{
                                        width: '220px',
                                        height: '124px',
                                        flexShrink: 0,
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                    }}
                                >
                                    <Video size={40} opacity={0.9} />
                                </div>
                                <div style={{ flexGrow: 1, minWidth: '240px' }}>
                                    <span style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase' }}>
                                        {continueSession.subject}
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '4px 0 14px' }}>{continueSession.title}</h3>
                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb' }}>{continueSession.progress}%</span>
                                        </div>
                                        <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${continueSession.progress}%`, height: '100%', backgroundColor: '#2563eb' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            type="button"
                                            onClick={openYoutubeContinue}
                                            style={{
                                                backgroundColor: '#2563eb',
                                                color: '#ffffff',
                                                padding: '10px 20px',
                                                borderRadius: '8px',
                                                fontSize: '0.88rem',
                                                fontWeight: '600',
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <Play size={16} fill="#ffffff" /> Continue Learning
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleBookmark(continueSession.id)}
                                            style={{
                                                width: '42px',
                                                height: '42px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                backgroundColor: isBookmarked(continueSession.id) ? '#eff6ff' : '#ffffff',
                                                color: isBookmarked(continueSession.id) ? '#2563eb' : '#64748b',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                            }}
                                            aria-label="Bookmark"
                                        >
                                            <Bookmark size={18} fill={isBookmarked(continueSession.id) ? '#2563eb' : 'none'} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', margin: 0 }}>
                                No topics yet.{' '}
                                <Link to="/content-studio" style={{ color: '#2563eb', fontWeight: '600' }}>
                                    Generate materials in Content Studio
                                </Link>
                            </p>
                        )}
                    </div>

                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Your Learning Materials</h2>
                            <Link to="/learning-materials" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                View All <ArrowRight size={14} />
                            </Link>
                        </div>

                        {materialCards.length === 0 ? (
                            <div style={{ padding: '24px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                Materials you generate will appear here with saved notes for future reference.
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                                {materialCards.map((mat) => (
                                    <div
                                        key={mat.id}
                                        style={{
                                            backgroundColor: '#ffffff',
                                            borderRadius: '14px',
                                            padding: '16px',
                                            border: '1px solid #e2e8f0',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            minHeight: mat.type === 'notes' ? '240px' : '180px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                height: '64px',
                                                borderRadius: '8px',
                                                backgroundColor: mat.type === 'notes' ? '#f0f9ff' : mat.type === 'quiz' ? '#fffbeb' : '#f8fafc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                marginBottom: '12px',
                                            }}
                                        >
                                            {mat.type === 'notes' && <FileText size={32} color="#0284c7" />}
                                            {mat.type === 'diagram' && <BookOpen size={32} color="#15803d" />}
                                            {mat.type === 'video' && <Video size={32} color="#2563eb" />}
                                            {mat.type === 'quiz' && <Lightbulb size={32} color="#f59e0b" />}
                                        </div>
                                        <span
                                            style={{
                                                fontSize: '0.72rem',
                                                fontWeight: '700',
                                                padding: '3px 8px',
                                                borderRadius: '6px',
                                                backgroundColor: mat.badgeType === 'orange' ? '#fff7ed' : '#eff6ff',
                                                color: mat.badgeType === 'orange' ? '#c2410c' : '#2563eb',
                                                alignSelf: 'flex-start',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            {mat.badge}
                                        </span>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', margin: '0 0 4px' }}>{mat.title}</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                                            {mat.subject} • {mat.meta}
                                        </p>
                                        {mat.type === 'notes' && mat.notes && (
                                            <p
                                                style={{
                                                    fontSize: '0.72rem',
                                                    color: '#475569',
                                                    margin: '10px 0 0',
                                                    lineHeight: 1.45,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 3,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {mat.notes}
                                            </p>
                                        )}
                                        {mat.type === 'notes' && (
                                            <div
                                                style={{
                                                    marginTop: '10px',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px dashed #cbd5e1',
                                                    background: '#f8fafc',
                                                    fontSize: '0.72rem',
                                                    color: '#64748b',
                                                }}
                                            >
                                                {mat.islVideoUrl ? (
                                                    <a href={mat.islVideoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                                                        Watch ISL video
                                                    </a>
                                                ) : (
                                                    <>ISL video — will generate when API key is configured</>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => openMaterial(mat)}
                                            style={{
                                                marginTop: 'auto',
                                                paddingTop: '12px',
                                                background: 'none',
                                                border: 'none',
                                                color: '#2563eb',
                                                fontSize: '0.82rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                            }}
                                        >
                                            {mat.action}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {recommended.length > 0 && (
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Recommended for You</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {recommended.map((rec) => (
                                    <div key={rec.id} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>{rec.subject}</span>
                                        <h4 style={{ fontSize: '0.88rem', fontWeight: '700', margin: '4px 0 12px' }}>{rec.title}</h4>
                                        <Link to={rec.path} style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: '700', textDecoration: 'none' }}>
                                            {rec.action}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Today&apos;s Plan</h3>
                            <Link to="/assessments" style={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                                View All <ArrowRight size={13} />
                            </Link>
                        </div>
                        {todaysPlan.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Add a topic to see your plan.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                {todaysPlan.map((plan, idx) => (
                                    <div key={plan.id} style={{ display: 'flex', gap: '14px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div
                                                style={{
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    backgroundColor: plan.active ? '#2563eb' : '#e2e8f0',
                                                    border: plan.active ? '3px solid #bfdbfe' : 'none',
                                                }}
                                            />
                                            {idx < todaysPlan.length - 1 && <div style={{ width: '2px', flexGrow: 1, backgroundColor: '#e2e8f0', margin: '4px 0' }} />}
                                        </div>
                                        <div style={{ flexGrow: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>{plan.title}</span>
                                                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{plan.duration}</span>
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>{plan.topic}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Your Progress</h3>
                            <Link to="/assessments" style={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                                Details →
                            </Link>
                        </div>
                        {metrics.subjectProgress.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Progress by subject appears after your first session.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {metrics.subjectProgress.map((subj) => (
                                    <div key={subj.subject}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: '600', color: '#334155' }}>{subj.subject}</span>
                                            <span style={{ fontWeight: '700' }}>{subj.progress}%</span>
                                        </div>
                                        <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{ width: `${subj.progress}%`, height: '100%', backgroundColor: subj.color }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '22px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: 0 }}>Accessibility Status</h3>
                            <Link to="/quality-accessibility" style={{ color: '#2563eb', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' }}>
                                View Details →
                            </Link>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                            {sessions.length
                                ? `${sessions.length} topic(s) in your library with saved accessible notes.`
                                : 'Generate content to track caption, ISL, and readability metrics.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
