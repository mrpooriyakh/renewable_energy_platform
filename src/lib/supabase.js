import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Config:', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length,
  keyStart: supabaseKey?.substring(0, 20) + '...'
})

export const supabase = createClient(supabaseUrl, supabaseKey)