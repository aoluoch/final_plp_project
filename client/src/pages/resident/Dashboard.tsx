import React from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/Button'
import { Link } from 'react-router-dom'

const ResidentDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your waste reports and track pickup schedules
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/resident/report">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Report Waste
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Report new waste issues
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/resident/schedule">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pickup Schedule
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  View upcoming pickups
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/resident/notifications">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl">🔔</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  View your notifications
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                My Reports
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                View all your reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Reports
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <span className="text-4xl mb-4 block">📋</span>
            <p>No reports yet</p>
            <p className="text-sm">Start by reporting a waste issue</p>
            <Link to="/resident/report" className="mt-4 inline-block">
              <Button variant="primary">Report Waste</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResidentDashboard
