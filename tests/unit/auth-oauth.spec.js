import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const TEST_URL = 'https://test-project.supabase.co'
const TEST_KEY = 'sb_publishable_test_key'
const USER_JWT = 'user-access-token-from-oauth'

const LIVE_URL = process.env.LIVE_SUPABASE_URL
const LIVE_KEY = process.env.LIVE_SUPABASE_KEY
const RUN_NETWORK = process.env.RUN_NETWORK_TESTS === '1' && Boolean(LIVE_URL && LIVE_KEY)

async function loadClient({ url = TEST_URL, key = TEST_KEY, fetchImpl } = {}) {
  vi.resetModules()
  vi.stubEnv('VITE_SUPABASE_URL', url)
  vi.stubEnv('VITE_SUPABASE_KEY', key)
  if (fetchImpl) {
    vi.stubGlobal('fetch', fetchImpl)
  }
  return import('@/supabase')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Supabase fetch auth headers (OAuth callback regression)', () => {
  it('keeps the user Bearer token instead of overwriting it with the Supabase key', async () => {
    const { applyAuthHeaders } = await loadClient()

    const headers = applyAuthHeaders({
      apikey: TEST_KEY,
      Authorization: `Bearer ${USER_JWT}`
    })

    expect(headers.get('Authorization')).toBe(`Bearer ${USER_JWT}`)
    expect(headers.get('apikey')).toBe(TEST_KEY)
  })

  it('preserves headers passed as a Headers instance (PostgREST/Functions path)', async () => {
    const { applyAuthHeaders } = await loadClient()

    const input = new Headers()
    input.set('apikey', TEST_KEY)
    input.set('Authorization', `Bearer ${USER_JWT}`)
    input.set('Content-Type', 'application/json')

    const headers = applyAuthHeaders(input)

    expect(headers.get('Authorization')).toBe(`Bearer ${USER_JWT}`)
    expect(headers.get('apikey')).toBe(TEST_KEY)
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('falls back to the Supabase key when no Authorization header is present', async () => {
    const { applyAuthHeaders } = await loadClient()

    const headers = applyAuthHeaders({ apikey: TEST_KEY })

    expect(headers.get('Authorization')).toBe(`Bearer ${TEST_KEY}`)
  })

  it('sends the real user token to /auth/v1/user through the app client', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: 'user-1', aud: 'authenticated', email: 'a@b.co' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )
    const { supabase } = await loadClient({ fetchImpl: fetchMock })

    const { data, error } = await supabase.auth.getUser(USER_JWT)

    expect(error).toBeNull()
    expect(data.user.id).toBe('user-1')

    const [url, init] = fetchMock.mock.calls.at(-1)
    expect(String(url)).toContain('/auth/v1/user')
    const headers = new Headers(init.headers)
    expect(headers.get('Authorization')).toBe(`Bearer ${USER_JWT}`)
    expect(headers.get('apikey')).toBe(TEST_KEY)
  })
})

describe('PKCE flow configuration', () => {
  it('uses the PKCE flow so OAuth callbacks arrive as ?code=', async () => {
    const { supabase } = await loadClient()

    expect(supabase.auth.flowType).toBe('pkce')
    expect(supabase.auth.detectSessionInUrl).toBe(true)
  })
})

describe('OAuth redirect URL', () => {
  it('builds the callback from the current origin and base path', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_SITE_URL', '')
    const { getRedirectUrl } = await import('@/stores/auth')

    expect(getRedirectUrl()).toBe(`${window.location.origin}/login`)
  })

  it('normalizes a base path without a trailing slash', async () => {
    vi.resetModules()
    vi.stubEnv('BASE_URL', '/BhumiShop')
    vi.stubEnv('VITE_SITE_URL', 'https://shop.example.org/')
    const { getRedirectUrl } = await import('@/stores/auth')

    expect(getRedirectUrl()).toBe('https://shop.example.org/BhumiShop/login')
  })
})

describe('post-login redirect target', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('round-trips a safe internal path once', async () => {
    const { stashPostLoginRedirect, consumePostLoginRedirect } = await import('@/stores/auth')

    stashPostLoginRedirect('/checkout')
    expect(consumePostLoginRedirect()).toBe('/checkout')
    expect(consumePostLoginRedirect()).toBeNull()
  })

  it.each([undefined, '', 'https://evil.example', '//evil.example', 'checkout'])(
    'rejects unsafe target %s and clears any stash',
    async (target) => {
      const { stashPostLoginRedirect, consumePostLoginRedirect } = await import('@/stores/auth')

      stashPostLoginRedirect('/perfil')
      stashPostLoginRedirect(target)

      expect(consumePostLoginRedirect()).toBeNull()
    }
  )
})

describe('404.html URL restore (SPA + OAuth hash)', () => {
  it('restores the parked URL with its hash before the app boots', async () => {
    sessionStorage.setItem('spa-redirect-path', '/login#access_token=abc&token_type=bearer')

    vi.resetModules()
    const mod = await import('@/utils/restoreSpaRedirect')

    expect(window.location.pathname).toBe('/login')
    expect(window.location.hash).toContain('access_token=abc')
    expect(sessionStorage.getItem('spa-redirect-path')).toBeNull()
    expect(mod.restoreStoredRedirect()).toBe(false)

    window.history.replaceState(null, '', '/')
  })

  it('ignores values that are not internal paths', async () => {
    sessionStorage.setItem('spa-redirect-path', 'https://evil.example')

    vi.resetModules()
    const mod = await import('@/utils/restoreSpaRedirect')

    expect(window.location.origin + window.location.pathname).toBe('http://localhost:3000/')
    expect(mod.restoreStoredRedirect()).toBe(false)
  })

  it('restores a parked PKCE callback (?code=) before the app boots', async () => {
    sessionStorage.setItem('spa-redirect-path', '/login?code=pkce-auth-code-123')

    vi.resetModules()
    const mod = await import('@/utils/restoreSpaRedirect')

    expect(window.location.pathname).toBe('/login')
    expect(window.location.search).toBe('?code=pkce-auth-code-123')
    expect(sessionStorage.getItem('spa-redirect-path')).toBeNull()
    expect(mod.restoreStoredRedirect()).toBe(false)

    window.history.replaceState(null, '', '/')
  })
})

describe('auth callback URL helpers (PKCE)', () => {
  let helpers

  beforeEach(async () => {
    helpers = await import('@/utils/authCallback')
    window.history.replaceState(null, '', '/')
  })

  describe('isAuthCallbackUrl', () => {
    it.each([
      '/login?code=pkce-auth-code-123',
      '/login#access_token=abc&token_type=bearer',
      '/login?error=access_denied&error_description=User+denied',
      '/login#error=access_denied',
      '/login?error_code=provider_email_needs_verification'
    ])('detects callback URL %s', (href) => {
      expect(helpers.isAuthCallbackUrl(href)).toBe(true)
    })

    it.each([
      '/login',
      '/login?redirect=%2Fcheckout',
      '/produtos?utm_source=google',
      '/'
    ])('rejects non-callback URL %s', (href) => {
      expect(helpers.isAuthCallbackUrl(href)).toBe(false)
    })

    it('works with absolute URLs too', () => {
      expect(helpers.isAuthCallbackUrl('https://shop.example.org/login?code=abc')).toBe(true)
    })
  })

  describe('readAuthCallbackError', () => {
    it('parses an error from the hash', () => {
      expect(helpers.readAuthCallbackError('/login#error=access_denied&error_description=User+denied'))
        .toEqual({ error: 'access_denied', description: 'User denied' })
    })

    it('parses an error from the query string', () => {
      expect(helpers.readAuthCallbackError('/login?error=access_denied&error_description=User+denied'))
        .toEqual({ error: 'access_denied', description: 'User denied' })
    })

    it('falls back to error_code when no error is given', () => {
      expect(helpers.readAuthCallbackError('/login?error_code=provider_email_needs_verification'))
        .toEqual({ error: 'unknown_error', description: 'provider_email_needs_verification' })
    })

    it('returns null for a successful PKCE callback', () => {
      expect(helpers.readAuthCallbackError('/login?code=abc')).toBeNull()
    })
  })

  describe('clearAuthCallbackUrl', () => {
    it('removes the code, error params and hash, keeping other params', () => {
      window.history.replaceState(null, '', '/login?code=abc&error=access_denied&redirect=%2Fcheckout#access_token=stale')

      helpers.clearAuthCallbackUrl()

      expect(window.location.pathname).toBe('/login')
      expect(window.location.search).toBe('?redirect=%2Fcheckout')
      expect(window.location.hash).toBe('')
    })
  })
})

describe.runIf(RUN_NETWORK)('live Supabase callback', () => {
  it('exchanges a real session and passes /auth/v1/user with the app fetch wrapper', async () => {
    const { supabase } = await loadClient({ url: LIVE_URL, key: LIVE_KEY })

    let session = null
    const anon = await supabase.auth.signInAnonymously()
    if (anon.error) {
      const signup = await supabase.auth.signUp({
        email: `oauth-e2e-${Date.now()}@example.com`,
        password: `E2e-test-${Math.random().toString(36).slice(2)}!`
      })
      if (signup.error) {
        throw new Error(
          `Could not obtain a live session: ${anon.error.message} / ${signup.error.message}`
        )
      }
      session = signup.data.session
    } else {
      session = anon.data.session
    }

    expect(session?.access_token).toBeTruthy()

    const { data, error } = await supabase.auth.getUser(session.access_token)

    expect(error).toBeNull()
    expect(data.user.id).toBeTruthy()

    await supabase.auth.signOut()
  }, 30000)
})
