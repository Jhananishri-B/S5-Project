import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, Check } from 'lucide-react'
import { useLearningStore } from '../hooks/useLearningStore'

export const Topbar = () => {
    const navigate = useNavigate()
    const { sessions } = useLearningStore()
    const notifications = useMemo(() => {
        const items = []
        sessions.slice(0, 3).forEach((s) => {
            items.push({ id: s.id, text: `Saved material: ${s.title}`, path: `/learning-materials?session=${s.id}` })
        })
        return items
    }, [sessions])

    const [searchTerm, setSearchTerm] = useState('')
    const [showNotificationMenu, setShowNotificationMenu] = useState(false)
    const [showProfileMenu, setShowProfileMenu] = useState(false)

    return (
        <header style={{
            height: '72px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 30
        }}>
            {/* Search Bar */}
            <div style={{
                position: 'relative',
                width: '460px',
                maxWidth: '100%'
            }}>
                <Search
                    size={18}
                    color="#94a3b8"
                    style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)'
                    }}
                />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search topics, subjects, ISL signs, or your materials..."
                    style={{
                        width: '100%',
                        padding: '10px 16px 10px 42px',
                        borderRadius: '9999px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.88rem',
                        color: '#0f172a',
                        outline: 'none',
                        transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#93c5fd'
                        e.target.style.backgroundColor = '#ffffff'
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0'
                        e.target.style.backgroundColor = '#f8fafc'
                    }}
                />
            </div>

            {/* Right Controls: Notifications & User Profile */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}>
                {/* Notification Bell */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                        aria-label="Notifications"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#475569',
                            position: 'relative',
                        }}
                    >
                        <Bell size={18} />
                        {/* Red Alert Badge */}
                        <span style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '8px',
                            height: '8px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            border: '2px solid #ffffff'
                        }} />
                    </button>

                    {showNotificationMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '48px',
                            width: '280px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            padding: '12px',
                            zIndex: 50
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem', marginBottom: '8px', color: '#0f172a' }}>
                                Notifications ({notifications.length})
                            </div>
                            {notifications.length === 0 ? (
                                <div style={{ fontSize: '0.8rem', color: '#64748b', padding: '6px 0' }}>No notifications yet.</div>
                            ) : notifications.map((n, i) => (
                                <button
                                    key={n.id}
                                    type="button"
                                    onClick={() => { navigate(n.path); setShowNotificationMenu(false) }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        fontSize: '0.8rem',
                                        color: '#475569',
                                        padding: '6px 0',
                                        borderBottom: i < notifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {n.text}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '8px',
                        }}
                    >
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            backgroundColor: '#fed7aa',
                            border: '2px solid #93c5fd',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                                <circle cx="18" cy="18" r="18" fill="#e0f2fe" />
                                <circle cx="18" cy="14" r="7" fill="#fed7aa" />
                                <path d="M11 13C11 8 14 6 18 6C22 6 25 8 25 13C25 16 23 18 23 18C22 13 20 10 18 10C16 10 14 13 13 18C13 18 11 16 11 13Z" fill="#1e293b" />
                                <path d="M7 32C7 26 12 23 18 23C24 23 29 26 29 32" fill="#2563eb" />
                            </svg>
                        </div>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: '#0f172a'
                        }}>
                            Student
                        </span>
                        <ChevronDown size={16} color="#64748b" />
                    </button>

                    {showProfileMenu && (
                        <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '48px',
                            width: '200px',
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            padding: '8px',
                            zIndex: 50
                        }}>
                            <div style={{ padding: '8px 12px', fontSize: '0.82rem', color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                                Signed in as <strong>Learner</strong>
                            </div>
                            <button
                                onClick={() => setShowProfileMenu(false)}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '8px 12px',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '0.85rem',
                                    color: '#0f172a',
                                    cursor: 'pointer',
                                    borderRadius: '6px'
                                }}
                            >
                                Profile & Accessibility Preferences
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
