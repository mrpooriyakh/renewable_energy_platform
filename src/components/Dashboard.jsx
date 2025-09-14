import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { Play, Download, Calendar, CheckCircle } from 'lucide-react'
import AIChatbot from './AIChatbot'
import { useCourseStore } from '../store/courseStore'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [expandedModules, setExpandedModules] = useState({})
  const [activeSubSections, setActiveSubSections] = useState({})
  const navigate = useNavigate()
  const welcomeRef = useRef(null)
  const modulesRef = useRef({})
  const networkRef = useRef(null)
  
  // Zustand store hooks
  const { getAllModules, getModuleContent } = useCourseStore()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  // Get dynamic modules from store
  const energyModules = getAllModules()

  useEffect(() => {
    // Initialize active subsections for all modules
    const initialSubSections = {}
    energyModules.forEach(module => {
      initialSubSections[module.id] = 'videos'
    })
    setActiveSubSections(initialSubSections)

    // Initial animations
    const tl = gsap.timeline()
    
    const moduleElements = Object.values(modulesRef.current).filter(Boolean)
    
    gsap.set([welcomeRef.current, ...moduleElements], {
      opacity: 0,
      y: 30
    })
    
    tl.to(welcomeRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    })
    
    moduleElements.forEach((element, index) => {
      tl.to(element, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      }, `-=${0.4 - index * 0.1}`)
    })

    // Create network animation
    createNetworkEffect()
  }, [])

  const createNetworkEffect = () => {
    const network = networkRef.current
    const nodeCount = 20
    const nodes = []

    // Create network nodes
    for (let i = 0; i < nodeCount; i++) {
      const node = document.createElement('div')
      node.className = 'network-node'
      network.appendChild(node)
      nodes.push(node)

      // Random positioning
      gsap.set(node, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      })

      // Floating animation
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

  const handleModuleClick = (moduleId) => {
    const isExpanding = !expandedModules[moduleId]
    
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: isExpanding
    }))

    const moduleElement = modulesRef.current[moduleId]
    const contentElement = modulesRef.current[`${moduleId}-content`]
    
    if (!moduleElement || !contentElement) return

    if (isExpanding) {
      // Expand animation
      gsap.to(moduleElement, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.fromTo(contentElement, {
        height: 0,
        opacity: 0
      }, {
        height: 'auto',
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      })
    } else {
      // Collapse animation
      gsap.to(contentElement, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(moduleElement, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }
  }

  const handleSubSectionChange = (moduleId, subSection) => {
    setActiveSubSections(prev => ({
      ...prev,
      [moduleId]: subSection
    }))
  }

  const getModuleContentForDisplay = (moduleId, subSection) => {
    return getModuleContent(moduleId, subSection) || []
  }

  return (
    <div className="dashboard">
      <div className="network-background" ref={networkRef}></div>
      
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <img 
              src="https://mlkd.aut.ac.ir/2024/wp-content/uploads/2024/04/Aut-Logo.png"
              alt="AUT Logo" 
              className="header-logo"
            />
            <h1>Student Learning Platform</h1>
          </div>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section" ref={welcomeRef}>
          <h2>Welcome to Your Learning Dashboard</h2>
          <p>Explore 5 renewable energy technologies: Solar PV, Wind Power, Hydropower, Geothermal, and Solar Thermal</p>
        </div>
        
        <div className="energy-modules">
          {energyModules.map((module) => (
            <div 
              key={module.id} 
              className="energy-module" 
              ref={el => modulesRef.current[module.id] = el}
            >
              <div className="module-header" onClick={() => handleModuleClick(module.id)}>
                <motion.div 
                  className="module-icon"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="module-emoji-icon" style={{ background: module.color }}>
                    {module.icon}
                  </div>
                </motion.div>
                <div className="module-info">
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                </div>
                <div className={`expand-arrow ${expandedModules[module.id] ? 'expanded' : ''}`}>
                  ▼
                </div>
              </div>
              
              <div 
                className="module-content" 
                ref={el => modulesRef.current[`${module.id}-content`] = el}
              >
                <div className="content-tabs">
                  <button 
                    className={`content-tab ${activeSubSections[module.id] === 'videos' ? 'active' : ''}`}
                    onClick={() => handleSubSectionChange(module.id, 'videos')}
                  >
                    🎥 Videos
                  </button>
                  <button 
                    className={`content-tab ${activeSubSections[module.id] === 'textbooks' ? 'active' : ''}`}
                    onClick={() => handleSubSectionChange(module.id, 'textbooks')}
                  >
                    📚 Textbooks
                  </button>
                  <button 
                    className={`content-tab ${activeSubSections[module.id] === 'projects' ? 'active' : ''}`}
                    onClick={() => handleSubSectionChange(module.id, 'projects')}
                  >
                    🛠️ Projects
                  </button>
                  <button 
                    className={`content-tab ${activeSubSections[module.id] === 'assignments' ? 'active' : ''}`}
                    onClick={() => handleSubSectionChange(module.id, 'assignments')}
                  >
                    📝 Assignments
                  </button>
                  <button 
                    className={`content-tab ${activeSubSections[module.id] === 'quizzes' ? 'active' : ''}`}
                    onClick={() => handleSubSectionChange(module.id, 'quizzes')}
                  >
                    ❓ Quizzes
                  </button>
                </div>

                <div className="content-section">
                  <h4>
                    {activeSubSections[module.id] === 'videos' && 'Educational Videos'}
                    {activeSubSections[module.id] === 'textbooks' && 'Reference Materials'}
                    {activeSubSections[module.id] === 'projects' && 'Hands-on Projects'}
                    {activeSubSections[module.id] === 'assignments' && 'Weekly Assignments'}
                    {activeSubSections[module.id] === 'quizzes' && 'Knowledge Assessment'}
                  </h4>
                  <div className="content-grid">
                    {getModuleContentForDisplay(module.id, activeSubSections[module.id]).map((item, index) => (
                      <motion.div 
                        key={item.id || index} 
                        className="content-item bg-white/5 hover:bg-white/10 transition-all rounded-lg p-4 border border-white/10"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="item-icon flex-shrink-0">
                            {activeSubSections[module.id] === 'videos' && (
                              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {activeSubSections[module.id] === 'textbooks' && (
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                📖
                              </div>
                            )}
                            {activeSubSections[module.id] === 'projects' && (
                              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                🔧
                              </div>
                            )}
                            {activeSubSections[module.id] === 'assignments' && (
                              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                              </div>
                            )}
                            {activeSubSections[module.id] === 'quizzes' && (
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                {item.status || '❓'}
                              </div>
                            )}
                          </div>
                          <div className="item-details flex-1">
                            <h5 className="font-semibold text-white mb-1">{item.title}</h5>
                            <p className="text-gray-300 text-sm mb-2">
                              {item.duration ? `${item.description} - ${item.duration}` : item.description}
                            </p>
                            
                            {/* Show upload info if available */}
                            {item.uploadedBy && item.uploadedBy !== 'System' && (
                              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-2">
                                <span>📤 Uploaded by {item.uploadedBy}</span>
                                <span>•</span>
                                <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {/* Assignment due date */}
                            {activeSubSections[module.id] === 'assignments' && item.dueDate && (
                              <div className="flex items-center space-x-1 text-xs text-orange-400 mb-2">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {/* Download button for files */}
                            {(item.fileUrl || item.url) && (
                              <div className="flex space-x-2 mt-2">
                                <button
                                  onClick={() => window.open(item.fileUrl || item.url, '_blank')}
                                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition-colors flex items-center space-x-1"
                                >
                                  {activeSubSections[module.id] === 'videos' ? (
                                    <>
                                      <Play className="w-3 h-3" />
                                      <span>Watch</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="w-3 h-3" />
                                      <span>Download</span>
                                    </>
                                  )}
                                </button>
                                {item.fileName && (
                                  <span className="text-xs text-gray-400 py-1">{item.fileName}</span>
                                )}
                              </div>
                            )}
                            
                            {/* Instructions preview for assignments/projects */}
                            {(activeSubSections[module.id] === 'assignments' || activeSubSections[module.id] === 'projects') && item.instructions && (
                              <details className="mt-2">
                                <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300">
                                  View Instructions
                                </summary>
                                <p className="text-xs text-gray-300 mt-1 p-2 bg-white/5 rounded border-l-2 border-blue-500">
                                  {item.instructions.length > 150 
                                    ? `${item.instructions.substring(0, 150)}...` 
                                    : item.instructions
                                  }
                                </p>
                              </details>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Empty state */}
                    {getModuleContentForDisplay(module.id, activeSubSections[module.id]).length === 0 && (
                      <div className="col-span-full text-center py-8">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="text-gray-400">No {activeSubSections[module.id]} available yet</p>
                        <p className="text-sm text-gray-500 mt-1">Your teacher will upload content soon!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <AIChatbot />
    </div>
  )
}

export default Dashboard