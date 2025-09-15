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
      backgroundImage: 'url("/background1.jpg"), linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      ...customCursor
    }}>
      {/* Overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)'
      }}></div>

      {/* Floating elements animation */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        animation: 'float1 6s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '15%',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        animation: 'float2 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        animation: 'float3 8s ease-in-out infinite'
      }}></div>

      {/* Main login card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '25px',
        padding: '50px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        zIndex: 10,
        animation: 'slideUp 0.8s ease-out'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'bounce 2s ease-in-out infinite'
          }}>🌱</div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            Renewable Energy Platform
          </h1>
          <p style={{
            color: '#666',
            fontSize: '18px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Learn about sustainable energy solutions
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '2px solid #f87171',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '25px',
            textAlign: 'center',
            animation: 'shake 0.5s ease-in-out'
          }}>
            <div style={{
              color: '#dc2626',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}>
              ⚠️ {error}
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#333',
              fontSize: '16px'
            }}>
              👤 Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%',
                  padding: '18px 20px 18px 50px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '15px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1'
                  e.target.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                  e.target.style.transform = 'translateY(0px)'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                color: '#9ca3af'
              }}>
                👤
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              fontWeight: '600',
              color: '#333',
              fontSize: '16px'
            }}>
              🔒 Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%',
                  padding: '18px 20px 18px 50px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '15px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.9)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6366f1'
                  e.target.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                  e.target.style.transform = 'translateY(0px)'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px',
                color: '#9ca3af'
              }}>
                🔒
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-3px)'
                e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Signing in...
              </div>
            ) : (
              '🚀 Sign In'
            )}
          </button>
        </form>

        {/* Demo credentials */}
        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          padding: '25px',
          borderRadius: '15px',
          marginTop: '30px',
          border: '2px solid #d1d5db'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textAlign: 'center',
            color: '#333'
          }}>
            🎯 Demo Credentials
          </h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              padding: '8px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: '500' }}>👨‍🎓 Student Portal:</span>
              <strong style={{ color: '#2563eb' }}>admin / admin123</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: '500' }}>👨‍🏫 Teacher Portal:</span>
              <strong style={{ color: '#059669' }}>admin1 / admin123</strong>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '15px',
            fontWeight: '500'
          }}>
            🌟 Explore renewable energy topics:
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {[
              { emoji: '☀️', name: 'Solar', color: '#f59e0b' },
              { emoji: '💧', name: 'Hydro', color: '#3b82f6' },
              { emoji: '🔥', name: 'Geothermal', color: '#ef4444' },
              { emoji: '💨', name: 'Wind', color: '#10b981' }
            ].map((energy, index) => (
              <div
                key={energy.name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  animation: `float${index + 1} 3s ease-in-out infinite`,
                  animationDelay: `${index * 0.5}s`
                }}
              >
                <div style={{
                  fontSize: '28px',
                  padding: '8px',
                  borderRadius: '50%',
                  background: `${energy.color}20`,
                  border: `2px solid ${energy.color}30`
                }}>
                  {energy.emoji}
                </div>
                <span style={{
                  fontSize: '11px',
                  color: energy.color,
                  fontWeight: 'bold'
                }}>
                  {energy.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
        }
      `}</style>
    </div>
  )
}

export default BeautifulLoginPage