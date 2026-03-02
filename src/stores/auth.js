import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

const PRODUCTION_URL = 'https://shop.bhumisparshaschool.org'
const SUPABASE_URL = 'https://nuypyyxnacvglpqwqihx.supabase.co'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)

  function getRedirectUrl() {
    return PRODUCTION_URL
  }

  async function initialize() {
    loading.value = true
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      user.value = session.user
    }
    loading.value = false

    supabase.auth.onAuthStateChange((event, session) => {
      user.value = session?.user || null
    })
  }

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${SUPABASE_URL}/auth/v1/callback`
      }
    })
    if (error) throw error
    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${SUPABASE_URL}/auth/v1/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) throw error
    return data
  }

  async function signInWithGithub() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${SUPABASE_URL}/auth/v1/callback`
      }
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SUPABASE_URL}/auth/v1/callback`
    })
    if (error) throw error
  }

  return {
    user,
    loading,
    isLoggedIn,
    initialize,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword
  }
})
