import React, { useEffect } from 'react'
import LoginForm from '../components/LoginForm'
import loginWallpaper from '/login-wallpaper.jpg'
import './LoginPage.css'

const LoginPage = ({ onLogin }) => {
  useEffect(() => {
    // Set background image dynamically to ensure it works on all platforms
    const loginPage = document.querySelector('.login-page')
    if (loginPage) {
      loginPage.style.backgroundImage = `url('${loginWallpaper}'), linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)`
      loginPage.style.backgroundSize = 'cover, 400% 400%'
      loginPage.style.backgroundPosition = 'center, center'
      loginPage.style.backgroundRepeat = 'no-repeat, no-repeat'
      loginPage.style.backgroundAttachment = 'fixed, scroll'
    }
  }, [])

  return (
    <div className="login-page">
      <LoginForm onLogin={onLogin} />
    </div>
  )
}

export default LoginPage