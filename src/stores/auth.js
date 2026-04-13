import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isDemo } from '../supabase'

const LOCATION_STORAGE_KEY = 'bhumi_user_location'

function loadSavedLocation() {
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

function saveLocation(location) {
  try {
    if (location) {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location))
    } else {
      localStorage.removeItem(LOCATION_STORAGE_KEY)
    }
  } catch {
    // Silently fail
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)
  const adminRole = ref(false)
  const userLocation = ref(loadSavedLocation())

  const isLoggedIn = computed(() => !!user.value)
  const userEmail = computed(() => user.value?.email || '')
  const userName = computed(() => user.value?.user_metadata?.full_name || user.value?.email?.split('@')[0] || '')

  function setLocation(location) {
    userLocation.value = location
    saveLocation(location)
  }

  function clearLocation() {
    userLocation.value = null
    saveLocation(null)
  }

  async function initialize() {
    if (initialized.value) return
    if (isDemo) {
      // Skip auth initialization in demo mode
      initialized.value = true
      return
    }

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
    if (isDemo) {
      adminRole.value = false
      return
    }
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

  async function assignRole(userId, role) {
    if (isDemo) return
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })
      if (error) throw error
      // Refresh current user's admin status if it's them
      if (user.value?.id === userId && role === 'admin') {
        await _checkAdminRole()
      }
    } catch (err) {
      console.error('assignRole error:', err)
      throw err
    }
  }

  async function removeRole(userId, role) {
    if (isDemo) return
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role)
      if (error) throw error
      // Refresh current user's admin status if it's them
      if (user.value?.id === userId && role === 'admin') {
        await _checkAdminRole()
      }
    } catch (err) {
      console.error('removeRole error:', err)
      throw err
    }
  }

  async function getUserRoles(userId) {
    if (isDemo) return []
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId || user.value?.id)
      if (error) throw error
      return data.map(r => r.role)
    } catch {
      return []
    }
  }

  async function signInWithGoogle() {
    if (isDemo) {
      throw new Error('Google sign in is not available in demo mode')
    }
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
    if (isDemo) {
      throw new Error('WeChat sign in is not available in demo mode')
    }
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'wechat',
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

  async function signInWithPhone(phone) {
    if (isDemo) {
      throw new Error('Phone sign in is not available in demo mode')
    }
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
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

  async function signOut() {
    if (isDemo) {
      user.value = null
      adminRole.value = false
      return
    }
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    adminRole.value = false
  }

  async function updateProfile(updates) {
    if (isDemo) {
      throw new Error('Profile update is not available in demo mode')
    }
    if (!updates || typeof updates !== 'object') {
      throw new Error('Invalid profile data')
    }
    // Sanitize profile data before sending to Supabase
    const sanitized = {}
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        sanitized[key] = value.replace(/[<>'"&]/g, '').trim()
      } else if (value !== null && value !== undefined) {
        sanitized[key] = value
      }
    }
    const { data, error } = await supabase.auth.updateUser({
      data: sanitized
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
    userLocation,
    isLoggedIn,
    userEmail,
    userName,
    initialize,
    checkAdminRole,
    assignRole,
    removeRole,
    getUserRoles,
    setLocation,
    clearLocation,
    signInWithGoogle,
    signInWithWechat,
    signInWithPhone,
    signOut,
    updateProfile
  }
})
