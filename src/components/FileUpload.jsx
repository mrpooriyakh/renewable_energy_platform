import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Upload, File, X, Check } from 'lucide-react'

const FileUpload = ({ 
  onFileUpload, 
  acceptedTypes = {
    'video/*': ['.mp4', '.mov', '.avi'],
    'application/pdf': ['.pdf'],
    'image/*': ['.png', '.jpg', '.jpeg'],
    'text/*': ['.txt', '.md'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
  },
  maxSize = 50 * 1024 * 1024, // 50MB
  multiple = false,
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.name} is too large. Max size is ${maxSize / (1024 * 1024)}MB`)
          } else if (error.code === 'file-invalid-type') {
            toast.error(`File ${file.name} has invalid type`)
          }
        })
      })
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      setIsUploading(true)
      
      for (const file of acceptedFiles) {
        try {
          // Simulate file upload process
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Create file URL for preview (in real app, this would be uploaded to server)
          const fileUrl = URL.createObjectURL(file)
          
          const uploadedFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: fileUrl,
            file: file,
            uploadedAt: new Date().toISOString()
          }
          
          setUploadedFiles(prev => [...prev, uploadedFile])
          
          // Call parent callback
          if (onFileUpload) {
            onFileUpload(uploadedFile)
          }
          
          toast.success(`${file.name} uploaded successfully!`)
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`)
          console.error('Upload error:', error)
        }
      }
      
      setIsUploading(false)
    }
  }, [maxSize, onFileUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize,
    multiple
  })

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId)
      return newFiles
    })
    toast.success('File removed')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.startsWith('text/')) return '📝'
    if (type.includes('presentation')) return '📊'
    return '📁'
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input {...getInputProps()} />
        
        <motion.div
          className="flex flex-col items-center space-y-4"
          animate={isDragActive ? { scale: 1.05 } : { scale: 1 }}
        >
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragActive ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}
            transition-colors duration-300
          `}>
            {isUploading ? (
              <motion.div
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Upload className={`w-8 h-8 ${isDragActive ? 'text-blue-600' : 'text-gray-500'}`} />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isUploading 
                ? 'Uploading...' 
                : isDragActive 
                  ? 'Drop files here' 
                  : 'Drag & drop files here'
              }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Max file size: {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        </motion.div>

        {/* Upload Progress Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 rounded-xl flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <motion.div
                  className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Processing files...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Uploaded Files List */}
      <AnimatePresence mode="popLayout">
        {uploadedFiles.length > 0 && (
          <motion.div
            className="mt-6 space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Uploaded Files ({uploadedFiles.length})
            </h4>
            
            {uploadedFiles.map((file) => (
              <motion.div
                key={file.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <span className="text-2xl mr-3">
                  {getFileIcon(file.type)}
                </span>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-2">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="w-6 h-6 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FileUpload