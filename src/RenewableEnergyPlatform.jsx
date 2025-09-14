import React from 'react'
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'

// Standalone Renewable Energy Platform Component
const RenewableEnergyPlatform = ({ 
  initialPath = '/', 
  containerStyle = {}, 
  onUserLogin = null,
  onUserLogout = null 
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [user, setUser] = React.useState(null)

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
    if (onUserLogin) onUserLogin(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    if (onUserLogout) onUserLogout()
  }

  return (
    <div className="renewable-energy-platform" style={containerStyle}>
      <Router initialEntries={[initialPath]}>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
                <DashboardPage user={user} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

export default RenewableEnergyPlatform

// Named exports for individual components if needed
export { default as LoginPage } from './pages/LoginPage'
export { default as DashboardPage } from './pages/DashboardPage'
export { default as AdminDashboard } from './components/AdminDashboard'
export { default as StudentDashboard } from './components/Dashboard'
export { default as AIChatbot } from './components/AIChatbot'
export { useCourseStore } from './store/courseStore'