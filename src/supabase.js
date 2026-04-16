import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

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

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options) => withTimeout(fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }))
  }
})
