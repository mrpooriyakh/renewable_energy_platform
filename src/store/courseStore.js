import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Initial course data structure
const initialModules = {
  'solar-pv': {
    id: 'solar-pv',
    title: 'Solar PV',
    description: 'Photovoltaic Systems & Technology',
    icon: '☀️',
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    videos: [
      { 
        id: '1', 
        title: 'Introduction to Solar PV', 
        duration: '15 min', 
        description: 'Basic concepts and principles',
        url: null,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System'
      }
    ],
    textbooks: [
      { 
        id: '1', 
        title: 'Solar Energy Engineering', 
        description: 'Comprehensive guide to PV systems',
        fileUrl: null,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System'
      }
    ],
    projects: [
      { 
        id: '1', 
        title: 'Basic Solar Cell Testing', 
        description: 'Measure I-V characteristics',
        instructions: 'Follow the lab manual to test solar cell characteristics',
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System'
      }
    ],
    assignments: [
      { 
        id: '1', 
        title: 'Assignment 1: Solar Irradiance', 
        description: 'Due: March 15 - Calculate daily irradiance',
        dueDate: '2024-03-15',
        instructions: 'Calculate the daily solar irradiance for your location',
        fileUrl: null,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System'
      }
    ],
    quizzes: [
      { 
        id: '1', 
        title: 'Quiz 1: Fundamentals', 
        description: 'Score: 85% - Retake available', 
        status: '✅',
        questions: [],
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'System'
      }
    ]
  },
  'wind-power': {
    id: 'wind-power',
    title: 'Wind Power',
    description: 'Wind Turbines & Energy Generation',
    icon: '💨',
    color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    videos: [],
    textbooks: [],
    projects: [],
    assignments: [],
    quizzes: []
  },
  'hydropower': {
    id: 'hydropower',
    title: 'Hydropower',
    description: 'Water-based Energy Systems',
    icon: '💧',
    color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    videos: [],
    textbooks: [],
    projects: [],
    assignments: [],
    quizzes: []
  },
  'geothermal': {
    id: 'geothermal',
    title: 'Geothermal',
    description: 'Earth\'s Heat Energy Systems',
    icon: '🌋',
    color: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    videos: [],
    textbooks: [],
    projects: [],
    assignments: [],
    quizzes: []
  },
  'solar-thermal': {
    id: 'solar-thermal',
    title: 'Solar Thermal',
    description: 'Heat Collection & Storage Systems',
    icon: '🔥',
    color: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    videos: [],
    textbooks: [],
    projects: [],
    assignments: [],
    quizzes: []
  }
}

const initialStats = {
  totalStudents: 142,
  activeStudents: 128,
  averageProgress: 67,
  completionRate: 84,
  totalModules: 5,
  totalAssignments: 15,
  submittedAssignments: 89,
  averageScore: 78
}

// Create the store
export const useCourseStore = create()(
  persist(
    (set, get) => ({
      // State
      modules: initialModules,
      stats: initialStats,
      notifications: [],
      
      // Actions
      addContent: (moduleId, contentType, content) => {
        const modules = get().modules
        const module = modules[moduleId]
        
        if (!module) return
        
        const newContent = {
          id: Date.now().toString(),
          ...content,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Teacher'
        }
        
        const updatedModule = {
          ...module,
          [contentType]: [...module[contentType], newContent]
        }
        
        set({
          modules: {
            ...modules,
            [moduleId]: updatedModule
          }
        })
        
        // Add notification
        get().addNotification({
          type: 'success',
          message: `New ${contentType.slice(0, -1)} added to ${module.title}`,
          timestamp: new Date().toISOString()
        })
      },
      
      updateContent: (moduleId, contentType, contentId, updatedContent) => {
        const modules = get().modules
        const module = modules[moduleId]
        
        if (!module) return
        
        const updatedItems = module[contentType].map(item =>
          item.id === contentId ? { ...item, ...updatedContent } : item
        )
        
        const updatedModule = {
          ...module,
          [contentType]: updatedItems
        }
        
        set({
          modules: {
            ...modules,
            [moduleId]: updatedModule
          }
        })
        
        get().addNotification({
          type: 'info',
          message: `${contentType.slice(0, -1)} updated in ${module.title}`,
          timestamp: new Date().toISOString()
        })
      },
      
      deleteContent: (moduleId, contentType, contentId) => {
        const modules = get().modules
        const module = modules[moduleId]
        
        if (!module) return
        
        const filteredItems = module[contentType].filter(item => item.id !== contentId)
        
        const updatedModule = {
          ...module,
          [contentType]: filteredItems
        }
        
        set({
          modules: {
            ...modules,
            [moduleId]: updatedModule
          }
        })
        
        get().addNotification({
          type: 'warning',
          message: `${contentType.slice(0, -1)} deleted from ${module.title}`,
          timestamp: new Date().toISOString()
        })
      },
      
      updateStats: (newStats) => {
        set({
          stats: { ...get().stats, ...newStats }
        })
      },
      
      addNotification: (notification) => {
        const notifications = get().notifications
        set({
          notifications: [
            {
              id: Date.now().toString(),
              ...notification
            },
            ...notifications.slice(0, 9) // Keep only latest 10 notifications
          ]
        })
      },
      
      removeNotification: (notificationId) => {
        const notifications = get().notifications
        set({
          notifications: notifications.filter(n => n.id !== notificationId)
        })
      },
      
      // Get module content for students
      getModuleContent: (moduleId, contentType) => {
        const modules = get().modules
        return modules[moduleId]?.[contentType] || []
      },
      
      // Get all modules for students
      getAllModules: () => {
        return Object.values(get().modules)
      },
      
      // Reset store (for development)
      reset: () => {
        set({
          modules: initialModules,
          stats: initialStats,
          notifications: []
        })
      }
    }),
    {
      name: 'course-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)