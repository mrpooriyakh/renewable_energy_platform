import { useState } from 'react'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await onLogin(username, password)
    } catch (error) {
      setError(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '32px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div>
          <h2 style={{
            marginTop: '24px',
            textAlign: 'center',
            fontSize: '30px',
            fontWeight: '800',
            color: '#1f2937'
          }}>
            Renewable Energy Platform
          </h2>
          <p style={{
            marginTop: '8px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Sign in to your account
          </p>
        </div>
        <form style={{ marginTop: '32px' }} onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="username" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out'
              }}
              placeholder="Enter username"
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '4px'
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.15s ease-in-out'
              }}
              placeholder="Enter password"
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              fontSize: '14px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '8px 16px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px',
                color: 'white',
                backgroundColor: loading ? '#9ca3af' : '#6366f1',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease-in-out',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = '#4f46e5'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = '#6366f1'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
            marginTop: '24px'
          }}>
            <p>Demo credentials:</p>
            <p><strong>Student:</strong> admin / admin</p>
            <p><strong>Teacher:</strong> admin1 / admin1</p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage