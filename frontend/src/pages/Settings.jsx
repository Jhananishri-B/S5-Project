import React, { useState } from 'react'
import {
    Settings as SettingsIcon,
    Server,
    Database,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Eye,
    Sliders,
    Bell,
    SlidersHorizontal
} from 'lucide-react'
import { checkBackendHealth, checkDatabaseHealth, API_BASE_URL } from '../services/api'

export const Settings = () => {
    // Accessibility preferences
    const [videoSpeed, setVideoSpeed] = useState('1.0x')
    const [captionSize, setCaptionSize] = useState('Medium')
    const [highContrast, setHighContrast] = useState(false)
    const [reducedMotion, setReducedMotion] = useState(false)

    // Full-Stack backend health testing
    const [backendStatus, setBackendStatus] = useState(null)
    const [dbStatus, setDbStatus] = useState(null)
    const [testingHealth, setTestingHealth] = useState(false)

    const handleTestHealth = async () => {
        setTestingHealth(true)
        try {
            const bRes = await checkBackendHealth()
            setBackendStatus(bRes)
        } catch (err) {
            setBackendStatus({ status: 'error', message: err.message })
        }

        try {
            const dRes = await checkDatabaseHealth()
            setDbStatus(dRes)
        } catch (err) {
            setDbStatus({ status: 'error', message: err.message })
        }
        setTestingHealth(false)
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '26px' }}>
            {/* Header */}
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
                    <SettingsIcon size={14} />
                    <span>Settings & Preferences</span>
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                    Platform Settings
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
                    Manage your accessibility preferences, display settings, and verify full-stack backend connectivity.
                </p>
            </div>

            {/* Accessibility Preferences Card */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <Eye size={20} color="#2563eb" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        Accessibility & Viewing Preferences
                    </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                    {/* ISL Video Speed */}
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                            ISL Video Speed
                        </label>
                        <select
                            value={videoSpeed}
                            onChange={(e) => setVideoSpeed(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        >
                            <option>0.75x (Slower Signing)</option>
                            <option>1.0x (Standard Speed)</option>
                            <option>1.25x (Faster)</option>
                        </select>
                    </div>

                    {/* Caption Size */}
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '6px' }}>
                            Caption Font Size
                        </label>
                        <select
                            value={captionSize}
                            onChange={(e) => setCaptionSize(e.target.value)}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        >
                            <option>Standard (14px)</option>
                            <option>Medium (16px)</option>
                            <option>Large (18px)</option>
                            <option>Extra Large (22px)</option>
                        </select>
                    </div>

                    {/* High Contrast Toggle */}
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                            High Contrast Mode
                        </label>
                        <button
                            onClick={() => setHighContrast(!highContrast)}
                            style={{
                                width: '46px',
                                height: '24px',
                                borderRadius: '9999px',
                                backgroundColor: highContrast ? '#2563eb' : '#cbd5e1',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                left: highContrast ? '24px' : '2px',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                transition: 'left 0.2s'
                            }} />
                        </button>
                    </div>

                    {/* Reduced Motion Toggle */}
                    <div>
                        <label style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                            Reduced Motion
                        </label>
                        <button
                            onClick={() => setReducedMotion(!reducedMotion)}
                            style={{
                                width: '46px',
                                height: '24px',
                                borderRadius: '9999px',
                                backgroundColor: reducedMotion ? '#2563eb' : '#cbd5e1',
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{
                                position: 'absolute',
                                top: '2px',
                                left: reducedMotion ? '24px' : '2px',
                                width: '20px',
                                height: '20px',
                                backgroundColor: '#ffffff',
                                borderRadius: '50%',
                                transition: 'left 0.2s'
                            }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Backend & Database Foundation Integration Card */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Server size={20} color="#2563eb" />
                        <div>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                                Backend & Database Connectivity
                            </h2>
                            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Connecting to <code>{API_BASE_URL}</code>
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleTestHealth}
                        disabled={testingHealth}
                        style={{
                            backgroundColor: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: testingHealth ? 'wait' : 'pointer'
                        }}
                    >
                        <RefreshCw size={15} className={testingHealth ? 'spin' : ''} />
                        <span>{testingHealth ? 'Testing Endpoints...' : 'Test Backend Connection'}</span>
                    </button>
                </div>

                {/* Endpoint Status Results */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* FastAPI Service Health */}
                    <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Server size={16} color="#2563eb" />
                            <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>FastAPI Service (/health)</span>
                        </div>
                        {backendStatus ? (
                            <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                                <span style={{ color: backendStatus.status === 'healthy' ? '#059669' : '#dc2626', fontWeight: '700' }}>
                                    ● Status: {backendStatus.status}
                                </span>
                                <pre style={{ fontSize: '0.72rem', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', marginTop: '6px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
                                    {JSON.stringify(backendStatus, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                                Click "Test Backend Connection" to ping FastAPI on port 8000.
                            </p>
                        )}
                    </div>

                    {/* MongoDB Atlas Connectivity */}
                    <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Database size={16} color="#059669" />
                            <span style={{ fontWeight: '700', fontSize: '0.88rem' }}>MongoDB Atlas (/health/db)</span>
                        </div>
                        {dbStatus ? (
                            <div style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                                <span style={{ color: dbStatus.connected ? '#059669' : '#d97706', fontWeight: '700' }}>
                                    ● Status: {dbStatus.status} {dbStatus.connected ? '(Connected)' : '(Pending Atlas URI)'}
                                </span>
                                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '4px 0 0' }}>
                                    {dbStatus.message}
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>
                                Reports live connection verification or graceful unconfigured diagnostic status.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
