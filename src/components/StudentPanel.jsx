import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function StudentPanel({ user, onLogout }) {
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

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '20px' }}>Loading content...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Student Learning Portal</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#374151' }}>Welcome, {user.email}</span>
              <button
                onClick={onLogout}
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              maxWidth: '400px',
              width: '100%',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        {/* Stats */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Available Content</h2>
            <p style={{ color: '#6b7280' }}>
              {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'} available
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {filteredContent.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px 0'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {searchTerm ? 'No content found' : 'No content available yet'}
              </h3>
              <p style={{ color: '#6b7280' }}>
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
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'}
              onMouseLeave={(e) => e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'}
              >
                <div style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1f2937',
                      flex: 1,
                      marginRight: '8px'
                    }}>
                      {item.title}
                    </h3>
                    {item.file_url && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af'
                      }}>
                        📎 File
                      </span>
                    )}
                  </div>

                  <p style={{
                    color: '#6b7280',
                    fontSize: '14px',
                    marginBottom: '16px',
                    lineHeight: '1.5'
                  }}>
                    {item.description}
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    {item.file_url && (
                      <div style={{
                        backgroundColor: '#f9fafb',
                        padding: '12px',
                        borderRadius: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>📎</span>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                              {item.file_name || 'Download File'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(item.file_url, item.file_name)}
                            style={{
                              color: '#6366f1',
                              fontSize: '14px',
                              fontWeight: '500',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer'
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
                      fontSize: '14px',
                      color: '#6b7280',
                      marginTop: '12px'
                    }}>
                      <span>
                        By: {item.uploaded_by?.split('@')[0] || 'Teacher'}
                      </span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Real-time indicator */}
        <div style={{ marginTop: '32px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: '#dcfce7',
            color: '#166534'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              marginRight: '8px',
              animation: 'pulse 2s infinite'
            }}></span>
            Live updates enabled
          </span>
        </div>
      </div>
    </div>
  )
}

export default StudentPanel