import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// In Next.js, env vars are baked in at build time.
// Using dummy values here prevents the build from crashing during static generation
// when env vars are missing from the build environment.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
