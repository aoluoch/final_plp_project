import React from 'react'

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Notifications
        </h1>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <span className="text-4xl mb-4 block">🔔</span>
          <p>No notifications</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      </div>
    </div>
  )
}

export default Notifications
