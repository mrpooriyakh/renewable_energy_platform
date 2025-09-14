import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          background: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          margin: '20px',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#dc3545' }}>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '10px', 
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

console.log('Starting Renewable Energy Platform...')

const root = document.getElementById('root')
if (!root) {
  console.error('Root element not found!')
} else {
  console.log('Root element found, rendering app...')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}