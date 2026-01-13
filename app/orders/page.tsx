"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OrdersPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/order-history")
  }, [router])

  return null
}
