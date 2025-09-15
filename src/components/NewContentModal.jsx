import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Upload, Video, BookOpen, FileText, Users, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import apiService from '../services/api'

const NewContentModal = ({ isOpen, onClose, moduleId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'VIDEO'
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!moduleId) {
      toast.error('Module ID is required')
      return
    }

    setIsLoading(true)
    try {
      // Create content
      const response = await apiService.createContent({
        ...formData,
        module_id: moduleId
      })

      // Upload file if selected
      if (selectedFile) {
        await apiService.uploadFile(response.id, selectedFile)
      }

      toast.success('Content created successfully!')
      setFormData({ title: '', description: '', content_type: 'VIDEO' })
      setSelectedFile(null)
      onClose()
    } catch (error) {
      toast.error('Failed to create content: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const contentTypes = [
    { value: 'VIDEO', label: 'Video', icon: Video },
    { value: 'TEXTBOOK', label: 'Document', icon: BookOpen },
    { value: 'PROJECT', label: 'Project', icon: Users },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: FileText },
    { value: 'QUIZ', label: 'Quiz', icon: GraduationCap }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-red-600">
              ⚡ NEW WORKING MODAL ⚡
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Content Type</label>
              <select
                value={formData.content_type}
                onChange={(e) => setFormData(prev => ({ ...prev, content_type: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {contentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter content title..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">File (Optional)</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full p-3 border border-gray-300 rounded-lg"
                accept=".pdf,.mp4,.mov,.avi,.doc,.docx,.ppt,.pptx"
              />
              {selectedFile && (
                <p className="text-sm text-green-600 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Content</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default NewContentModal