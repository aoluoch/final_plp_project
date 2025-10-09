import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const CollectorLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme, actualTheme } = useTheme()
  const location = useLocation()

  const collectorNavItems = [
    { name: 'Dashboard', href: '/collector/dashboard', icon: '📊' },
    { name: 'My Tasks', href: '/collector/dashboard', icon: '📋' },
    { name: 'Chat', href: '/collector/chat', icon: '💬' },
  ]

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar 
        user={user}
        onLogout={logout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        theme={theme}
        onThemeChange={setTheme}
      />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navItems={collectorNavItems}
          currentPath={location.pathname}
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default CollectorLayout
