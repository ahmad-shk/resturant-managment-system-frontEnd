"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Clock, Package } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getOrderById } from "@/lib/firebase-utils"
import type { OrderData } from "@/lib/firebase-utils"
import { ref, onValue } from "firebase/database"
import { rtdb } from "@/lib/firebase"

const STATUS_STEPS = ["Confirmed", "Preparing", "Ready", "On The Way", "Delivered"]

const getStatusColor = (index: number, currentIndex: number) => {
  if (index < currentIndex) return "bg-green-500 text-white"
  if (index === currentIndex) return "bg-primary text-white animate-pulse"
  return "bg-gray-300 text-gray-600"
}

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusHistory, setStatusHistory] = useState<Array<{ status: string; timestamp: number }>>([])
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        if (id) {
          const fetchedOrder = await getOrderById(id as string)
          if (fetchedOrder) {
            setOrder(fetchedOrder)
            console.log("[v0] Order fetched:", fetchedOrder.id, "status:", fetchedOrder.status)

            const orderRef = ref(rtdb, `orders/${id}`)
            unsubscribeRef.current = onValue(
              orderRef,
              (snapshot) => {
                if (snapshot.exists()) {
                  const updatedOrder = snapshot.val()
                  console.log("[v0] Order real-time update:", updatedOrder.status)
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    ...updatedOrder,
                  }))

                  // Track status changes
                  setStatusHistory((prev) => {
                    const lastEntry = prev[prev.length - 1]
                    if (!lastEntry || lastEntry.status !== updatedOrder.status) {
                      return [...prev, { status: updatedOrder.status, timestamp: new Date().getTime() }]
                    }
                    return prev
                  })
                }
              },
              (error) => {
                console.error("[v0] Error listening to order:", error)
              },
            )
          }
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <Link href="/order-history" className="text-primary hover:underline">
            Back to Orders
          </Link>
        </div>
      </main>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Link href="/order-history" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Orders
        </Link>

        {/* Order ID and Status */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{order.id}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Ordered on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-600">Real-time Updates Active</span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
            <div className="space-y-4">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${getStatusColor(index, order.currentStatusIndex)}`}
                  >
                    {index < order.currentStatusIndex ? "✓" : index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{step}</h3>
                    {index === order.currentStatusIndex && (
                      <p className="text-sm text-primary font-medium">In Progress...</p>
                    )}
                    {index < order.currentStatusIndex && <p className="text-sm text-green-600">Completed</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Items */}
          <div className="bg-white rounded-xl p-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-gray-200 last:border-0">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">${item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${order.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>${order.tax}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>{order.delivery === 0 ? "FREE" : `$${order.delivery}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">${order.total}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-xl p-8 border border-gray-200 space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Customer Details</h3>
              <div className="space-y-2">
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                <p className="text-gray-600">{order.customerEmail}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h3>
              <p className="text-gray-900 font-medium">{order.deliveryAddress}</p>
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Payment Method</h3>
              <p className="text-gray-900 font-medium capitalize">{order.paymentMethod}</p>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${order.subtotal}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${order.tax}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium">{order.delivery === 0 ? "FREE" : `$${order.delivery}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Total Amount</span>
                  <span className="font-bold text-primary text-lg">${order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
