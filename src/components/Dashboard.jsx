import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [isSolarExpanded, setIsSolarExpanded] = useState(false)
  const [activeSubSection, setActiveSubSection] = useState('videos')
  const navigate = useNavigate()
  const welcomeRef = useRef(null)
  const solarBoxRef = useRef(null)
  const solarContentRef = useRef(null)
  const networkRef = useRef(null)

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  useEffect(() => {
    // Initial animations
    const tl = gsap.timeline()
    
    gsap.set([welcomeRef.current, solarBoxRef.current], {
      opacity: 0,
      y: 30
    })
    
    tl.to(welcomeRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    })
    .to(solarBoxRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")

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

  const handleSolarClick = () => {
    const isExpanding = !isSolarExpanded
    setIsSolarExpanded(isExpanding)

    if (isExpanding) {
      // Expand animation
      gsap.to(solarBoxRef.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.fromTo(solarContentRef.current, {
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
      gsap.to(solarContentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(solarBoxRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      })
    }
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
          <p>Select a renewable energy topic to begin learning</p>
        </div>
        
        <div className="energy-modules">
          <div className="solar-module" ref={solarBoxRef}>
            <div className="module-header" onClick={handleSolarClick}>
              <div className="module-icon">
                <img 
                  src="/renewable_energy_platform/assets/solar-section.png"
                  alt="Solar PV" 
                  className="module-image"
                />
              </div>
              <div className="module-info">
                <h3>Solar PV</h3>
                <p>Photovoltaic Systems & Technology</p>
              </div>
              <div className={`expand-arrow ${isSolarExpanded ? 'expanded' : ''}`}>
                ▼
              </div>
            </div>
            
            <div className="module-content" ref={solarContentRef}>
              <div className="content-tabs">
                <button 
                  className={`content-tab ${activeSubSection === 'videos' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection('videos')}
                >
                  🎥 Videos
                </button>
                <button 
                  className={`content-tab ${activeSubSection === 'textbooks' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection('textbooks')}
                >
                  📚 Textbooks
                </button>
                <button 
                  className={`content-tab ${activeSubSection === 'projects' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection('projects')}
                >
                  🛠️ Projects
                </button>
                <button 
                  className={`content-tab ${activeSubSection === 'assignments' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection('assignments')}
                >
                  📝 Assignments
                </button>
                <button 
                  className={`content-tab ${activeSubSection === 'quizzes' ? 'active' : ''}`}
                  onClick={() => setActiveSubSection('quizzes')}
                >
                  ❓ Quizzes
                </button>
              </div>

              <div className="content-section">
                {activeSubSection === 'videos' && (
                  <div className="videos-section">
                    <h4>Educational Videos</h4>
                    <div className="content-grid">
                      <div className="content-item">
                        <div className="item-icon">▶️</div>
                        <div className="item-details">
                          <h5>Introduction to Solar PV</h5>
                          <p>Basic concepts and principles - 15 min</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">▶️</div>
                        <div className="item-details">
                          <h5>Cell Technology Deep Dive</h5>
                          <p>Silicon cells and efficiency - 20 min</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">▶️</div>
                        <div className="item-details">
                          <h5>System Design & Installation</h5>
                          <p>Practical implementation - 25 min</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'textbooks' && (
                  <div className="textbooks-section">
                    <h4>Reference Materials</h4>
                    <div className="content-grid">
                      <div className="content-item">
                        <div className="item-icon">📖</div>
                        <div className="item-details">
                          <h5>Solar Energy Engineering</h5>
                          <p>Comprehensive guide to PV systems</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">📖</div>
                        <div className="item-details">
                          <h5>Photovoltaic Materials</h5>
                          <p>Advanced materials science</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">📑</div>
                        <div className="item-details">
                          <h5>Industry Standards</h5>
                          <p>IEEE and IEC standards</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'projects' && (
                  <div className="projects-section">
                    <h4>Hands-on Projects</h4>
                    <div className="content-grid">
                      <div className="content-item">
                        <div className="item-icon">⚡</div>
                        <div className="item-details">
                          <h5>Basic Solar Cell Testing</h5>
                          <p>Measure I-V characteristics</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">🔧</div>
                        <div className="item-details">
                          <h5>Mini PV System Design</h5>
                          <p>Design a 5W solar system</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">📊</div>
                        <div className="item-details">
                          <h5>Efficiency Analysis</h5>
                          <p>Compare different cell types</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'assignments' && (
                  <div className="assignments-section">
                    <h4>Weekly Assignments</h4>
                    <div className="content-grid">
                      <div className="content-item">
                        <div className="item-icon">📋</div>
                        <div className="item-details">
                          <h5>Assignment 1: Solar Irradiance</h5>
                          <p>Due: March 15 - Calculate daily irradiance</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">📋</div>
                        <div className="item-details">
                          <h5>Assignment 2: System Sizing</h5>
                          <p>Due: March 22 - Size a residential system</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">📋</div>
                        <div className="item-details">
                          <h5>Assignment 3: Cost Analysis</h5>
                          <p>Due: March 29 - Economic feasibility study</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeSubSection === 'quizzes' && (
                  <div className="quizzes-section">
                    <h4>Knowledge Assessment</h4>
                    <div className="content-grid">
                      <div className="content-item">
                        <div className="item-icon">✅</div>
                        <div className="item-details">
                          <h5>Quiz 1: Fundamentals</h5>
                          <p>Score: 85% - Retake available</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">⏳</div>
                        <div className="item-details">
                          <h5>Quiz 2: Technology</h5>
                          <p>Available now - 10 questions</p>
                        </div>
                      </div>
                      <div className="content-item">
                        <div className="item-icon">🔒</div>
                        <div className="item-details">
                          <h5>Final Assessment</h5>
                          <p>Unlocks after completing all modules</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard