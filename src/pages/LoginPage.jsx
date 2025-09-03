import React from 'react'
import LoginForm from '../components/LoginForm'
import './LoginPage.css'

const LoginPage = ({ onLogin }) => {
  return (
    <div className="login-page">
      <LoginForm onLogin={onLogin} />
    </div>
  )
}

export default LoginPage