const CALLBACK_PARAM_KEYS = ['code', 'error', 'error_description', 'error_code']

function parseCallbackParams(href) {
  const url = new URL(href, window.location.origin)
  const params = new URLSearchParams()
  if (url.hash && url.hash.length > 1) {
    new URLSearchParams(url.hash.slice(1)).forEach((value, key) => {
      params.set(key, value)
    })
  }
  url.searchParams.forEach((value, key) => {
    params.set(key, value)
  })
  return { url, params }
}

export function readAuthCallbackError(href = window.location.href) {
  const { params } = parseCallbackParams(href)
  if (params.get('error') || params.get('error_code')) {
    return {
      error: params.get('error') || 'unknown_error',
      description: params.get('error_description') || params.get('error_code')
    }
  }
  return null
}

export function isAuthCallbackUrl(href = window.location.href) {
  const { params } = parseCallbackParams(href)
  return Boolean(
    params.get('code') ||
    params.get('access_token') ||
    params.get('error') ||
    params.get('error_code')
  )
}

export function clearAuthCallbackUrl() {
  const url = new URL(window.location.href)
  url.hash = ''
  for (const key of CALLBACK_PARAM_KEYS) {
    url.searchParams.delete(key)
  }
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}`)
}
