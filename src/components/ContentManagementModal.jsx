import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { X, Save, Plus } from 'lucide-react'
import FileUpload from './FileUpload'
import { useCourseStore } from '../store/courseStore'

const ContentManagementModal = ({ isOpen, onClose, moduleId, contentType, editContent = null }) => {
  const { addContent, updateContent } = useCourseStore()
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: editContent || {}
  })
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = (file) => {
    setUploadedFiles(prev => [...prev, file])
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Prepare content data based on type
      let contentData = { ...data }
      
      // Add file URLs if files were uploaded
      if (uploadedFiles.length > 0) {
        contentData.fileUrl = uploadedFiles[0].url
        contentData.fileName = uploadedFiles[0].name
      }
      
      // Add specific fields based on content type
      switch (contentType) {
        case 'videos':
          contentData.duration = data.duration || 'N/A'
          contentData.url = uploadedFiles.find(f => f.type.startsWith('video/'))?.url || data.url
          break
          
        case 'assignments':
          contentData.dueDate = data.dueDate
          contentData.instructions = data.instructions
          break
          
        case 'projects':
          contentData.instructions = data.instructions
          break
          
        case 'textbooks':
          contentData.fileUrl = uploadedFiles.find(f => f.type === 'application/pdf')?.url || data.fileUrl
          break
          
        case 'quizzes':
          contentData.questions = data.questions ? JSON.parse(data.questions) : []
          contentData.status = '⏳'
          break
      }

      if (editContent) {
        updateContent(moduleId, contentType, editContent.id, contentData)
        toast.success('Content updated successfully!')
      } else {
        addContent(moduleId, contentType, contentData)
        toast.success('Content added successfully!')
      }
      
      // Reset form and close modal
      reset()
      setUploadedFiles([])
      onClose()
      
    } catch (error) {
      toast.error('Failed to save content')
      console.error('Save error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getContentTypeConfig = () => {
    const configs = {
      videos: {
        title: 'Video Content',
        fields: [
          { name: 'title', label: 'Video Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'duration', label: 'Duration (e.g., 15 min)', type: 'text' }
        ],
        acceptedTypes: { 'video/*': ['.mp4', '.mov', '.avi', '.wmv'] }
      },
      textbooks: {
        title: 'Textbook/Document',
        fields: [
          { name: 'title', label: 'Document Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true }
        ],
        acceptedTypes: { 'application/pdf': ['.pdf'] }
      },
      projects: {
        title: 'Project Assignment',
        fields: [
          { name: 'title', label: 'Project Title', type: 'text', required: true },
          { name: 'description', label: 'Short Description', type: 'textarea', required: true },
          { name: 'instructions', label: 'Detailed Instructions', type: 'textarea', required: true }
        ],
        acceptedTypes: { 
          'application/pdf': ['.pdf'],
          'text/*': ['.txt', '.md'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
      },
      assignments: {
        title: 'Assignment',
        fields: [
          { name: 'title', label: 'Assignment Title', type: 'text', required: true },
          { name: 'description', label: 'Short Description', type: 'textarea', required: true },
          { name: 'instructions', label: 'Assignment Instructions', type: 'textarea', required: true },
          { name: 'dueDate', label: 'Due Date', type: 'date', required: true }
        ],
        acceptedTypes: { 
          'application/pdf': ['.pdf'],
          'text/*': ['.txt', '.md'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
      },
      quizzes: {
        title: 'Quiz/Assessment',
        fields: [
          { name: 'title', label: 'Quiz Title', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea', required: true },
          { name: 'questions', label: 'Questions (JSON format)', type: 'textarea', placeholder: '[{"question": "What is...?", "options": ["A", "B", "C"], "correct": 0}]' }
        ],
        acceptedTypes: { 
          'application/pdf': ['.pdf'],
          'text/*': ['.txt', '.md']
        }
      }
    }
    return configs[contentType] || configs.videos
  }

  const config = getContentTypeConfig()

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
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {editContent ? 'Edit' : 'Add'} {config.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {editContent ? 'Update existing content' : 'Upload new learning material'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.fields.map((field) => (
                  <div key={field.name} className={field.type === 'textarea' && field.name === 'instructions' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        {...register(field.name, { required: field.required })}
                        rows={field.name === 'instructions' ? 6 : 3}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                      />
                    ) : (
                      <input
                        {...register(field.name, { required: field.required })}
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                      />
                    )}
                    
                    {errors[field.name] && (
                      <p className="text-red-500 text-sm mt-1">This field is required</p>
                    )}
                  </div>
                ))}
              </div>

              {/* File Upload Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Upload Files
                </h3>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  acceptedTypes={config.acceptedTypes}
                  multiple={false}
                  className="mb-4"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                    text-white font-semibold rounded-xl transition-all flex items-center space-x-2
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg hover:scale-105'}
                  `}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{editContent ? 'Update' : 'Create'}</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ContentManagementModal