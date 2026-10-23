import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthContext, { AUTH_STATUS } from './AuthContext'
import * as authApi from '../api/auth'
import { createCustomer } from '../api/customers'
import { refreshAccessToken, setAccessToken, setSessionExpiredHandler } from '../api/client'
import { ADMIN_ROLE_NAME } from '../constants/permissions'

export default function AuthProvider({ children }) {
  const [status, setStatus] = useState(AUTH_STATUS.LOADING)
  const [session, setSession] = useState(null)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setSession(null)
    setStatus(AUTH_STATUS.ANONYMOUS)
  }, [])

  const loadSession = useCallback(async () => {
    const data = await authApi.me()
    setSession(data)
    setStatus(AUTH_STATUS.AUTHENTICATED)
    return data
  }, [])

  useEffect(() => {
    let cancelled = false
    setSessionExpiredHandler(clearSession)

    refreshAccessToken()
      .then(() => (cancelled ? null : loadSession()))
      .catch(() => {
        if (!cancelled) clearSession()
      })

    return () => {
      cancelled = true
      setSessionExpiredHandler(null)
    }
  }, [clearSession, loadSession])

  const login = useCallback(
    async (credentials) => {
      const token = await authApi.signin(credentials)
      setAccessToken(token)
      try {
        return await loadSession()
      } catch (error) {
        setAccessToken(null)
        throw error
      }
    },
    [loadSession],
  )

  const logout = useCallback(async () => {
    await authApi.signout().catch(() => {})
    clearSession()
  }, [clearSession])

  const completeProfile = useCallback(
    async (data) => {
      const { customer, accessToken } = await createCustomer(data)
      setAccessToken(accessToken)
      await loadSession()
      return customer
    },
    [loadSession],
  )

  const hasPermission = useCallback(
    (permission) => {
      if (!session) return false
      if (session.user.roleName === ADMIN_ROLE_NAME) return true
      return session.permissions.includes(permission)
    },
    [session],
  )

  const hasAnyPermission = useCallback(
    (permissions) => permissions.some((permission) => hasPermission(permission)),
    [hasPermission],
  )

  const value = useMemo(
    () => ({
      status,
      isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
      user: session?.user ?? null,
      customer: session?.customer ?? null,
      employee: session?.employee ?? null,
      permissions: session?.permissions ?? [],
      login,
      logout,
      completeProfile,
      reloadSession: loadSession,
      hasPermission,
      hasAnyPermission,
    }),
    [status, session, login, logout, completeProfile, loadSession, hasPermission, hasAnyPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
