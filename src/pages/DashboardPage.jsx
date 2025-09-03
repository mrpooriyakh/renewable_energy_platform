import React from 'react'
import Dashboard from '../components/Dashboard'
import './DashboardPage.css'

const DashboardPage = ({ user, onLogout }) => {
  return (
    <div className="dashboard-page">
      <Dashboard user={user} onLogout={onLogout} />
    </div>
  )
}

export default DashboardPage