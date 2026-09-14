import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const signup = async ({ name, email, password, role, mess }) => {
    await api.post('/auth/signup', { name, email, password, role, mess })
    await login(email, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const deleteAccount = async () => {
    await api.delete('/auth/me')
    logout()
  }

  return (
    <AuthCtx.Provider value={{ user, setUser, login, signup, logout, deleteAccount }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}

export function Protected({ roles, children }) {
  const { user } = useAuth()
  if (!user) return <div className="text-center">Please login.</div>
  if (roles && !roles.includes(user.role)) return <div className="text-center">Access denied.</div>
  return children
}


