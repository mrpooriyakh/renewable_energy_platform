import React from 'react'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Renewable Energy Learning Platform</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Your Learning Dashboard</h2>
          <p>Explore the fascinating world of renewable energy technologies</p>
        </div>
        
        <div className="coming-soon">
          <h3>🚧 Platform Under Development</h3>
          <p>We're building amazing features for your renewable energy education journey!</p>
        </div>
      </main>
    </div>
  )
}

export default Dashboard