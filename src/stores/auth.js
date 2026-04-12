import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const adminRole = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || '')

  async function initialize() {
    if (initialized.value) return
    loading.value = true
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      if (session) {
        user.value = session.user
        await _checkAdminRole()
      }
    } catch (err) {
      console.error('Auth init error:', err)
    } finally {
      loading.value = false
      initialized.value = true
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user || null
      if (session?.user) {
        await _checkAdminRole()
      } else {
        adminRole.value = false
      }
    })
  }

  async function _checkAdminRole() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.value?.id)
        .eq('role', 'admin')
        .maybeSingle()
      if (error) throw error
      adminRole.value = !!data
    } catch {
      adminRole.value = false
    }
  }

  async function checkAdminRole() {
    if (!user.value) return false
    await _checkAdminRole()
    return adminRole.value
  }

  async function signUp(email, password, fullName) {
    loading.value = true
    try {
      const sanitizedEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: { full_name: fullName?.trim() || '' },
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      if (error) throw error
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function signIn(email, password) {
    loading.value = true
    try {
      const sanitizedEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password
      })
      if (error) throw error
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  async function signInWithGoogle() {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`
        }
      })
      if (error) throw error
      return data
    } finally {
      loading.value = false
    }
  }

  async function signInWithWechat() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'wechat',
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    })
    if (error) throw error
    return data
  }

  async function signInWithPhone(phone) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        redirectTo: `${window.location.origin}/login`
      }
    })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    adminRole.value = false
  }

  async function resetPassword(email) {
    const sanitizedEmail = email.trim().toLowerCase()
    const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) throw error
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })
    if (error) throw error
    user.value = data.user
    return data
  }

  return {
    user,
    loading,
    initialized,
    adminRole,
    isLoggedIn,
    userEmail,
    userName,
    initialize,
    checkAdminRole,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithWechat,
    signInWithPhone,
    signOut,
    resetPassword,
    updateProfile
  }
})
