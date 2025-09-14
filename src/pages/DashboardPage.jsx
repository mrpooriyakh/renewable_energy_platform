import React from 'react'
import Dashboard from '../components/Dashboard'
import AdminDashboard from '../components/AdminDashboard'
import './DashboardPage.css'

const DashboardPage = ({ user, onLogout }) => {
  return (
    <div className="dashboard-page">
      {user.role === 'admin' ? (
        <AdminDashboard user={user} onLogout={onLogout} />
      ) : (
        <Dashboard user={user} onLogout={onLogout} />
      )}
    </div>
  )
}

export default DashboardPage