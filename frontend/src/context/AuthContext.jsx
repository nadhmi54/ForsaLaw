import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { fetchCurrentUser } from '../api/client.js'

const STORAGE_KEY = 'forsalaw.auth'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, user: null }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.token === 'string' && parsed.user && typeof parsed.user.email === 'string') {
      return { token: parsed.token, user: parsed.user }
    }
    return { token: null, user: null }
  } catch {
    return { token: null, user: null }
  }
}

function mapAuthResponse(data) {
  return {
    id: data.id,
    email: data.email,
    nom: data.nom,
    prenom: data.prenom,
    roleUser: data.roleUser,
  }
}

function mapUserDto(dto) {
  return {
    id: dto.id,
    email: dto.email,
    nom: dto.nom,
    prenom: dto.prenom,
    roleUser: dto.roleUser,
    actif: dto.actif,
    profilePhotoUrl: dto.profilePhotoUrl,
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [{ token, user }, setSession] = useState(loadStored)

  const persist = useCallback((next) => {
    setSession(next)
    if (next.token && next.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setFromAuthResponse = useCallback(
    (data) => {
      persist({ token: data.token, user: mapAuthResponse(data) })
    },
    [persist],
  )

  const login = useCallback(
    async (body) => {
      const data = await authApi.login(body)
      setFromAuthResponse(data)
      return data
    },
    [setFromAuthResponse],
  )

  const register = useCallback(
    async (body) => {
      const data = await authApi.register(body)
      setFromAuthResponse(data)
      return data
    },
    [setFromAuthResponse],
  )

  const logout = useCallback(() => {
    persist({ token: null, user: null })
  }, [persist])

  const completeOAuthLogin = useCallback(
    async (oauthToken) => {
      const me = await fetchCurrentUser(oauthToken)
      persist({ token: oauthToken, user: mapUserDto(me) })
    },
    [persist],
  )

  const refreshUser = useCallback(async () => {
    if (!token) return null
    const me = await fetchCurrentUser(token)
    const nextUser = mapUserDto(me)
    persist({ token, user: nextUser })
    return nextUser
  }, [token, persist])

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      completeOAuthLogin,
      refreshUser,
    }),
    [token, user, login, register, logout, completeOAuthLogin, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
