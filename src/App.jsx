import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <div className="app">
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/main-dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/main-dashboard" 
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

export default App