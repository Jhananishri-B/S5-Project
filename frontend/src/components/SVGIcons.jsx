import React from 'react'

export const StudentBannerIllustration = ({ title = 'Inclusive learning for every student' }) => (
    <div
        style={{
            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
            borderRadius: '16px',
            padding: '16px',
            overflow: 'hidden',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        }}
    >
        <svg width="72" height="72" viewBox="0 0 100 100" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="50" cy="50" r="46" fill="#93c5fd" opacity="0.3" />
            <path d="M22 88C22 72 32 64 50 64C68 64 78 72 78 88" fill="#2563eb" />
            <circle cx="50" cy="42" r="16" fill="#fed7aa" />
            <path d="M34 40C34 26 40 22 50 22C60 22 66 26 66 40C66 43 64 45 64 45C62 36 58 32 50 32C42 32 38 36 36 45C36 45 34 43 34 40Z" fill="#1e293b" />
        </svg>
        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#1e3a8a', lineHeight: '1.3' }}>{title}</div>
    </div>
)
