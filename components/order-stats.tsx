"use client"

import { useEffect, useState } from "react"
import { OrderService } from "@/lib/order-service"

interface OrderStatsProps {
  userId: string
}

export default function OrderStats({ userId }: OrderStatsProps) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    statusCounts: {} as Record<string, number>,
    loading: true,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const analytics = await OrderService.getAnalytics(userId)
        setStats({
          ...analytics,
          loading: false,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
        setStats((prev) => ({ ...prev, loading: false }))
      }
    }

    loadStats()
  }, [userId])

  if (stats.loading) {
    return <div className="p-4 text-center text-gray-600">Loading statistics...</div>
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-2">Total Orders</p>
        <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
      </div>
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-2">Total Spent</p>
        <p className="text-3xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
      </div>
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <p className="text-gray-600 text-sm font-medium mb-2">Average Order</p>
        <p className="text-3xl font-bold text-gray-900">${stats.averageOrderValue.toFixed(2)}</p>
      </div>
    </div>
  )
}
