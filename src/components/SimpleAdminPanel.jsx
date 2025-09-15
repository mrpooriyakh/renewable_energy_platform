import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function SimpleAdminPanel({ user, onLogout }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [energyType, setEnergyType] = useState('general')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploads, setUploads] = useState([])
  const [message, setMessage] = useState('')

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
            fileUrl = null
            fileName = null
          } else {
            const { data: urlData } = supabase.storage
              .from('content-files')
              .getPublicUrl(fileName_)

            fileUrl = urlData.publicUrl
            fileName = file.name
          }
        } catch (fileError) {
          console.error('File processing error:', fileError)
          fileUrl = null
          fileName = null
        }
      }

      const { error } = await supabase
        .from('content')
        .insert([
          {
            title,
            description,
            energy_type: energyType,
            file_url: fileUrl,
            file_name: fileName,
            uploaded_by: user.email
          }
        ])

      if (error) throw error

      setMessage('Content uploaded successfully!')
      setTitle('')
      setDescription('')
      setEnergyType('general')
      setFile(null)
      document.getElementById('file-input').value = ''
      fetchUploads()

    } catch (error) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <header style={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            🌱 Teacher Admin Panel
          </h1>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Upload Form */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
              📝 Upload New Content
            </h2>

            {message && (
              <div style={{
                background: message.includes('Error') ? '#fee' : '#efe',
                border: `1px solid ${message.includes('Error') ? '#fcc' : '#cfc'}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                color: message.includes('Error') ? '#c33' : '#363'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter content title"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Energy Type *
                </label>
                <select
                  value={energyType}
                  onChange={(e) => setEnergyType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="general">General - General renewable energy content</option>
                  <option value="solar">Solar Energy - Harness the power of the sun</option>
                  <option value="hydro">Hydro Energy - Energy from flowing water</option>
                  <option value="geothermal">Geothermal Energy - Heat from Earth's core</option>
                  <option value="wind">Wind Energy - Power from moving air</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter content description"
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  File (optional)
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Uploading...' : '📤 Upload Content'}
              </button>
            </form>
          </div>

          {/* Recent Uploads */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#333' }}>
              📚 Recent Uploads ({uploads.length})
            </h2>

            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {uploads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📝</div>
                  <p>No content uploaded yet</p>
                </div>
              ) : (
                uploads.slice(0, 10).map((upload) => (
                  <div key={upload.id} style={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '15px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#333', margin: 0 }}>
                        {upload.title}
                      </h3>
                      <span style={{
                        background: upload.energy_type === 'solar' ? '#fed7aa' :
                                   upload.energy_type === 'hydro' ? '#bfdbfe' :
                                   upload.energy_type === 'geothermal' ? '#fecaca' :
                                   upload.energy_type === 'wind' ? '#bbf7d0' : '#f3f4f6',
                        color: upload.energy_type === 'solar' ? '#ea580c' :
                               upload.energy_type === 'hydro' ? '#2563eb' :
                               upload.energy_type === 'geothermal' ? '#dc2626' :
                               upload.energy_type === 'wind' ? '#059669' : '#374151',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {upload.energy_type === 'solar' ? '☀️ Solar' :
                         upload.energy_type === 'hydro' ? '💧 Hydro' :
                         upload.energy_type === 'geothermal' ? '🔥 Geothermal' :
                         upload.energy_type === 'wind' ? '💨 Wind' : '📖 General'}
                      </span>
                    </div>
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                      {upload.description}
                    </p>
                    {upload.file_name && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        📎 {upload.file_name}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
                      {new Date(upload.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleAdminPanel