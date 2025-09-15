import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function BeautifulStudentPanel({ user, onLogout }) {
  const [selectedEnergyType, setSelectedEnergyType] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchContent()

    const subscription = supabase
      .channel('content-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'content' },
        () => {
          fetchContent()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setContent(data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const energyTypes = {
    solar: {
      name: 'Solar Energy',
      emoji: '☀️',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      description: 'Harness the power of the sun'
    },
    hydro: {
      name: 'Hydro Energy',
      emoji: '💧',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      description: 'Energy from flowing water'
    },
    geothermal: {
      name: 'Geothermal Energy',
      emoji: '🔥',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #f87171, #ef4444)',
      description: 'Heat from Earth\'s core'
    },
    wind: {
      name: 'Wind Energy',
      emoji: '💨',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #34d399, #10b981)',
      description: 'Power from moving air'
    }
  }

  const contentCategories = {
    videos: {
      name: 'Videos',
      emoji: '🎥',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #a78bfa, #8b5cf6)'
    },
    software: {
      name: 'Software',
      emoji: '💻',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)'
    },
    textbooks: {
      name: 'Textbooks',
      emoji: '📚',
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #fb923c, #f97316)'
    }
  }

  const aiAssistant = {
    name: 'AI Assistant',
    emoji: '🤖',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #f472b6, #ec4899)',
    description: 'Your smart learning companion'
  }

  const getFilteredContent = () => {
    if (!selectedEnergyType || !selectedCategory) return []

    return content.filter(item => {
      const matchesEnergy = (item.energy_type || 'general') === selectedEnergyType
      const matchesCategory = (item.content_category || 'textbooks') === selectedCategory
      const matchesSearch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesEnergy && matchesCategory && matchesSearch
    })
  }

  const goBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null)
    } else if (selectedEnergyType) {
      setSelectedEnergyType(null)
    }
  }

  const customCursor = {
    cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%234ade80' d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E") 12 12, auto`
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...customCursor
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
            animation: 'spin 2s linear infinite'
          }}>⚡</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>Loading Renewable Energy Hub...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Main Dashboard View
  if (!selectedEnergyType) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        ...customCursor
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                🌱 Renewable Energy Learning Hub
              </h1>
              <p style={{
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '5px 0 0 0',
                fontSize: '16px'
              }}>
                Explore sustainable energy solutions
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ color: 'white', fontSize: '16px' }}>Welcome, {user.email}</span>
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '10px 20px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.target.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.target.style.transform = 'translateY(0px)'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '60px 20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 20px 0',
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
            }}>
              Choose Your Energy Source
            </h2>
            <p style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.9)',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Dive into the world of renewable energy and discover how we can power our future sustainably
            </p>
          </div>

          {/* Energy Type Blocks */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '60px'
          }}>
            {Object.entries(energyTypes).map(([key, type]) => (
              <div
                key={key}
                onClick={() => setSelectedEnergyType(key)}
                style={{
                  background: type.gradient,
                  borderRadius: '20px',
                  padding: '40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-10px) scale(1.02)'
                  e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px) scale(1)'
                  e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                  {type.emoji}
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 0 15px 0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {type.name}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {type.description}
                </p>
              </div>
            ))}
          </div>

          {/* AI Assistant Block */}
          <div style={{ textAlign: 'center' }}>
            <div
              onClick={() => alert('AI Assistant coming soon! 🤖✨')}
              style={{
                background: aiAssistant.gradient,
                borderRadius: '20px',
                padding: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
                maxWidth: '600px',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-8px) scale(1.02)'
                e.target.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px) scale(1)'
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                animation: 'pulse 3s ease-in-out infinite'
              }}></div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '100px', marginBottom: '25px' }}>
                  {aiAssistant.emoji}
                </div>
                <h3 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 0 20px 0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {aiAssistant.name}
                </h3>
                <p style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '0 0 15px 0',
                  lineHeight: '1.6'
                }}>
                  {aiAssistant.description}
                </p>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  display: 'inline-block',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'white'
                }}>
                  Coming Soon! ✨
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.1; transform: scale(1.1); }
          }
        `}</style>
      </div>
    )
  }

  // Category Selection View
  if (!selectedCategory) {
    const energyType = energyTypes[selectedEnergyType]

    return (
      <div style={{
        minHeight: '100vh',
        background: energyType.gradient,
        ...customCursor
      }}>
        {/* Header */}
        <header style={{
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button
                onClick={goBack}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '10px 15px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                ← Back
              </button>
              <div>
                <h1 style={{
                  fontSize: '32px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: 0,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {energyType.emoji} {energyType.name}
                </h1>
                <p style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '5px 0 0 0',
                  fontSize: '16px'
                }}>
                  {energyType.description}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '10px 20px',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                backdropFilter: 'blur(10px)'
              }}
            >
              Logout
            </button>
          </div>
        </header>

        {/* Category Blocks */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '60px 20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <h2 style={{
              fontSize: '40px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 20px 0',
              textShadow: '3px 3px 6px rgba(0,0,0,0.3)'
            }}>
              Choose Content Type
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {Object.entries(contentCategories).map(([key, category]) => (
              <div
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  background: category.gradient,
                  borderRadius: '20px',
                  padding: '40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-10px) scale(1.02)'
                  e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0px) scale(1)'
                  e.target.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                  {category.emoji}
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Content List View
  const energyType = energyTypes[selectedEnergyType]
  const category = contentCategories[selectedCategory]
  const filteredContent = getFilteredContent()

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${energyType.color}dd, ${category.color}dd)`,
      ...customCursor
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        padding: '20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={goBack}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '10px 15px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                backdropFilter: 'blur(10px)'
              }}
            >
              ← Back
            </button>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'white',
                margin: 0,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                {energyType.emoji} {energyType.name} - {category.emoji} {category.name}
              </h1>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              padding: '10px 20px',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder={`🔍 Search ${category.name.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '15px 20px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '16px',
              background: 'rgba(255, 255, 255, 0.9)',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              outline: 'none'
            }}
          />
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '25px'
        }}>
          {filteredContent.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '80px 20px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>
                {category.emoji}
              </div>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '15px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                No {category.name.toLowerCase()} found
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '18px' }}>
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : `No ${category.name.toLowerCase()} available for ${energyType.name.toLowerCase()} yet`
                }
              </p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item.id} style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-5px)'
                e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)'
              }}
              >
                <div style={{
                  background: category.gradient,
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '40px', color: 'white' }}>
                    {category.emoji}
                  </div>
                </div>

                <div style={{ padding: '25px' }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '15px'
                  }}>
                    {item.title}
                  </h3>

                  <p style={{
                    color: '#666',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    marginBottom: '20px'
                  }}>
                    {item.description}
                  </p>

                  {item.file_url && (
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '15px',
                      marginBottom: '15px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '20px' }}>📎</span>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            {item.file_name || 'Download File'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = item.file_url
                            link.download = item.file_name
                            link.target = '_blank'
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          style={{
                            background: category.gradient,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 15px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#999',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '15px'
                  }}>
                    <span>
                      👨‍🏫 {item.uploaded_by?.split('@')[0] || 'Teacher'}
                    </span>
                    <span>
                      📅 {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default BeautifulStudentPanel