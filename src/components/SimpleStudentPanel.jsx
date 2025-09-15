import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function SimpleStudentPanel({ user, onLogout }) {
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')

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

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFilteredContent = () => {
    return content.filter(item => {
      const energyType = item.energy_type || 'general'
      const matchesTab = selectedTab === 'all' || energyType === selectedTab
      const matchesSearch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesTab && matchesSearch
    })
  }

  const getContentCount = (type) => {
    if (type === 'all') return content.length
    return content.filter(item => (item.energy_type || 'general') === type).length
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔄</div>
          <div style={{ fontSize: '20px', color: '#666' }}>Loading renewable energy content...</div>
        </div>
      </div>
    )
  }

  const filteredContent = getFilteredContent()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>
              🌱 Renewable Energy Learning Hub
            </h1>
            <p style={{ color: '#666', margin: '5px 0 0 0' }}>Explore sustainable energy solutions</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#666' }}>Welcome, {user.email}</span>
            <button
              onClick={onLogout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="text"
            placeholder="🔍 Search renewable energy content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              maxWidth: '400px',
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Energy Type Tabs */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { key: 'all', name: 'All Content', emoji: '📚' },
              { key: 'solar', name: 'Solar Energy', emoji: '☀️' },
              { key: 'hydro', name: 'Hydro Energy', emoji: '💧' },
              { key: 'geothermal', name: 'Geothermal Energy', emoji: '🔥' },
              { key: 'wind', name: 'Wind Energy', emoji: '💨' },
              { key: 'general', name: 'General', emoji: '📖' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key)}
                style={{
                  padding: '10px 20px',
                  border: selectedTab === tab.key ? '2px solid #667eea' : '1px solid #ddd',
                  borderRadius: '20px',
                  background: selectedTab === tab.key ? '#f0f4ff' : 'white',
                  color: selectedTab === tab.key ? '#667eea' : '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedTab === tab.key ? 'bold' : 'normal'
                }}
              >
                {tab.emoji} {tab.name} ({getContentCount(tab.key)})
              </button>
            ))}
          </div>
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
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                {selectedTab === 'solar' ? '☀️' :
                 selectedTab === 'hydro' ? '💧' :
                 selectedTab === 'geothermal' ? '🔥' :
                 selectedTab === 'wind' ? '💨' : '📚'}
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '10px'
              }}>
                {searchTerm ? 'No content found' :
                 selectedTab === 'all' ? 'No content available yet' :
                 `No ${selectedTab} content yet`}
              </h3>
              <p style={{ color: '#666', fontSize: '16px' }}>
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Your teacher will upload learning materials soon!'
                }
              </p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px)'
                e.target.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0px)'
                e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              >
                {/* Energy Type Header */}
                <div style={{
                  background: item.energy_type === 'solar' ? 'linear-gradient(135deg, #f59e0b, #f97316)' :
                             item.energy_type === 'hydro' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                             item.energy_type === 'geothermal' ? 'linear-gradient(135deg, #dc2626, #f97316)' :
                             item.energy_type === 'wind' ? 'linear-gradient(135deg, #059669, #10b981)' :
                             'linear-gradient(135deg, #6b7280, #9ca3af)',
                  color: 'white',
                  padding: '15px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                    {item.energy_type === 'solar' ? '☀️' :
                     item.energy_type === 'hydro' ? '💧' :
                     item.energy_type === 'geothermal' ? '🔥' :
                     item.energy_type === 'wind' ? '💨' : '📖'}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' }}>
                    {item.energy_type === 'solar' ? 'Solar Energy' :
                     item.energy_type === 'hydro' ? 'Hydro Energy' :
                     item.energy_type === 'geothermal' ? 'Geothermal Energy' :
                     item.energy_type === 'wind' ? 'Wind Energy' : 'General'}
                  </div>
                </div>

                <div style={{ padding: '25px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '12px'
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
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>📎</span>
                          <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>
                            {item.file_name || 'Download File'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(item.file_url, item.file_name)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500'
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
                      👨‍🏫 By: {item.uploaded_by?.split('@')[0] || 'Teacher'}
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

        {/* Real-time indicator */}
        <div style={{ marginTop: '40px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#dcfce7',
            color: '#166534',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></span>
            🔄 Live updates enabled
          </span>
        </div>
      </div>
    </div>
  )
}

export default SimpleStudentPanel