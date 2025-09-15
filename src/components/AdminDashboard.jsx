import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { Plus, Edit, Trash2, Eye, Users, BookOpen, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import AIChatbot from './AIChatbot'
import NewContentModal from './NewContentModal'
import { useCourseStore } from '../store/courseStore'
import './AdminDashboard.css'

const AdminDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedContentType, setSelectedContentType] = useState('videos')
  const [editingContent, setEditingContent] = useState(null)
  
  const navigate = useNavigate()
  const welcomeRef = useRef(null)
  const sectionsRef = useRef({})
  const networkRef = useRef(null)
  
  // Zustand store hooks
  const { modules, stats, deleteContent, getAllModules } = useCourseStore()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  // Modal handlers
  const openContentModal = (moduleId, contentType, editContent = null) => {
    setSelectedModule(moduleId)
    setSelectedContentType(contentType)
    setEditingContent(editContent)
    setIsModalOpen(true)
  }

  const closeContentModal = () => {
    setIsModalOpen(false)
    setSelectedModule(null)
    setSelectedContentType('videos')
    setEditingContent(null)
  }

  const handleDeleteContent = (moduleId, contentType, contentId, contentTitle) => {
    if (window.confirm(`Are you sure you want to delete "${contentTitle}"?`)) {
      deleteContent(moduleId, contentType, contentId)
      toast.success('Content deleted successfully!')
    }
  }

  useEffect(() => {
    // Initial animations
    const tl = gsap.timeline()
    
    gsap.set(welcomeRef.current, {
      opacity: 0,
      y: 30
    })
    
    tl.to(welcomeRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    })

    // Create network animation
    createNetworkEffect()
  }, [])

  const createNetworkEffect = () => {
    const network = networkRef.current
    const nodeCount = 15
    const nodes = []

    for (let i = 0; i < nodeCount; i++) {
      const node = document.createElement('div')
      node.className = 'network-node admin-node'
      network.appendChild(node)
      nodes.push(node)

      gsap.set(node, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      })

      gsap.to(node, {
        x: `+=${Math.random() * 100 - 50}`,
        y: `+=${Math.random() * 100 - 50}`,
        duration: Math.random() * 10 + 10,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    }
  }

  const adminSections = [
    {
      id: 'overview',
      title: 'Course Overview',
      icon: '📊',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'students',
      title: 'Student Management',
      icon: '👥',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'content',
      title: 'Content Management',
      icon: '📚',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'analytics',
      title: 'Learning Analytics',
      icon: '📈',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
      id: 'assignments',
      title: 'Assignment Center',
      icon: '📝',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
      id: 'settings',
      title: 'Course Settings',
      icon: '⚙️',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  ]

  const getStudentStats = () => ({
    totalStudents: 142,
    activeStudents: 128,
    averageProgress: 67,
    completionRate: 84
  })

  const getCourseStats = () => ({
    totalModules: 5,
    totalAssignments: 15,
    submittedAssignments: 89,
    averageScore: 78
  })

  const renderOverview = () => {
    const studentStats = getStudentStats()
    const courseStats = getCourseStats()

    return (
      <div className="admin-overview">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{studentStats.totalStudents}</h3>
              <p>Total Students</p>
              <span className="stat-change">+12 this month</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{studentStats.activeStudents}</h3>
              <p>Active Students</p>
              <span className="stat-change">90% engagement</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{studentStats.averageProgress}%</h3>
              <p>Average Progress</p>
              <span className="stat-change">+5% this week</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <h3>{courseStats.averageScore}%</h3>
              <p>Average Score</p>
              <span className="stat-change">Above target</span>
            </div>
          </div>
        </div>

        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <div className="activity-info">
                <p><strong>Sarah Chen</strong> submitted Solar PV Assignment 2</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎥</span>
              <div className="activity-info">
                <p><strong>15 students</strong> completed Wind Power Module videos</p>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            <div className="activity-item">
              <span className="activity-icon">❓</span>
              <div className="activity-info">
                <p><strong>Alex Johnson</strong> asked a question in Hydropower module</p>
                <span className="activity-time">6 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStudents = () => (
    <div className="admin-students">
      <div className="section-header">
        <h3>Student Management</h3>
        <button className="add-student-btn">+ Add Student</button>
      </div>
      
      <div className="students-table">
        <div className="table-header">
          <span>Student Name</span>
          <span>Student ID</span>
          <span>Progress</span>
          <span>Last Active</span>
          <span>Actions</span>
        </div>
        
        {[
          { name: 'Sarah Chen', id: 'ST2024001', progress: 85, lastActive: '2 hours ago' },
          { name: 'Alex Johnson', id: 'ST2024002', progress: 72, lastActive: '1 day ago' },
          { name: 'Maria Garcia', id: 'ST2024003', progress: 91, lastActive: '30 min ago' },
          { name: 'James Wilson', id: 'ST2024004', progress: 68, lastActive: '3 hours ago' },
          { name: 'Emma Davis', id: 'ST2024005', progress: 79, lastActive: '1 hour ago' }
        ].map((student, index) => (
          <div key={index} className="table-row">
            <span className="student-name">{student.name}</span>
            <span className="student-id">{student.id}</span>
            <span className="student-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${student.progress}%` }}
                ></div>
              </div>
              {student.progress}%
            </span>
            <span className="last-active">{student.lastActive}</span>
            <span className="actions">
              <button className="action-btn view">👁️</button>
              <button className="action-btn message">💬</button>
              <button className="action-btn settings">⚙️</button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderContent = () => {
    const moduleList = getAllModules()
    
    return (
      <div className="admin-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Management</h3>
          <button
            onClick={() => openContentModal(moduleList[0]?.id, 'videos')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Content</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {moduleList.map((module) => {
            const contentCounts = {
              videos: module.videos?.length || 0,
              assignments: module.assignments?.length || 0,
              quizzes: module.quizzes?.length || 0,
              textbooks: module.textbooks?.length || 0,
              projects: module.projects?.length || 0
            }
            
            return (
              <motion.div
                key={module.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{module.icon}</div>
                    <div>
                      <h4 className="font-bold text-lg text-white">{module.title}</h4>
                      <p className="text-sm text-gray-300">{module.description}</p>
                    </div>
                  </div>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    ✅ Active
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {Object.entries(contentCounts).map(([type, count]) => (
                    <div key={type} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-white">{count}</div>
                      <div className="text-xs text-gray-400 capitalize">{type}</div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {['videos', 'textbooks', 'projects', 'assignments', 'quizzes'].map((contentType) => (
                    <div key={contentType} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="capitalize text-sm text-gray-300">{contentType}</span>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          {contentCounts[contentType]}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openContentModal(module.id, contentType)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          title="Add Content"
                        >
                          <Plus className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </button>
                        <button
                          onClick={() => {
                            // View content details
                            console.log(`Viewing ${contentType} for ${module.title}`)
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          title="View Content"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Content Items Preview */}
                {module.videos && module.videos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h5 className="text-sm font-semibold text-gray-300 mb-2">Recent Videos</h5>
                    {module.videos.slice(0, 2).map((video) => (
                      <div key={video.id} className="flex items-center justify-between py-2">
                        <div className="flex-1">
                          <p className="text-sm text-white truncate">{video.title}</p>
                          <p className="text-xs text-gray-400">{video.duration || 'N/A'}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openContentModal(module.id, 'videos', video)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteContent(module.id, 'videos', video.id, video.title)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderAnalytics = () => (
    <div className="admin-analytics">
      <h3>Learning Analytics</h3>
      <div className="analytics-grid">
        <div className="analytics-card">
          <h4>Module Completion Rates</h4>
          <div className="completion-stats">
            {['Solar PV: 89%', 'Wind Power: 76%', 'Hydropower: 82%', 'Geothermal: 71%', 'Solar Thermal: 68%'].map((stat, index) => (
              <div key={index} className="completion-item">{stat}</div>
            ))}
          </div>
        </div>
        
        <div className="analytics-card">
          <h4>Time Spent Learning</h4>
          <p className="analytics-stat">Average: 4.2 hours/week</p>
          <p className="analytics-detail">Students are spending adequate time on coursework</p>
        </div>
        
        <div className="analytics-card">
          <h4>Popular Content</h4>
          <div className="popular-content">
            <div>1. Solar PV Installation Video</div>
            <div>2. Wind Turbine Design Project</div>
            <div>3. Hydropower Calculations</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAssignments = () => (
    <div className="admin-assignments">
      <div className="section-header">
        <h3>Assignment Center</h3>
        <button className="create-assignment-btn">+ Create Assignment</button>
      </div>
      
      <div className="assignments-grid">
        {[
          { title: 'Solar PV System Design', module: 'Solar PV', submitted: 45, total: 52, due: '2024-03-20' },
          { title: 'Wind Farm Analysis', module: 'Wind Power', submitted: 38, total: 52, due: '2024-03-25' },
          { title: 'Hydropower Calculations', module: 'Hydropower', submitted: 52, total: 52, due: '2024-03-15' }
        ].map((assignment, index) => (
          <div key={index} className="assignment-card">
            <div className="assignment-header">
              <h4>{assignment.title}</h4>
              <span className="assignment-module">{assignment.module}</span>
            </div>
            <div className="assignment-progress">
              <span>Submitted: {assignment.submitted}/{assignment.total}</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="assignment-due">Due: {assignment.due}</div>
            <button className="review-btn">Review Submissions</button>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="admin-settings">
      <h3>Course Settings</h3>
      <div className="settings-sections">
        <div className="settings-card">
          <h4>General Settings</h4>
          <div className="setting-item">
            <label>Course Name</label>
            <input type="text" value="Renewable Energy Learning Platform" />
          </div>
          <div className="setting-item">
            <label>Semester</label>
            <select>
              <option>Spring 2024</option>
              <option>Fall 2024</option>
            </select>
          </div>
        </div>
        
        <div className="settings-card">
          <h4>Assignment Settings</h4>
          <div className="setting-item">
            <label>Default Due Date Extension</label>
            <select>
              <option>3 days</option>
              <option>1 week</option>
              <option>2 weeks</option>
            </select>
          </div>
        </div>
        
        <div className="settings-card">
          <h4>Grading Settings</h4>
          <div className="setting-item">
            <label>Passing Grade</label>
            <input type="number" value="60" min="0" max="100" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview()
      case 'students': return renderStudents()
      case 'content': return renderContent()
      case 'analytics': return renderAnalytics()
      case 'assignments': return renderAssignments()
      case 'settings': return renderSettings()
      default: return renderOverview()
    }
  }

  return (
    <div className="admin-dashboard">
      <div className="network-background" ref={networkRef}></div>
      
      <header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <img 
              src="https://mlkd.aut.ac.ir/2024/wp-content/uploads/2024/04/Aut-Logo.png"
              alt="AUT Logo" 
              className="header-logo"
            />
            <h1>Teacher Dashboard</h1>
          </div>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="admin-main">
        <div className="welcome-section" ref={welcomeRef}>
          <h2>Course Management Dashboard</h2>
          <p>Manage your renewable energy course, track student progress, and analyze learning outcomes</p>
        </div>
        
        <nav className="admin-nav">
          {adminSections.map((section) => (
            <button
              key={section.id}
              className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              style={{ background: activeSection === section.id ? section.color : '' }}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-title">{section.title}</span>
            </button>
          ))}
        </nav>
        
        <section className="admin-content-area">
          {renderActiveSection()}
        </section>
      </main>
      
      <AIChatbot />
      
      {/* New Content Modal */}
      <NewContentModal
        isOpen={isModalOpen}
        onClose={closeContentModal}
        moduleId={selectedModule}
      />
    </div>
  )
}

export default AdminDashboard