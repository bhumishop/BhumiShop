import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

const isDemo = !supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')
if (isDemo) {
  console.warn('[BhumiShop] Running in demo mode (no Supabase)')
}

const noOp = () => ({ data: null, error: { message: 'Demo mode' } })
const noOpAuth = {
  getSession: noOp,
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signUp: noOp,
  signInWithPassword: noOp,
  signInWithOAuth: noOp,
  signInWithOtp: noOp,
  signOut: noOp,
  resetPasswordForEmail: noOp,
  updateUser: noOp,
  getUser: noOp
}
const noOpClient = { auth: noOpAuth, from: () => ({ select: () => ({ eq: () => ({ then: () => ({ data: [] }) }), order: () => ({ then: () => ({ data: [] }) }), insert: noOp, update: () => ({ eq: noOp }), delete: noOp }), rpc: noOp }) }

export const supabase = !isDemo && supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : noOpClient
