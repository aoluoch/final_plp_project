import React from 'react'

const PickupSchedule: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Pickup Schedule
        </h1>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <span className="text-4xl mb-4 block">📅</span>
          <p>No scheduled pickups</p>
          <p className="text-sm">Your pickup schedule will appear here</p>
        </div>
      </div>
    </div>
  )
}

export default PickupSchedule
