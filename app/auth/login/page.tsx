"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, LogIn } from "lucide-react"
import { loginUser } from "@/lib/firebase-utils"
import { useToast } from "@/components/toast-provider"

export default function LoginPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.password) {
      addToast("Please fill in all fields", "error")
      return
    }

    setLoading(true)
    try {
      const userCredential = await loginUser(formData.email, formData.password)

      // 2. Data ko console karwayein
      console.log("--- Login Success Data ---")
      console.log("User Object:", userCredential.user)
      console.log("User UID:", userCredential.user.uid)
      console.log("User Email:", userCredential.user.email)
      localStorage.setItem("userUID", userCredential.user.uid)
      addToast("Login successful!", "success")
      router.push("/foods")
    } catch (error: any) {
      console.error("Login error:", error)
      const errorMessage = error.message || "Failed to login"
      addToast(errorMessage, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <div className="flex items-center justify-center gap-2 mb-6">
            <LogIn className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
