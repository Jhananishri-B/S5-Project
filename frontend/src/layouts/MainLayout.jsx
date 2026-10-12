import React from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

export const MainLayout = () => {
    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
            {/* Fixed/Sticky Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div style={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                height: '100vh',
                overflowY: 'auto',
            }}>
                <Topbar />
                <main style={{
                    flexGrow: 1,
                    padding: '28px 36px 64px',
                    backgroundColor: '#f8fafc',
                }}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
