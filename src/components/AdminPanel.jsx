import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function AdminPanel({ user, onLogout }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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

          console.log('Attempting to upload file:', fileName_)

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('content-files')
            .upload(fileName_, file, {
              cacheControl: '3600',
              upsert: false
            })

          if (uploadError) {
            console.error('Upload error:', uploadError)
            // Continue without file if upload fails
            console.log('File upload failed, continuing with content only...')
            fileUrl = null
            fileName = null
          } else {
            console.log('Upload successful:', uploadData)

            const { data: urlData } = supabase.storage
              .from('content-files')
              .getPublicUrl(fileName_)

            fileUrl = urlData.publicUrl
            fileName = file.name
            console.log('File URL generated:', fileUrl)
          }
        } catch (fileError) {
          console.error('File processing error:', fileError)
          // Continue without file if there's any error
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
            file_url: fileUrl,
            file_name: fileName,
            uploaded_by: user.email
          }
        ])

      if (error) throw error

      if (fileUrl) {
        setMessage('Content uploaded successfully with file!')
      } else if (file) {
        setMessage('Content uploaded successfully (file upload failed - check console)')
      } else {
        setMessage('Content uploaded successfully!')
      }

      setTitle('')
      setDescription('')
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>Teacher Admin Panel</h1>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Upload Form */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Upload New Content</h2>

            {message && (
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '16px',
                backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7',
                color: message.includes('Error') ? '#991b1b' : '#166534'
              }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  placeholder="Enter content title"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                  placeholder="Enter content description"
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  File (optional)
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                {file && (
                  <p style={{ marginTop: '4px', fontSize: '14px', color: '#6b7280' }}>
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: loading ? '#9ca3af' : '#6366f1',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                {loading ? 'Uploading...' : 'Upload Content'}
              </button>
            </form>
          </div>

          {/* Uploaded Content List */}
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Uploaded Content ({uploads.length})</h2>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {uploads.length === 0 ? (
                <p style={{ color: '#6b7280', textAlign: 'center', padding: '32px 0' }}>No content uploaded yet</p>
              ) : (
                uploads.map((upload) => (
                  <div key={upload.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '4px' }}>{upload.title}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>{upload.description}</p>
                    {upload.file_name && (
                      <p style={{ fontSize: '14px', color: '#2563eb', marginBottom: '8px' }}>📎 {upload.file_name}</p>
                    )}
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(upload.created_at).toLocaleString()}
                    </p>
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

export default AdminPanel