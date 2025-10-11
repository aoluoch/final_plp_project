import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, setTheme, actualTheme } = useTheme()
  const location = useLocation()

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Reports', href: '/admin/reports', icon: '📋' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
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
          navItems={adminNavItems}
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

export default AdminLayout
