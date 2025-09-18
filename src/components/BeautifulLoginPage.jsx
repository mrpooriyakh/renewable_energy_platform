import { useState } from 'react'

function BeautifulLoginPage({ onLogin }) {
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

  const customCursor = {
    cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%2322c55e' d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E") 12 12, auto`
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: 'url("/background1.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      overflow: 'hidden',
      overflowY: 'auto',
      boxSizing: 'border-box',
      zIndex: 1000,
      ...customCursor
    }}>
      {/* Elegant overlay for better readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4))',
        backdropFilter: 'blur(1px)'
      }}></div>

      {/* Main login card with classic design */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))',
        borderRadius: '20px',
        padding: '30px 35px',
        maxWidth: '400px',
        width: '85%',
        minHeight: 'auto',
        boxShadow: `
          0 25px 50px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05)
        `,
        border: '2px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(20px)',
        transform: 'translateY(0)',
        transition: 'all 0.3s ease',
        margin: '10px'
      }}>
        {/* Elegant header */}
        <div style={{ textAlign: 'center', marginBottom: '25px', padding: '5px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            borderRadius: '50%',
            margin: '0 auto 15px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(34, 197, 94, 0.4)',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            position: 'relative',
            overflow: 'visible',
            flexShrink: 0
          }}>
            <span style={{
              fontSize: '36px',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              zIndex: 2,
              lineHeight: 1
            }}>🌱</span>
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '12px',
            letterSpacing: '-0.5px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Renewable Energy Platform
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: 0,
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            Learn about sustainable energy solutions
          </p>
        </div>

        {/* Error message with elegant styling */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Elegant login form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              letterSpacing: '0.025em'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                background: '#ffffff',
                color: '#1f2937', // Fixed: Dark text color
                fontWeight: '500',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e'
                e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              letterSpacing: '0.025em'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'all 0.3s ease',
                outline: 'none',
                background: '#ffffff',
                color: '#1f2937', // Fixed: Dark text color
                fontWeight: '500',
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#22c55e'
                e.target.style.boxShadow = '0 0 0 3px rgba(34, 197, 94, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb'
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(34, 197, 94, 0.4)',
              letterSpacing: '0.025em'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)'
                e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.5)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 4px 14px rgba(34, 197, 94, 0.4)'
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials with elegant styling */}
        <div style={{
          background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
          padding: '20px',
          borderRadius: '16px',
          marginTop: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: '700',
            marginBottom: '12px',
            textAlign: 'center',
            color: '#374151',
            letterSpacing: '0.025em'
          }}>
            Demo Credentials
          </h3>
          <div style={{ fontSize: '14px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(59, 130, 246, 0.05))',
              borderRadius: '10px',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}>
              <span style={{ fontWeight: '600', color: '#4b5563' }}>Student Portal:</span>
              <span style={{
                fontWeight: '700',
                color: '#2563eb',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '13px'
              }}>
                admin / admin123
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.05))',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.1)'
            }}>
              <span style={{ fontWeight: '600', color: '#4b5563' }}>Teacher Portal:</span>
              <span style={{
                fontWeight: '700',
                color: '#059669',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '13px'
              }}>
                admin1 / admin123
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default BeautifulLoginPage