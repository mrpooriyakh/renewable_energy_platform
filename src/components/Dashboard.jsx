import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import './Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview')
  const solarSectionRef = useRef(null)
  const welcomeRef = useRef(null)
  const sectionsRef = useRef(null)

  useEffect(() => {
    // Initial animations
    const tl = gsap.timeline()
    
    gsap.set([welcomeRef.current, sectionsRef.current], {
      opacity: 0,
      y: 30
    })
    
    tl.to(welcomeRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    })
    .to(sectionsRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.3")
  }, [])

  const handleSectionClick = (section) => {
    setActiveSection(section)
    
    // Animate section transition
    gsap.fromTo(solarSectionRef.current, 
      { scale: 0.95, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
    )
  }

  return (
    <div className="dashboard">
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
            <button onClick={onLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-main">
        <div className="welcome-section" ref={welcomeRef}>
          <h2>Welcome to Your Learning Dashboard</h2>
          <p>Explore the fascinating world of renewable energy technologies</p>
        </div>
        
        <div className="sections-container" ref={sectionsRef}>
          <div className="navigation-tabs">
            <button 
              className={`tab ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => handleSectionClick('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`tab ${activeSection === 'solar' ? 'active' : ''}`}
              onClick={() => handleSectionClick('solar')}
            >
              ☀️ Solar PV
            </button>
            <button 
              className={`tab ${activeSection === 'wind' ? 'active' : ''}`}
              onClick={() => handleSectionClick('wind')}
            >
              💨 Wind Energy
            </button>
            <button 
              className={`tab ${activeSection === 'hydro' ? 'active' : ''}`}
              onClick={() => handleSectionClick('hydro')}
            >
              💧 Hydro Power
            </button>
          </div>

          <div className="content-area">
            {activeSection === 'overview' && (
              <div className="overview-content">
                <h3>Course Overview</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-number">4</div>
                    <div className="stat-label">Energy Types</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">12</div>
                    <div className="stat-label">Lessons</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">85%</div>
                    <div className="stat-label">Your Progress</div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'solar' && (
              <div className="solar-content" ref={solarSectionRef}>
                <div className="section-header">
                  <h3>Solar Photovoltaic (PV) Systems</h3>
                  <p>Learn about converting sunlight directly into electricity using semiconductor technology</p>
                </div>
                
                <div className="solar-main">
                  <div className="solar-image-container">
                    <img 
                      src="/renewable_energy_platform/assets/solar-section.png"
                      alt="Solar PV System" 
                      className="solar-image"
                    />
                  </div>
                  
                  <div className="solar-info">
                    <h4>Key Learning Topics:</h4>
                    <ul className="topics-list">
                      <li>📡 Photovoltaic Cell Technology</li>
                      <li>⚡ DC to AC Power Conversion</li>
                      <li>🔋 Energy Storage Systems</li>
                      <li>📈 Efficiency Optimization</li>
                      <li>💰 Cost Analysis & ROI</li>
                      <li>🌍 Environmental Impact</li>
                    </ul>
                    
                    <div className="solar-actions">
                      <button className="primary-button">Start Learning</button>
                      <button className="secondary-button">Take Quiz</button>
                    </div>
                  </div>
                </div>
                
                <div className="solar-stats">
                  <div className="stat-box">
                    <span className="stat-title">Global Capacity</span>
                    <span className="stat-value">1,000+ GW</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Efficiency Range</span>
                    <span className="stat-value">15-22%</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">Lifespan</span>
                    <span className="stat-value">25+ Years</span>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'wind' && (
              <div className="coming-soon-section">
                <h3>🚧 Wind Energy Section</h3>
                <p>Coming soon! Learn about wind turbines and wind power generation.</p>
              </div>
            )}

            {activeSection === 'hydro' && (
              <div className="coming-soon-section">
                <h3>🚧 Hydro Power Section</h3>
                <p>Coming soon! Explore hydroelectric power generation systems.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard