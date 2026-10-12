import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
    LayoutDashboard,
    FileEdit,
    Hand,
    BookOpen,
    CheckSquare,
    ShieldCheck,
    Settings,
    BookMarked
} from 'lucide-react'
import { StudentBannerIllustration } from './SVGIcons'

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Content Studio', path: '/content-studio', icon: FileEdit },
    { name: 'ISL Resource Center', path: '/isl-resources', icon: Hand },
    { name: 'Learning Materials', path: '/learning-materials', icon: BookOpen },
    { name: 'Assessments', path: '/assessments', icon: CheckSquare },
    { name: 'Quality & Accessibility', path: '/quality-accessibility', icon: ShieldCheck },
]

export const Sidebar = () => {
    const location = useLocation()

    // Dynamic banner title matching reference screenshots
    const getBannerTitle = () => {
        switch (location.pathname) {
            case '/content-studio':
                return "Accessible Education Empowers Brighter Futures"
            case '/isl-resources':
                return "Sign Learn Achieve Together"
            case '/learning-materials':
                return "Accessible Learning Creates Greater Opportunities"
            case '/assessments':
                return "Practice Learn Build Confidence"
            case '/quality-accessibility':
                return "Ensuring Quality & High Accessibility"
            default:
                return "Breaking Barriers Through Inclusive Education"
        }
    }

    return (
        <aside style={{
            width: '260px',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'sticky',
            top: 0,
            flexShrink: 0,
            zIndex: 40,
        }}>
            {/* Brand Header */}
            <div style={{
                padding: '24px 20px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563eb',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)'
                }}>
                    <BookMarked size={26} strokeWidth={2.2} />
                </div>
                <div>
                    <h1 style={{
                        fontSize: '1.15rem',
                        fontWeight: '800',
                        color: '#0f172a',
                        margin: 0,
                        lineHeight: '1.2',
                        letterSpacing: '-0.02em'
                    }}>
                        LearnBridge AI
                    </h1>
                    <p style={{
                        fontSize: '0.72rem',
                        color: '#64748b',
                        margin: '2px 0 0',
                        fontWeight: '500'
                    }}>
                        Inclusive Learning for All
                    </p>
                </div>
            </div>

            {/* Main Navigation */}
            <nav style={{
                padding: '20px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                flexGrow: 1,
                overflowY: 'auto'
            }}>
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '11px 16px',
                                borderRadius: '10px',
                                fontSize: '0.92rem',
                                fontWeight: isActive ? '700' : '500',
                                textDecoration: 'none',
                                color: isActive ? '#2563eb' : '#475569',
                                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                                transition: 'all 0.15s ease-in-out',
                                position: 'relative'
                            }}
                        >
                            <Icon size={19} color={isActive ? '#2563eb' : '#64748b'} strokeWidth={isActive ? 2.4 : 1.8} />
                            <span>{item.name}</span>
                            {isActive && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '18%',
                                    bottom: '18%',
                                    width: '3.5px',
                                    backgroundColor: '#2563eb',
                                    borderRadius: '0 4px 4px 0'
                                }} />
                            )}
                        </NavLink>
                    )
                })}
            </nav>

            {/* Motivational Student Banner */}
            <div style={{ padding: '0 16px 14px' }}>
                <StudentBannerIllustration title={getBannerTitle()} />
            </div>

            {/* Bottom Settings Link */}
            <div style={{
                padding: '14px 16px 20px',
                borderTop: '1px solid #f1f5f9'
            }}>
                <NavLink
                    to="/settings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontSize: '0.92rem',
                        fontWeight: location.pathname === '/settings' ? '700' : '500',
                        textDecoration: 'none',
                        color: location.pathname === '/settings' ? '#2563eb' : '#64748b',
                        backgroundColor: location.pathname === '/settings' ? '#eff6ff' : 'transparent'
                    }}
                >
                    <Settings size={19} strokeWidth={1.8} />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    )
}
