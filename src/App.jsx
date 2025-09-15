import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import AdminPanel from './components/AdminPanel'
import StudentPanel from './components/StudentPanel'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        // Determine user role based on email
        const role = session.user.email === 'admin1@admin1.com' ? 'admin' : 'student'
        setUserRole(role)
      }
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          const role = session.user.email === 'admin1@admin1.com' ? 'admin' : 'student'
          setUserRole(role)
        } else {
          setUser(null)
          setUserRole(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (username, password) => {
    try {
      // Simple hardcoded authentication check
      const validCredentials = {
        'admin': 'admin123',
        'admin1': 'admin123'
      }

      // Check if credentials match
      if (validCredentials[username] !== password) {
        throw new Error('Invalid username or password')
      }

      console.log('Valid credentials provided, creating mock session...')

      // Create a mock user session for demo purposes
      const mockUser = {
        id: username === 'admin1' ? 'admin1-uuid' : 'admin-uuid',
        email: username === 'admin1' ? 'admin1@admin1.com' : 'admin@admin.com',
        user_metadata: {
          username: username,
          role: username === 'admin1' ? 'admin' : 'student'
        }
      }

      const mockSession = {
        user: mockUser,
        access_token: 'mock-token-' + username
      }

      // Set mock user state
      setUser(mockUser)
      setUserRole(username === 'admin1' ? 'admin' : 'student')

      console.log('Mock login successful:', mockSession)
      return { data: mockSession }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: '20px' }}>Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                userRole === 'admin' ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/student" replace />
                )
              ) : (
                <LoginPage onLogin={handleLogin} />
              )
            }
          />
          <Route
            path="/admin"
            element={
              user && userRole === 'admin' ? (
                <AdminPanel user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/student"
            element={
              user && userRole === 'student' ? (
                <StudentPanel user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App