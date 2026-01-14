"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X, Sparkles, User, Globe, ChevronDown, LogOut, Mail } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/app/providers"
import { useLanguage } from "@/lib/use-language"
import { useAuth } from "@/lib/auth-context"
import type { Language } from "@/lib/translations"
import { auth } from "@/lib/firebase" 
import { signOut as firebaseSignOut } from "firebase/auth"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated, signOut } = useAuth()

  const languages: { code: Language; name: string }[] = [
    { code: "en", name: "English" },
    { code: "zh", name: "中文" },
    { code: "de", name: "Deutsch" },
    { code: "nl", name: "Nederlands" },
  ]

 const handleLogout = async () => {
  try {
    // 1. Firebase se logout
    await firebaseSignOut(auth)

    // 2. Local Storage se UID khatam
    localStorage.removeItem("user_id")
    localStorage.removeItem("userUID") // Dono check karlein jo aap use kar rahe hain

    // 3. UI States reset
    setIsUserMenuOpen(false)
    setIsOpen(false)

    console.log("Logged out and local data cleared")
    
    // Refresh ya Redirect (Optional)
    window.location.href = "/auth/login" 
  } catch (error) {
    console.error("Error logging out:", error)
  }
}
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-orange-50 to-white border-b-2 border-orange-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent hidden sm:block">
              Admin
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8">
            <Link
              href="/foods"
              className="text-gray-700 font-medium hover:text-orange-600 transition-colors duration-200 relative group"
            >
              {t("menu")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/orders"
              className="text-gray-700 font-medium hover:text-orange-600 transition-colors duration-200 relative group"
            >
              {t("orders")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 font-medium hover:text-orange-600 transition-colors duration-200 relative group"
            >
              {t("contactUs")}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-full transition-all duration-300" />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="font-medium">{language.toUpperCase()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageOpen ? "rotate-180" : ""}`} />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-orange-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code)
                        setIsLanguageOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 transition-colors ${
                        language === lang.code
                          ? "bg-orange-100 text-orange-700 font-semibold"
                          : "text-gray-700 hover:bg-orange-50"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative group">
              <div className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors">
                <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-orange-600 transition-colors" />
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu - Added user profile dropdown with email and logout */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <User className="w-6 h-6 text-gray-700 hover:text-orange-600 transition-colors" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-orange-200 z-50 animate-in fade-in slide-in-from-top-2">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Info Section */}
                      <div className="px-4 py-4 border-b border-orange-200 bg-gradient-to-r from-orange-50 to-white">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.displayName || "User"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/order-history"
                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors border-b border-orange-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t("orderHistory")}
                      </Link>

                      {/* Logout Button */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Not Logged In */}
                      <Link
                        href="/auth/login"
                        className="block px-4 py-3 text-gray-700 hover:bg-orange-50 transition-colors border-b border-orange-100 font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="block px-4 py-3 text-orange-600 hover:bg-orange-50 transition-colors font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-orange-100 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t-2 border-orange-200 pt-4 animate-in fade-in slide-in-from-top-2">
            <Link
              href="/foods"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t("menu")}
            </Link>
            <Link
              href="/orders"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t("orders")}
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t("contactUs")}
            </Link>
            <Link
              href="/order-history"
              className="block px-4 py-2 text-gray-700 hover:bg-orange-100 hover:text-orange-700 rounded-lg transition-colors font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t("orderHistory")}
            </Link>

            {/* Mobile Language Selector */}
            <div className="px-4 py-2 border-t border-orange-200 mt-2">
              <p className="text-sm font-semibold text-gray-600 mb-2">{t("language")}</p>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code)
                      setIsOpen(false)
                    }}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      language === lang.code
                        ? "bg-orange-600 text-white"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    {lang.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile User Section */}
            {isAuthenticated && user ? (
              <div className="px-4 py-3 border-t border-orange-200 mt-2">
                <p className="text-sm font-semibold text-gray-700 mb-2">{user.displayName || "User Account"}</p>
                <p className="text-xs text-gray-600 mb-3 truncate">{user.email}</p>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4 py-3 border-t border-orange-200 mt-2 space-y-2">
                <Link
                  href="/auth/login"
                  className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg text-center transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-2 rounded-lg text-center transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
