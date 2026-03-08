const PSEUDO_USER_KEY = 'pseudoUser'
const PSEUDO_USER_ID_KEY = 'pseudoUserId'

/** Value stored when admin selects "Todos" - API should return data for all vendors */
export const PSEUDO_USER_ALL = '__ALL__'

export const getPseudoUser = (): string | null => {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem(PSEUDO_USER_KEY)
  return stored || null
}

export const getPseudoUserId = (): number | null => {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem(PSEUDO_USER_ID_KEY)
  if (!stored) return null
  const n = parseInt(stored, 10)
  return isNaN(n) ? null : n
}

export const setPseudoUser = (username: string | null, userId?: number | null): void => {
  if (typeof window === 'undefined') return
  if (username) {
    sessionStorage.setItem(PSEUDO_USER_KEY, username)
    if (userId != null) {
      sessionStorage.setItem(PSEUDO_USER_ID_KEY, String(userId))
    } else {
      sessionStorage.removeItem(PSEUDO_USER_ID_KEY)
    }
  } else {
    sessionStorage.removeItem(PSEUDO_USER_KEY)
    sessionStorage.removeItem(PSEUDO_USER_ID_KEY)
  }
  window.dispatchEvent(new CustomEvent('pseudoUserChange'))
}

export const getEffectiveUser = (
  sessionUser: { name?: string | null; pemission?: string } | null
): string => {
  if (!sessionUser?.name) return ''
  const isAdmin = sessionUser.pemission === 'Adm'
  if (!isAdmin) return sessionUser.name
  const pseudo = getPseudoUser()
  if (pseudo === PSEUDO_USER_ALL) return ''
  return pseudo || sessionUser.name
}
