"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus } from "lucide-react"
import { registerUser, checkUserExists } from "@/lib/firebase-utils"
import { useToast } from "@/components/toast-provider"

export default function SignupPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      addToast("Please fill in all fields", "error")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      addToast("Passwords do not match", "error")
      return
    }

    if (formData.password.length < 6) {
      addToast("Password must be at least 6 characters", "error")
      return
    }

    setLoading(true)
    try {
      const userExists = await checkUserExists(formData.email)
      if (userExists) {
        addToast("An account with this email already exists. Please login instead.", "error")
        setLoading(false)
        return
      }

      await registerUser(formData.email, formData.password, formData.name)
      addToast("Account created successfully!", "success")
      router.push("/foods")
    } catch (error: any) {
      console.error("Signup error:", error)
      const errorMessage = error.message || "Failed to create account"
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
            <UserPlus className="w-6 h-6 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Sign Up</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-orange-600 hover:text-orange-700 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
