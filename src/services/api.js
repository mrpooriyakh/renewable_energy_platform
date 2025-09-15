// API service for backend communication
import supabaseService from './supabase'

const API_BASE_URL = 'http://localhost:8000'
const USE_SUPABASE = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost'

class ApiService {
  constructor() {
    this.token = localStorage.getItem('auth_token')
  }

  setAuthToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    }

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getHeaders(options.auth !== false),
      ...options
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error)
      throw error
    }
  }

  // Authentication
  async login(username, password) {
    if (USE_SUPABASE) {
      try {
        const data = await supabaseService.signIn(username, password)
        this.setAuthToken(data.session?.access_token)
        return { access_token: data.session?.access_token, user: data.user }
      } catch (error) {
        throw new Error(error.message || 'Login failed')
      }
    } else {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      this.setAuthToken(data.access_token)
      return data
    }
  }

  async getCurrentUser() {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getCurrentUser()
      } catch (error) {
        throw new Error(error.message || 'Failed to get current user')
      }
    } else {
      return this.request('/auth/me')
    }
  }

  // Modules
  async getModules() {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getModules()
      } catch (error) {
        throw new Error(error.message || 'Failed to get modules')
      }
    } else {
      return this.request('/modules')
    }
  }

  async createModule(moduleData) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.createModule(moduleData)
      } catch (error) {
        throw new Error(error.message || 'Failed to create module')
      }
    } else {
      return this.request('/modules', {
        method: 'POST',
        body: JSON.stringify(moduleData)
      })
    }
  }

  // Content
  async getContent(moduleId = null) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.getContent(moduleId)
      } catch (error) {
        throw new Error(error.message || 'Failed to get content')
      }
    } else {
      const endpoint = moduleId ? `/content?module_id=${moduleId}` : '/content'
      return this.request(endpoint)
    }
  }

  async createContent(contentData) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.createContent(contentData)
      } catch (error) {
        throw new Error(error.message || 'Failed to create content')
      }
    } else {
      return this.request('/content', {
        method: 'POST',
        body: JSON.stringify(contentData)
      })
    }
  }

  async updateContent(contentId, contentData) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.updateContent(contentId, contentData)
      } catch (error) {
        throw new Error(error.message || 'Failed to update content')
      }
    } else {
      return this.request(`/content/${contentId}`, {
        method: 'PUT',
        body: JSON.stringify(contentData)
      })
    }
  }

  async deleteContent(contentId) {
    if (USE_SUPABASE) {
      try {
        return await supabaseService.deleteContent(contentId)
      } catch (error) {
        throw new Error(error.message || 'Failed to delete content')
      }
    } else {
      return this.request(`/content/${contentId}`, {
        method: 'DELETE'
      })
    }
  }

  // File Upload
  async uploadFile(contentId, file) {
    if (USE_SUPABASE) {
      try {
        const path = `content/${contentId}/${file.name}`
        const uploadResult = await supabaseService.uploadFile('content-files', path, file)
        const fileUrl = await supabaseService.getFileUrl('content-files', path)

        // Update content with file URL
        await supabaseService.updateContent(contentId, {
          file_url: fileUrl,
          file_name: file.name
        })

        return { file_url: fileUrl, file_name: file.name }
      } catch (error) {
        throw new Error(error.message || 'File upload failed')
      }
    } else {
      const formData = new FormData()
      formData.append('file', file)

      const headers = {}
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(`${API_BASE_URL}/content/${contentId}/upload`, {
        method: 'POST',
        headers,
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'File upload failed')
      }

      return await response.json()
    }
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/dashboard/stats')
  }

  logout() {
    this.setAuthToken(null)
  }
}

export default new ApiService()