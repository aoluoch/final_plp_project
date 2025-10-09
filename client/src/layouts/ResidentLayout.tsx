import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const ResidentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme, actualTheme } = useTheme()
  const location = useLocation()

  const residentNavItems = [
    { name: 'Dashboard', href: '/resident/dashboard', icon: '🏠' },
    { name: 'Report Waste', href: '/resident/report', icon: '📝' },
    { name: 'Schedule', href: '/resident/schedule', icon: '📅' },
    { name: 'Notifications', href: '/resident/notifications', icon: '🔔' },
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
          navItems={residentNavItems}
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

export default ResidentLayout
