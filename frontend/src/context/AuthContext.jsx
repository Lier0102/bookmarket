import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, signup as signupRequest } from '../api/auth'
import { getMe } from '../api/members'
import { clearSession, getAccessToken, setSession } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      if (!getAccessToken()) {
        setInitializing(false)
        return
      }
      try {
        const profile = await getMe()
        if (!cancelled) setUser(profile)
      } catch {
        clearSession()
      } finally {
        if (!cancelled) setInitializing(false)
      }
    }
    hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const token = await loginRequest({ username, password })
    setSession(token)
    const profile = await getMe()
    setUser(profile)
    return profile
  }, [])

  const signup = useCallback(async (payload) => {
    await signupRequest(payload)
    return login(payload.memberId, payload.password)
  }, [login])

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    const profile = await getMe()
    setUser(profile)
    return profile
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      initializing,
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [user, initializing, login, signup, logout, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook co-located with its provider by convention
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
