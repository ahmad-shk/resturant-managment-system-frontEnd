"use client"

import type React from "react"

import { useContext } from "react"
import { LanguageContext } from "@/components/language-provider"
import type { Language, TranslationKey } from "./translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

export function useLanguage() {
  const context = useContext(LanguageContext as React.Context<LanguageContextType | undefined>)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
