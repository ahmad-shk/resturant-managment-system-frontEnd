"use client"

import { Suspense } from "react"
import TrackingContent from "./tracking-content"

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TrackingContent />
    </Suspense>
  )
}

function LoadingFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-semibold">Loading order tracking...</p>
      </div>
    </main>
  )
}
