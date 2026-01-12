"use client"

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="space-y-4 text-center">
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200" />
        </div>
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
