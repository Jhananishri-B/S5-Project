import React, { useState, useMemo } from 'react'
import { useLearningStore } from '../hooks/useLearningStore'
import { computeQualityMetrics } from '../services/learningStore'
import {
    ShieldCheck,
    Download,
    CheckCircle,
    AlertTriangle,
    FileText,
    Video,
    BarChart2,
    Layers,
    ArrowRight,
    ExternalLink,
    Plus,
    RefreshCw,
    HelpCircle
} from 'lucide-react'
export const QualityAccessibility = () => {
    const { sessions } = useLearningStore()
    const metrics = useMemo(() => computeQualityMetrics(), [sessions])
    const { summary, evaluations, missingTerms, coverageBreakdown, compare, reviewQueue } = metrics
    const [filterSubject, setFilterSubject] = useState('All')

    const filteredEvaluations = filterSubject === 'All' ? evaluations : evaluations.filter((e) => e.subject === filterSubject)

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(metrics, null, 2)], { type: 'application/json' })
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = 'accessibility_report.json'
        a.click()
        URL.revokeObjectURL(a.href)
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
                        <ShieldCheck size={14} />
                        <span>Quality & Accessibility Lab</span>
                    </div>
                    <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                        Quality & Accessibility Lab
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                        Audit learning material clarity, caption accuracy, ISL coverage, and syntactic readability from your library.
                    </p>
                </div>

                {/* Right Action: Export Report */}
                <button
                    onClick={handleExport}
                    disabled={!sessions.length}
                    style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                    }}
                >
                    <Download size={16} /> Export Report
                </button>
            </div>

            {/* 4 Quality Metric Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px'
            }}>
                {[
                    { label: 'Caption Accuracy', value: `${summary.captionAccuracy.score}%`, status: summary.captionAccuracy.status, color: '#2563eb', sub: 'Target: 90%+' },
                    { label: 'ISL Coverage', value: `${summary.islCoverage.score}%`, status: summary.islCoverage.status, color: '#3b82f6', sub: 'Target: 80%+' },
                    { label: 'Readability Score', value: `${summary.readabilityScore.score}%`, status: summary.readabilityScore.status, color: '#10b981', sub: `Target: ${summary.readabilityScore.target}%+` },
                    { label: 'Overall Quality', value: `${summary.overallQuality.score}%`, status: summary.overallQuality.status, color: '#0ea5e9', sub: `Target: ${summary.overallQuality.target}%+` },
                ].map((m, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '14px',
                            padding: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}
                    >
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b' }}>
                                {m.label}
                            </div>
                            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 2px' }}>
                                {m.value}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#059669', backgroundColor: '#ecfdf5', padding: '2px 8px', borderRadius: '4px' }}>
                                {m.status}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {m.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Grid: Left 8 cols & Right 4 cols */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '24px'
            }}>
                {/* Left Column (8 cols): Evaluation Table & Content Comparison */}
                <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Detailed Evaluation Table */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '22px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Detailed Evaluation Table
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {filteredEvaluations.length} module(s)
                            </span>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Topic</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Subject</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Caption</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>ISL Availability</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Readability</th>
                                        <th style={{ padding: '10px 12px', fontWeight: '700' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEvaluations.length === 0 ? (
                                        <tr><td colSpan={6} style={{ padding: '16px', color: '#64748b' }}>No content to audit yet. Generate materials in Content Studio.</td></tr>
                                    ) : filteredEvaluations.map(row => (
                                        <tr key={row.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '12px', fontWeight: '700', color: '#0f172a' }}>{row.topic}</td>
                                            <td style={{ padding: '12px', color: '#475569' }}>{row.subject}</td>
                                            <td style={{ padding: '12px', fontWeight: '600', color: '#2563eb' }}>{row.captionScore}</td>
                                            <td style={{ padding: '12px', color: '#334155' }}>{row.islAvailable}</td>
                                            <td style={{ padding: '12px', color: '#475569' }}>{row.readabilityGrade}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '3px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: '700',
                                                    backgroundColor: row.status === 'Approved' ? '#ecfdf5' : row.status === 'Under Review' ? '#eff6ff' : '#fff7ed',
                                                    color: row.status === 'Approved' ? '#059669' : row.status === 'Under Review' ? '#2563eb' : '#c2410c'
                                                }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Original-versus-Simplified Content Comparison */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '22px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 2px' }}>
                                    Original vs. Simplified Content Comparison
                                </h3>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>From your latest generated session</span>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '16px'
                        }}>
                            {/* Original Textbook Material */}
                            <div style={{
                                backgroundColor: '#fff1f2',
                                borderRadius: '10px',
                                border: '1px solid #fecdd3',
                                padding: '16px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#be123c', textTransform: 'uppercase' }}>
                                        Original Textbook Excerpt
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#9f1239' }}>Grade 11.4 Complexity</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#4c0519', lineHeight: '1.5', margin: 0 }}>
                                    {compare?.original || 'Upload a source file in Content Studio to compare original vs simplified text.'}
                                </p>
                                <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#e11d48' }}>
                                    ⚠️ Complex passive clauses, high syntactic density.
                                </div>
                            </div>

                            {/* LearnBridge Simplified Material */}
                            <div style={{
                                backgroundColor: '#ecfdf5',
                                borderRadius: '10px',
                                border: '1px solid #a7f3d0',
                                padding: '16px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                                        LearnBridge Accessible Notes
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: '#065f46' }}>Grade 6.8 Readability</span>
                                </div>
                                <p style={{ fontSize: '0.82rem', color: '#064e3b', lineHeight: '1.5', margin: 0 }}>
                                    {compare?.simplified || '—'}
                                </p>
                                <div style={{ marginTop: '10px', fontSize: '0.72rem', color: '#059669', fontWeight: '600' }}>
                                    ✓ Direct subject-verb-object structure, integrated ISL glossing.
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column (4 cols): Accessibility Coverage Chart, Missing ISL Resources, Review Queue */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Accessibility Coverage Breakdown */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0f172a', margin: '0 0 14px' }}>
                            Accessibility Coverage Chart
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {coverageBreakdown.map(cov => (
                                <div key={cov.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#334155', fontWeight: '600' }}>{cov.name}</span>
                                        <span style={{ fontWeight: '700', color: '#0f172a' }}>{cov.pct}%</span>
                                    </div>
                                    <div style={{ height: '7px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                                        <div style={{ width: `${cov.pct}%`, height: '100%', backgroundColor: cov.color, borderRadius: '9999px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Missing ISL Resources List */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Missing ISL Resources
                            </h3>
                            <span style={{ fontSize: '0.74rem', color: '#ef4444', fontWeight: '700' }}>
                                {missingTerms.filter((m) => m.priority === 'High').length} high priority
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {missingTerms.length === 0 ? (
                                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>No missing ISL entries reported.</p>
                            ) : missingTerms.map(m => (
                                <div key={m.term} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#0f172a' }}>{m.term}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{m.subject} • {m.requests} requests</div>
                                    </div>
                                    <button
                                        onClick={() => window.location.assign('/isl-resources')}
                                        style={{
                                            backgroundColor: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            color: '#2563eb',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.72rem',
                                            fontWeight: '700',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        + Record
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Queue */}
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 12px' }}>
                            Editorial Review Queue
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                            {reviewQueue.length === 0 ? (
                                <p style={{ margin: 0, color: '#64748b' }}>Nothing in the review queue.</p>
                            ) : reviewQueue.map((item) => (
                                <div key={item.title} style={{ padding: '8px', borderLeft: '3px solid #2563eb', backgroundColor: '#f8fafc' }}>
                                    <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.title}</span>
                                    <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.74rem' }}>{item.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default QualityAccessibility
