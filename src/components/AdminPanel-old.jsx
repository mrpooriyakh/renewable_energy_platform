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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      let fileUrl = null
      let fileName = null

      // Upload file to Supabase Storage if file is selected
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName_ = `${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('content-files')
          .upload(fileName_, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('content-files')
          .getPublicUrl(fileName_)

        fileUrl = urlData.publicUrl
        fileName = file.name
      }

      // Insert content record
      const { data, error } = await supabase
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
        .select()

      if (error) throw error

      setMessage('Content uploaded successfully!')
      setTitle('')
      setDescription('')
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''

      // Refresh uploads list
      fetchUploads()

    } catch (error) {
      setMessage(`Error: ${error.message}`)
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, fileUrl) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return

    try {
      setLoading(true)

      // Delete file from storage if exists
      if (fileUrl) {
        const fileName = fileUrl.split('/').pop()
        await supabase.storage
          .from('content-files')
          .remove([fileName])
      }

      // Delete record from database
      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)

      if (error) throw error

      setMessage('Content deleted successfully!')
      fetchUploads()
    } catch (error) {
      setMessage(`Error: ${error.message}`)
      console.error('Delete error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Teacher Admin Panel</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.email}</span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Upload New Content</h2>

            {message && (
              <div className={`p-3 rounded mb-4 ${
                message.includes('Error')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter content title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter content description"
                />
              </div>

              <div>
                <label htmlFor="file-input" className="block text-sm font-medium text-gray-700">
                  File (optional)
                </label>
                <input
                  type="file"
                  id="file-input"
                  onChange={handleFileChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4,.mp3"
                />
                {file && (
                  <p className="mt-1 text-sm text-gray-600">
                    Selected: {file.name}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload Content'}
              </button>
            </form>
          </div>

          {/* Uploaded Content List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Uploaded Content ({uploads.length})</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {uploads.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No content uploaded yet</p>
              ) : (
                uploads.map((upload) => (
                  <div key={upload.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{upload.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{upload.description}</p>
                        {upload.file_name && (
                          <p className="text-sm text-blue-600 mt-1">📎 {upload.file_name}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(upload.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(upload.id, upload.file_url)}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm"
                        disabled={loading}
                      >
                        Delete
                      </button>
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

export default AdminPanel