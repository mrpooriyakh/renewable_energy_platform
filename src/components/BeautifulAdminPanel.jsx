import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function BeautifulAdminPanel({ user, onLogout }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [energyType, setEnergyType] = useState('solar')
  const [contentCategory, setContentCategory] = useState('textbooks')
  const [file, setFile] = useState(null)
  const [externalUrl, setExternalUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploads, setUploads] = useState([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUploads(data || [])
    } catch (error) {
      console.error('Error fetching uploads:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let fileUrl = null
      let fileName = null

      if (file) {
        try {
          const fileExt = file.name.split('.').pop()
          const fileName_ = `${Date.now()}.${fileExt}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('content-files')
            .upload(fileName_, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.log('File upload failed, continuing with content only...')
          } else {
            const { data: urlData } = supabase.storage
              .from('content-files')
              .getPublicUrl(fileName_)

            fileUrl = urlData.publicUrl
            fileName = file.name
          }
        } catch (fileError) {
          console.error('File processing error:', fileError)
        }
      }

      const { error } = await supabase
        .from('content')
        .insert([
          {
            title,
            description,
            energy_type: energyType,
            content_category: contentCategory,
            file_url: fileUrl,
            file_name: fileName,
            external_url: externalUrl || null,
            uploaded_by: user.email
          }
        ])

      if (error) throw error

      setMessage('Content uploaded successfully! 🎉')
      setMessageType('success')

      // Reset form
      setTitle('')
      setDescription('')
      setEnergyType('solar')
      setContentCategory('textbooks')
      setFile(null)
      setExternalUrl('')
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = ''
      }
      fetchUploads()

    } catch (error) {
      setMessage(`Error: ${error.message}`)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const energyTypes = {
    solar: {
      name: 'Solar Energy',
      emoji: '☀️',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)'
    },
    hydro: {
      name: 'Hydro Energy',
      emoji: '💧',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)'
    },
    geothermal: {
      name: 'Geothermal Energy',
      emoji: '🔥',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #f87171, #ef4444)'
    },
    wind: {
      name: 'Wind Energy',
      emoji: '💨',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #34d399, #10b981)'
    }
  }

  const contentCategories = {
    videos: {
      name: 'Videos',
      emoji: '🎥',
      color: '#8b5cf6'
    },
    software: {
      name: 'Software',
      emoji: '💻',
      color: '#06b6d4'
    },
    textbooks: {
      name: 'Textbooks',
      emoji: '📚',
      color: '#f97316'
    }
  }

  const customCursor = {
    cursor: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%236366f1' d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E") 12 12, auto`
  }

  const getUploadsByType = (type) => {
    return uploads.filter(item => (item.energy_type || 'solar') === type)
  }

  const getUploadsByCategory = (category) => {
    return uploads.filter(item => (item.content_category || 'textbooks') === category)
  }

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
          maxWidth: '1600px',
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
              👨‍🏫 Teacher Admin Panel
            </h1>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '5px 0 0 0',
              fontSize: '16px'
            }}>
              Upload and manage renewable energy learning content
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

      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          marginBottom: '50px'
        }}>
          {/* Upload Form */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>📤</div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#333',
                margin: 0
              }}>
                Upload New Content
              </h2>
            </div>

            {message && (
              <div style={{
                background: messageType === 'error' ? '#fee2e2' : '#d1fae5',
                border: `2px solid ${messageType === 'error' ? '#fca5a5' : '#86efac'}`,
                borderRadius: '15px',
                padding: '15px',
                marginBottom: '25px',
                textAlign: 'center'
              }}>
                <div style={{
                  color: messageType === 'error' ? '#dc2626' : '#059669',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {message}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  📝 Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title"
                  required
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '25px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    ⚡ Energy Type *
                  </label>
                  <select
                    value={energyType}
                    onChange={(e) => setEnergyType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      background: 'white'
                    }}
                  >
                    {Object.entries(energyTypes).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.emoji} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    📋 Content Type *
                  </label>
                  <select
                    value={contentCategory}
                    onChange={(e) => setContentCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      background: 'white'
                    }}
                  >
                    {Object.entries(contentCategories).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.emoji} {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  📄 Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter detailed description"
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    fontSize: '16px',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {contentCategory === 'videos' && (
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    🔗 Video URL (YouTube, Vimeo, etc.)
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              )}

              {contentCategory === 'software' && (
                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: '600',
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    🔗 Software Download Link
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/software-download"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              )}

              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#333',
                  fontSize: '16px'
                }}>
                  📎 Upload File (optional)
                </label>
                <div style={{
                  border: '3px dashed #d1d5db',
                  borderRadius: '15px',
                  padding: '30px',
                  textAlign: 'center',
                  background: '#f9fafb',
                  transition: 'all 0.3s ease'
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.target.style.borderColor = '#6366f1'
                  e.target.style.background = '#f0f9ff'
                }}
                onDragLeave={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.background = '#f9fafb'
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const droppedFile = e.dataTransfer.files[0]
                  if (droppedFile) {
                    setFile(droppedFile)
                  }
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.background = '#f9fafb'
                }}
                >
                  <input
                    type="file"
                    id="file-input"
                    onChange={(e) => setFile(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
                  <div style={{ fontSize: '16px', color: '#666', marginBottom: '15px' }}>
                    Drag and drop your file here, or
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-input').click()}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Choose File
                  </button>
                  {file && (
                    <div style={{
                      marginTop: '15px',
                      fontSize: '14px',
                      color: '#059669',
                      fontWeight: 'bold'
                    }}>
                      📎 {file.name}
                    </div>
                  )}
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
                  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-2px)'
                    e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0px)'
                    e.target.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                {loading ? '⏳ Uploading...' : '🚀 Upload Content'}
              </button>
            </form>
          </div>

          {/* Statistics Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>📊</div>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#333',
                margin: 0
              }}>
                Content Overview
              </h2>
            </div>

            {/* Energy Type Stats */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px'
              }}>
                📈 By Energy Type
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px'
              }}>
                {Object.entries(energyTypes).map(([key, type]) => {
                  const count = getUploadsByType(key).length
                  return (
                    <div
                      key={key}
                      style={{
                        background: type.gradient,
                        borderRadius: '15px',
                        padding: '20px',
                        textAlign: 'center',
                        color: 'white',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div style={{ fontSize: '36px', marginBottom: '10px' }}>
                        {type.emoji}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
                        {count}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.9 }}>
                        {type.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category Stats */}
            <div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px'
              }}>
                📋 By Content Type
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '15px'
              }}>
                {Object.entries(contentCategories).map(([key, category]) => {
                  const count = getUploadsByCategory(key).length
                  return (
                    <div
                      key={key}
                      style={{
                        background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)`,
                        borderRadius: '15px',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        color: 'white',
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <div style={{ fontSize: '36px' }}>
                        {category.emoji}
                      </div>
                      <div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                          {count}
                        </div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>
                          {category.name}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{
              marginTop: '30px',
              textAlign: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '15px',
              color: 'white'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                {uploads.length}
              </div>
              <div style={{ fontSize: '16px' }}>
                Total Content Items
              </div>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '64px', marginBottom: '15px' }}>📚</div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#333',
              margin: 0
            }}>
              Recent Uploads ({uploads.length})
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            {uploads.length === 0 ? (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '60px',
                color: '#666'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📝</div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No content uploaded yet</h3>
                <p style={{ fontSize: '16px' }}>Start by uploading your first piece of content!</p>
              </div>
            ) : (
              uploads.slice(0, 12).map((upload) => {
                const energyType = energyTypes[upload.energy_type || 'solar']
                const category = contentCategories[upload.content_category || 'textbooks']

                return (
                  <div key={upload.id} style={{
                    background: 'white',
                    border: '2px solid #f1f5f9',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-5px)'
                    e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)'
                    e.target.style.borderColor = energyType.color
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0px)'
                    e.target.style.boxShadow = 'none'
                    e.target.style.borderColor = '#f1f5f9'
                  }}
                  >
                    <div style={{
                      background: energyType.gradient,
                      padding: '15px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '24px', color: 'white', marginBottom: '5px' }}>
                        {energyType.emoji} {category.emoji}
                      </div>
                      <div style={{ fontSize: '12px', color: 'white', opacity: 0.9 }}>
                        {energyType.name} - {category.name}
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#333',
                        marginBottom: '10px',
                        lineHeight: '1.3'
                      }}>
                        {upload.title}
                      </h3>

                      <p style={{
                        color: '#666',
                        fontSize: '13px',
                        lineHeight: '1.4',
                        marginBottom: '15px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {upload.description}
                      </p>

                      {upload.file_name && (
                        <div style={{
                          background: '#f8fafc',
                          borderRadius: '8px',
                          padding: '8px',
                          marginBottom: '10px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          📎 {upload.file_name}
                        </div>
                      )}

                      {upload.external_url && (
                        <div style={{
                          background: '#eff6ff',
                          borderRadius: '8px',
                          padding: '8px',
                          marginBottom: '10px',
                          fontSize: '12px',
                          color: '#2563eb'
                        }}>
                          🔗 External Link
                        </div>
                      )}

                      <div style={{
                        fontSize: '11px',
                        color: '#999',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '10px'
                      }}>
                        📅 {new Date(upload.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BeautifulAdminPanel