"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  deviceId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    // Generate or retrieve device ID
    const storedDeviceId = localStorage.getItem("deviceId")
    if (storedDeviceId) {
      setDeviceId(storedDeviceId)
    } else {
      const newDeviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("deviceId", newDeviceId)
      setDeviceId(newDeviceId)
    }

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
    deviceId,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
