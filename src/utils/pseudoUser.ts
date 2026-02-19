const PSEUDO_USER_KEY = 'pseudoUser'

/** Value stored when admin selects "Todos" - API should return data for all vendors */
export const PSEUDO_USER_ALL = '__ALL__'

export const getPseudoUser = (): string | null => {
  if (typeof window === 'undefined') return null
  const stored = sessionStorage.getItem(PSEUDO_USER_KEY)
  return stored || null
}

export const setPseudoUser = (username: string | null): void => {
  if (typeof window === 'undefined') return
  if (username) {
    sessionStorage.setItem(PSEUDO_USER_KEY, username)
  } else {
    sessionStorage.removeItem(PSEUDO_USER_KEY)
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
