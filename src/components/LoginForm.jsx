import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import './LoginForm.css'

const LoginForm = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  
  const containerRef = useRef(null)
  const cardRef = useRef(null)
  const headerRef = useRef(null)
  const imageRef = useRef(null)
  const formRef = useRef(null)
  const footerRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    const tl = gsap.timeline()
    
    // Initial setup
    gsap.set([headerRef.current, formRef.current, footerRef.current], {
      opacity: 0,
      y: 30
    })
    
    gsap.set(cardRef.current, {
      scale: 0.8,
      opacity: 0
    })

    gsap.set(imageRef.current, {
      scale: 0,
      rotation: 180,
      opacity: 0
    })

    // Main animation sequence
    tl.to(cardRef.current, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .to(imageRef.current, {
      scale: 1,
      rotation: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.4)"
    }, "-=0.2")
    .to(headerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3")
    .to(formRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.2")
    .to(footerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: "power2.out"
    }, "-=0.1")

    // Create floating particles
    createFloatingParticles()
    
    // Add hover effect to card
    const card = cardRef.current
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.15)",
        duration: 0.3,
        ease: "power2.out"
      })
    }
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out"
      })
    }
    
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  const createFloatingParticles = () => {
    const container = containerRef.current
    const particleCount = 20
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'floating-particle'
      container.appendChild(particle)
      particlesRef.current.push(particle)
      
      // Random positioning and animation
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        scale: Math.random() * 0.5 + 0.5
      })
      
      gsap.to(particle, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        rotation: Math.random() * 360,
        duration: Math.random() * 10 + 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Button animation
    const button = e.target.querySelector('.login-button')
    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1
    })

    if (studentId === 'admin' && password === 'admin') {
      setTimeout(() => {
        // Success animation
        gsap.to(cardRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            onLogin({ studentId, name: 'Administrator' })
            navigate('/main-dashboard')
            setIsLoading(false)
          }
        })
      }, 500)
    } else {
      setTimeout(() => {
        // Error shake animation
        gsap.to(cardRef.current, {
          x: -10,
          duration: 0.1,
          yoyo: true,
          repeat: 5,
          onComplete: () => {
            gsap.set(cardRef.current, { x: 0 })
          }
        })
        setError('Invalid student ID or password')
        setIsLoading(false)
      }, 500)
    }
  }

  const handleInputFocus = (e) => {
    gsap.to(e.target, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  const handleInputBlur = (e) => {
    gsap.to(e.target, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  return (
    <div className="login-container" ref={containerRef}>
      <div className="login-card" ref={cardRef}>
        <div className="login-header" ref={headerRef}>
          <div className="logo-container">
            <img 
              ref={imageRef}
              src="https://mlkd.aut.ac.ir/2024/wp-content/uploads/2024/04/Aut-Logo.png"
              alt="AUT University Logo" 
              className="login-image"
            />
            <div className="header-text">
              <h1>Renewable Energy Learning Platform</h1>
              <p>Sign in to access your courses</p>
            </div>
          </div>
        </div>
        
        <form className="login-form" ref={formRef} onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="studentId">Student ID</label>
            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your student ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button" disabled={isLoading}>
            <span className="button-text">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </span>
            <div className="button-ripple"></div>
          </button>
        </form>
        
        <div className="login-footer" ref={footerRef}>
          <p>For testing: ID: admin, Password: admin</p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm