import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [expandedModules, setExpandedModules] = useState({})
  const [activeSubSections, setActiveSubSections] = useState({})
  const navigate = useNavigate()
  const welcomeRef = useRef(null)
  const modulesRef = useRef({})
  const networkRef = useRef(null)

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  const energyModules = [
    {
      id: 'solar-pv',
      title: 'Solar PV',
      description: 'Photovoltaic Systems & Technology',
      image: '/renewable_energy_platform/assets/solar-section.png',
      icon: '☀️',
      color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      id: 'wind-power',
      title: 'Wind Power',
      description: 'Wind Turbines & Energy Generation',
      image: null,
      icon: '💨',
      color: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      id: 'hydropower',
      title: 'Hydropower',
      description: 'Water-based Energy Systems',
      image: null,
      icon: '💧',
      color: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      id: 'geothermal',
      title: 'Geothermal',
      description: 'Earth\'s Heat Energy Systems',
      image: null,
      icon: '🌋',
      color: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'
    },
    {
      id: 'solar-thermal',
      title: 'Solar Thermal',
      description: 'Heat Collection & Storage Systems',
      image: null,
      icon: '🔥',
      color: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
    }
  ]

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

  const getModuleContent = (moduleId, subSection) => {
    const contentData = {
      'solar-pv': {
        videos: [
          { title: 'Introduction to Solar PV', duration: '15 min', description: 'Basic concepts and principles' },
          { title: 'Cell Technology Deep Dive', duration: '20 min', description: 'Silicon cells and efficiency' },
          { title: 'System Design & Installation', duration: '25 min', description: 'Practical implementation' }
        ],
        textbooks: [
          { title: 'Solar Energy Engineering', description: 'Comprehensive guide to PV systems' },
          { title: 'Photovoltaic Materials', description: 'Advanced materials science' },
          { title: 'Industry Standards', description: 'IEEE and IEC standards' }
        ],
        projects: [
          { title: 'Basic Solar Cell Testing', description: 'Measure I-V characteristics' },
          { title: 'Mini PV System Design', description: 'Design a 5W solar system' },
          { title: 'Efficiency Analysis', description: 'Compare different cell types' }
        ],
        assignments: [
          { title: 'Assignment 1: Solar Irradiance', description: 'Due: March 15 - Calculate daily irradiance' },
          { title: 'Assignment 2: System Sizing', description: 'Due: March 22 - Size a residential system' },
          { title: 'Assignment 3: Cost Analysis', description: 'Due: March 29 - Economic feasibility study' }
        ],
        quizzes: [
          { title: 'Quiz 1: Fundamentals', description: 'Score: 85% - Retake available', status: '✅' },
          { title: 'Quiz 2: Technology', description: 'Available now - 10 questions', status: '⏳' },
          { title: 'Final Assessment', description: 'Unlocks after completing all modules', status: '🔒' }
        ]
      },
      'wind-power': {
        videos: [
          { title: 'Wind Energy Fundamentals', duration: '18 min', description: 'Basic wind energy principles' },
          { title: 'Turbine Design & Components', duration: '22 min', description: 'Modern wind turbine technology' },
          { title: 'Wind Farm Development', duration: '28 min', description: 'Large-scale wind projects' }
        ],
        textbooks: [
          { title: 'Wind Energy Handbook', description: 'Comprehensive wind energy guide' },
          { title: 'Aerodynamics of Wind Turbines', description: 'Advanced turbine design' },
          { title: 'Wind Resource Assessment', description: 'Site evaluation methods' }
        ],
        projects: [
          { title: 'Wind Speed Analysis', description: 'Analyze local wind patterns' },
          { title: 'Turbine Blade Design', description: 'Design optimal blade geometry' },
          { title: 'Power Curve Analysis', description: 'Study turbine performance curves' }
        ],
        assignments: [
          { title: 'Assignment 1: Wind Resource', description: 'Due: March 20 - Assess wind potential' },
          { title: 'Assignment 2: Turbine Selection', description: 'Due: March 27 - Choose optimal turbine' },
          { title: 'Assignment 3: Economic Analysis', description: 'Due: April 3 - Wind farm economics' }
        ],
        quizzes: [
          { title: 'Quiz 1: Wind Basics', description: 'Available now - 12 questions', status: '⏳' },
          { title: 'Quiz 2: Turbine Technology', description: 'Locked - Complete videos first', status: '🔒' },
          { title: 'Final Assessment', description: 'Comprehensive wind energy test', status: '🔒' }
        ]
      },
      'hydropower': {
        videos: [
          { title: 'Hydropower Principles', duration: '16 min', description: 'Water-based energy generation' },
          { title: 'Dam & Turbine Types', duration: '24 min', description: 'Different hydropower systems' },
          { title: 'Environmental Impact', duration: '20 min', description: 'Ecological considerations' }
        ],
        textbooks: [
          { title: 'Hydropower Engineering', description: 'Comprehensive hydropower guide' },
          { title: 'Water Turbine Design', description: 'Turbine technology and design' },
          { title: 'River System Analysis', description: 'Hydrological assessment methods' }
        ],
        projects: [
          { title: 'Micro-Hydro Design', description: 'Design a small-scale system' },
          { title: 'Flow Rate Calculations', description: 'Analyze water flow patterns' },
          { title: 'Turbine Efficiency Test', description: 'Measure turbine performance' }
        ],
        assignments: [
          { title: 'Assignment 1: Site Assessment', description: 'Due: March 18 - Evaluate hydro potential' },
          { title: 'Assignment 2: System Design', description: 'Due: March 25 - Design hydro system' },
          { title: 'Assignment 3: Environmental Study', description: 'Due: April 1 - Impact assessment' }
        ],
        quizzes: [
          { title: 'Quiz 1: Hydro Basics', description: 'Available now - 10 questions', status: '⏳' },
          { title: 'Quiz 2: System Design', description: 'Locked - Complete projects first', status: '🔒' },
          { title: 'Final Assessment', description: 'Comprehensive hydropower test', status: '🔒' }
        ]
      },
      'geothermal': {
        videos: [
          { title: 'Geothermal Energy Basics', duration: '17 min', description: 'Earth\'s heat energy systems' },
          { title: 'Heat Pump Technology', duration: '21 min', description: 'Geothermal heat pumps' },
          { title: 'Power Plant Operations', duration: '26 min', description: 'Large-scale geothermal plants' }
        ],
        textbooks: [
          { title: 'Geothermal Energy Systems', description: 'Comprehensive geothermal guide' },
          { title: 'Heat Pump Engineering', description: 'Ground-source heat pump design' },
          { title: 'Geothermal Resources', description: 'Resource assessment and mapping' }
        ],
        projects: [
          { title: 'Ground Temperature Analysis', description: 'Measure soil temperature profiles' },
          { title: 'Heat Pump Design', description: 'Design a residential heat pump' },
          { title: 'Efficiency Comparison', description: 'Compare heating systems' }
        ],
        assignments: [
          { title: 'Assignment 1: Resource Mapping', description: 'Due: March 22 - Map geothermal resources' },
          { title: 'Assignment 2: System Sizing', description: 'Due: March 29 - Size heat pump system' },
          { title: 'Assignment 3: Economic Analysis', description: 'Due: April 5 - Cost-benefit analysis' }
        ],
        quizzes: [
          { title: 'Quiz 1: Geothermal Basics', description: 'Available now - 11 questions', status: '⏳' },
          { title: 'Quiz 2: Heat Pumps', description: 'Locked - Complete assignments first', status: '🔒' },
          { title: 'Final Assessment', description: 'Comprehensive geothermal test', status: '🔒' }
        ]
      },
      'solar-thermal': {
        videos: [
          { title: 'Solar Thermal Principles', duration: '19 min', description: 'Heat collection and storage' },
          { title: 'Collector Technologies', duration: '23 min', description: 'Different collector types' },
          { title: 'Thermal Storage Systems', duration: '25 min', description: 'Heat storage methods' }
        ],
        textbooks: [
          { title: 'Solar Thermal Engineering', description: 'Comprehensive thermal systems guide' },
          { title: 'Heat Collector Design', description: 'Solar collector technology' },
          { title: 'Thermal Storage Systems', description: 'Heat storage and management' }
        ],
        projects: [
          { title: 'Collector Efficiency Test', description: 'Test solar collector performance' },
          { title: 'Thermal System Design', description: 'Design a solar water heating system' },
          { title: 'Storage Analysis', description: 'Analyze thermal storage options' }
        ],
        assignments: [
          { title: 'Assignment 1: Solar Resource', description: 'Due: March 24 - Assess solar thermal potential' },
          { title: 'Assignment 2: System Design', description: 'Due: March 31 - Design thermal system' },
          { title: 'Assignment 3: Performance Analysis', description: 'Due: April 7 - System performance study' }
        ],
        quizzes: [
          { title: 'Quiz 1: Thermal Basics', description: 'Available now - 9 questions', status: '⏳' },
          { title: 'Quiz 2: Collector Design', description: 'Locked - Complete videos first', status: '🔒' },
          { title: 'Final Assessment', description: 'Comprehensive solar thermal test', status: '🔒' }
        ]
      }
    }

    return contentData[moduleId]?.[subSection] || []
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
            <h1>Renewable Energy Learning Platform</h1>
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
                <div className="module-icon">
                  {module.image ? (
                    <img 
                      src={module.image}
                      alt={module.title} 
                      className="module-image"
                    />
                  ) : (
                    <div className="module-emoji-icon" style={{ background: module.color }}>
                      {module.icon}
                    </div>
                  )}
                </div>
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
                    {getModuleContent(module.id, activeSubSections[module.id]).map((item, index) => (
                      <div key={index} className="content-item">
                        <div className="item-icon">
                          {activeSubSections[module.id] === 'videos' && '▶️'}
                          {activeSubSections[module.id] === 'textbooks' && (index % 3 === 2 ? '📑' : '📖')}
                          {activeSubSections[module.id] === 'projects' && (index === 0 ? '⚡' : index === 1 ? '🔧' : '📊')}
                          {activeSubSections[module.id] === 'assignments' && '📋'}
                          {activeSubSections[module.id] === 'quizzes' && item.status}
                        </div>
                        <div className="item-details">
                          <h5>{item.title}</h5>
                          <p>{item.duration ? `${item.description} - ${item.duration}` : item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard