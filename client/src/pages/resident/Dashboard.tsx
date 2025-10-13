import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/Button'
import { Link } from 'react-router-dom'

const ResidentDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6 font-['Poppins']">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 lg:gap-6">
        <Link to="/resident/report">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                <span className="text-xl lg:text-2xl">📝</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Report Waste
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate">
                  Report new waste issues
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/resident/schedule">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                <span className="text-xl lg:text-2xl">📅</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Pickup Schedule
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate">
                  View upcoming pickups
                </p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/resident/notifications">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
                <span className="text-xl lg:text-2xl">🔔</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  Notifications
                </h3>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate">
                  View your notifications
                </p>
              </div>
            </div>
          </div>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3 lg:mr-4">
              <span className="text-xl lg:text-2xl">📊</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white truncate">
                My Statistics
              </h3>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 truncate">
                View your statistics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

        {/* Statistics Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Statistics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">0</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Resolved</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow lg:col-span-2 xl:col-span-1">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Tips
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">✓</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Take clear photos of waste issues for better tracking
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">✓</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Report issues as soon as you notice them
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-green-500 mt-1">✓</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Check pickup schedules regularly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResidentDashboard
