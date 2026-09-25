const SPA_REDIRECT_KEY = 'spa-redirect-path'

export function restoreStoredRedirect() {
  try {
    const stored = sessionStorage.getItem(SPA_REDIRECT_KEY)
    if (!stored) return false
    sessionStorage.removeItem(SPA_REDIRECT_KEY)
    if (!stored.startsWith('/')) return false
    window.history.replaceState(window.history.state, '', stored)
    return true
  } catch {
    return false
  }
}

restoreStoredRedirect()
