import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { X, Save, Upload, FileText, Video, BookOpen, Users, GraduationCap } from 'lucide-react'
import { useCourseStore } from '../store/courseStore'
import apiService from '../services/api'

const ContentManagementModal = ({ isOpen, onClose, moduleId, editContent = null }) => {
  const { addContent, updateContent, modules } = useCourseStore()
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    defaultValues: editContent || {
      title: '',
      description: '',
      content_type: 'VIDEO'
    }
  })

  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const contentType = watch('content_type')

  useEffect(() => {
    if (editContent) {
      reset(editContent)
    } else {
      reset({
        title: '',
        description: '',
        content_type: 'VIDEO'
      })
    }
  }, [editContent, reset])

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB')
        return
      }

      // Validate file type based on content type
      const allowedTypes = getAcceptedFileTypes(contentType)
      const fileExtension = file.name.split('.').pop().toLowerCase()

      if (!allowedTypes.includes(`.${fileExtension}`)) {
        toast.error(`Please select a valid file type: ${allowedTypes.join(', ')}`)
        return
      }

      setSelectedFile(file)
      toast.success(`File selected: ${file.name}`)
    }
  }

  const getAcceptedFileTypes = (type) => {
    const typeMap = {
      'VIDEO': ['.mp4', '.mov', '.avi', '.wmv'],
      'TEXTBOOK': ['.pdf', '.doc', '.docx'],
      'PROJECT': ['.pdf', '.doc', '.docx', '.txt', '.md'],
      'ASSIGNMENT': ['.pdf', '.doc', '.docx', '.txt', '.md'],
      'QUIZ': ['.pdf', '.txt', '.md']
    }
    return typeMap[type] || ['.pdf']
  }

  const getContentTypeIcon = (type) => {
    const iconMap = {
      'VIDEO': Video,
      'TEXTBOOK': BookOpen,
      'PROJECT': Users,
      'ASSIGNMENT': FileText,
      'QUIZ': GraduationCap
    }
    return iconMap[type] || FileText
  }

  const onSubmit = async (data) => {
    if (!moduleId) {
      toast.error('Module ID is required')
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    try {
      // First create the content item
      const contentData = {
        title: data.title,
        description: data.description,
        content_type: data.content_type,
        module_id: moduleId,
        instructions: data.instructions || null,
        due_date: data.due_date || null,
        points: data.points || 0
      }

      let createdContent
      if (editContent) {
        createdContent = await apiService.updateContent(editContent.id, contentData)
        toast.success('Content updated successfully!')
      } else {
        createdContent = await apiService.createContent(contentData)
        toast.success('Content created successfully!')
      }

      // If there's a file, upload it
      if (selectedFile) {
        setUploadProgress(50)

        try {
          await apiService.uploadFile(createdContent.id, selectedFile)
          setUploadProgress(100)
          toast.success('File uploaded successfully!')
        } catch (uploadError) {
          console.error('File upload error:', uploadError)
          toast.error('Content created but file upload failed: ' + uploadError.message)
        }
      }

      // Update local store
      if (editContent) {
        updateContent(moduleId, 'content', editContent.id, createdContent)
      } else {
        addContent(moduleId, 'content', createdContent)
      }

      // Reset form and close modal
      reset()
      setSelectedFile(null)
      onClose()

    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save content: ' + error.message)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const contentTypeOptions = [
    { value: 'VIDEO', label: 'Video Lesson', icon: Video },
    { value: 'TEXTBOOK', label: 'Textbook/Document', icon: BookOpen },
    { value: 'PROJECT', label: 'Project Assignment', icon: Users },
    { value: 'ASSIGNMENT', label: 'Assignment', icon: FileText },
    { value: 'QUIZ', label: 'Quiz/Assessment', icon: GraduationCap }
  ]

  if (!isOpen) return null

  console.log('ContentManagementModal opened with:', { moduleId, editContent })

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
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div>
              <h2 className="text-2xl font-bold text-red-600">
                ⚡ NEW MODAL WORKING ⚡ {editContent ? 'Edit Content' : 'Add New Content'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                🔥 This is the NEW modal with backend integration! 🔥
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

              {/* Content Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Content Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {contentTypeOptions.map((option) => {
                    const IconComponent = option.icon
                    return (
                      <label
                        key={option.value}
                        className={`
                          relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${contentType === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        <input
                          {...register('content_type', { required: true })}
                          type="radio"
                          value={option.value}
                          className="sr-only"
                        />
                        <IconComponent className={`w-5 h-5 mr-3 ${
                          contentType === option.value ? 'text-blue-600' : 'text-gray-500'
                        }`} />
                        <span className={`text-sm font-medium ${
                          contentType === option.value
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {option.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  placeholder="Enter a descriptive title..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  placeholder="Provide a detailed description of the content..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Conditional Fields */}
              {(contentType === 'ASSIGNMENT' || contentType === 'PROJECT') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instructions
                  </label>
                  <textarea
                    {...register('instructions')}
                    rows={4}
                    placeholder="Provide detailed instructions for this assignment..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                  />
                </div>
              )}

              {contentType === 'ASSIGNMENT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      {...register('due_date')}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Points
                    </label>
                    <input
                      {...register('points', { valueAsNumber: true })}
                      type="number"
                      placeholder="100"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* File Upload Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Upload File (Optional)
                </label>

                <div className={`
                  relative border-2 border-dashed rounded-xl p-6 text-center transition-all
                  ${selectedFile
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                  }
                `}>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={getAcceptedFileTypes(contentType).join(',')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  <div className="flex flex-col items-center space-y-2">
                    <Upload className={`w-8 h-8 ${
                      selectedFile ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {selectedFile ? selectedFile.name : 'Click to select a file'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Accepted: {getAcceptedFileTypes(contentType).join(', ')} (Max 50MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Uploading...
                      </span>
                      <span className="text-sm text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
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
                      <span>{editContent ? 'Update Content' : 'Create Content'}</span>
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