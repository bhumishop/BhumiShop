import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey =
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[BhumiShop] Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in .env')
}

const TIMEOUT_MS = 60000

const withTimeout = (promise) => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Request timeout (60s)'))
    }, TIMEOUT_MS)
    promise
      .then((result) => {
        clearTimeout(timeout)
        resolve(result)
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}

export function applyAuthHeaders(headersInit) {
  const headers = new Headers(headersInit || {})
  if (!headers.has('apikey')) {
    headers.set('apikey', supabaseKey)
  }
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${supabaseKey}`)
  }
  return headers
}

const customFetch = (url, options = {}) => {
  const headers = applyAuthHeaders(options.headers)
  return withTimeout(fetch(url, { ...options, headers }))
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    // PKCE: supabase-js exchanges the ?code= on /login once, inside its
    // memoized initialize(). Never call exchangeCodeForSession() manually.
    flowType: 'pkce'
  },
  global: {
    fetch: customFetch
  }
})
