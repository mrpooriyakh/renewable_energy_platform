import { createClient } from '@supabase/supabase-js'

// These should come from environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Supabase API service
class SupabaseService {

  // Authentication
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  // Modules
  async getModules() {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('order_index')
    if (error) throw error
    return data
  }

  async createModule(moduleData) {
    const { data, error } = await supabase
      .from('modules')
      .insert([moduleData])
      .select()
    if (error) throw error
    return data[0]
  }

  // Content
  async getContent(moduleId = null) {
    let query = supabase
      .from('content_items')
      .select(`
        *,
        modules (title, icon)
      `)

    if (moduleId) {
      query = query.eq('module_id', moduleId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  async createContent(contentData) {
    const { data, error } = await supabase
      .from('content_items')
      .insert([{
        ...contentData,
        uploaded_by_id: (await this.getCurrentUser())?.id
      }])
      .select()
    if (error) throw error
    return data[0]
  }

  async updateContent(contentId, contentData) {
    const { data, error } = await supabase
      .from('content_items')
      .update(contentData)
      .eq('id', contentId)
      .select()
    if (error) throw error
    return data[0]
  }

  async deleteContent(contentId) {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', contentId)
    if (error) throw error
  }

  // File Storage
  async uploadFile(bucket, path, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    if (error) throw error
    return data
  }

  async getFileUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    return data.publicUrl
  }

  async deleteFile(bucket, path) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    if (error) throw error
  }

  // Real-time subscriptions
  subscribeToContent(callback) {
    return supabase
      .channel('content_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'content_items' },
        callback
      )
      .subscribe()
  }

  unsubscribe(subscription) {
    supabase.removeChannel(subscription)
  }
}

export default new SupabaseService()