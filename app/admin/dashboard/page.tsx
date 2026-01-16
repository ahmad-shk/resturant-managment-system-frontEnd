"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { rtdb } from "@/lib/firebase"
import { updateOrderStatusRealtime } from "@/lib/firebase-utils"
import type { OrderData } from "@/lib/firebase-utils"
import { ArrowLeft, Zap } from "lucide-react"
import Link from "next/link"
import { ref, onValue } from "firebase/database"

const STATUS_STEPS = ["Confirmed", "Preparing", "Ready", "On The Way", "Delivered"]
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-yellow-100 text-yellow-800",
  ready: "bg-purple-100 text-purple-800",
  "on-the-way": "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = ref(rtdb, "orders")
        unsubscribeRef.current = onValue(
          ordersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const allOrders = snapshot.val()
              const ordersArray = Object.entries(allOrders).map(([id, data]: [string, any]) => ({
                ...data,
                id,
              })) as OrderData[]

              setOrders(ordersArray.sort((a, b) => b.createdAt - a.createdAt))
              console.log("[v0] Real-time update received, total orders:", ordersArray.length)
            } else {
              setOrders([])
            }
            setLoading(false)
          },
          (error) => {
            console.error("[v0] Error listening to orders:", error)
            setLoading(false)
          },
        )
      } catch (error) {
        console.error("Error fetching orders:", error)
        setLoading(false)
      }
    }

    fetchOrders()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  const handleStatusUpdate = async (orderId: string, newStatusIndex: number) => {
    setUpdating(orderId)
    try {
      const newStatus = STATUS_STEPS[newStatusIndex].toLowerCase().replace(/\s+/g, "-")
      await updateOrderStatusRealtime(orderId, newStatusIndex, newStatus, {
        updatedBy: "admin",
        updateTime: new Date().getTime(),
      })

      console.log(
        "[v0] Status update sent for order:",
        orderId,
        "New status:",
        newStatus,
        "Status index:",
        newStatusIndex,
      )
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update order status")
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  const stats = {
    total: orders.length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    onWay: orders.filter((o) => o.status === "on-the-way").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading orders...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-orange-600 hover:text-orange-700 transition">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Tarim Dashboard</h1>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Zap className="w-4 h-4 text-green-600" />
              Manage and update order statuses in real-time
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Orders", value: stats.total, icon: "📦", color: "blue" },
            { label: "Preparing", value: stats.preparing, icon: "👨‍🍳", color: "yellow" },
            { label: "On The Way", value: stats.onWay, icon: "🚗", color: "orange" },
            { label: "Delivered", value: stats.delivered, icon: "✅", color: "green" },
            { label: "Total Revenue", value: `€${stats.totalRevenue.toFixed(2)}`, icon: "💰", color: "purple" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm font-medium mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["all", "confirmed", "preparing", "ready", "on-the-way", "delivered"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? "bg-orange-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 font-medium">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors animate-fade-in">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{order.customerName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">€{order.total}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${STATUS_COLORS[order.status]}`}
                        >
                          {STATUS_STEPS[order.currentStatusIndex]}
                          {order.status !== "delivered" && (
                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-y-2">
                        {order.currentStatusIndex < STATUS_STEPS.length - 1 && (
                          <button
                            onClick={() => handleStatusUpdate(order.id, order.currentStatusIndex + 1)}
                            disabled={updating === order.id}
                            className="block w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updating === order.id
                              ? "Updating..."
                              : `Mark ${STATUS_STEPS[order.currentStatusIndex + 1]}`}
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <button
                            disabled
                            className="block w-full px-3 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg"
                          >
                            Completed
                          </button>
                        )}
                        <Link
                          href={`/orders/${order.id}`}
                          className="block w-full px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors text-center"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
