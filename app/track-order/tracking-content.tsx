"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Truck, Home, ChefHat } from "lucide-react"
import Link from "next/link"
import { getOrderById } from "@/lib/firebase-utils"
import { ref, onValue } from "firebase/database"
import { rtdb } from "@/lib/firebase"

interface OrderStatus {
  stage: number
  title: string
  description: string
  icon: React.ReactNode
  time: string
  completed: boolean
  active: boolean
}

export default function TrackingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId") || "ORD-000000"
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentStage, setCurrentStage] = useState(0)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const fetchAndListenToOrder = async () => {
      try {
        const firebaseOrder = await getOrderById(orderId)
        if (firebaseOrder) {
          setOrder(firebaseOrder)
          setCurrentStage(firebaseOrder.currentStatusIndex || 0)

          // Only update status when database changes, not on automatic timer
          const orderRef = ref(rtdb, `orders/${orderId}`)
          unsubscribeRef.current = onValue(orderRef, (snapshot) => {
            if (snapshot.exists()) {
              const updatedOrder = snapshot.val()
              setOrder(updatedOrder)
              setCurrentStage(updatedOrder.currentStatusIndex || 0)
            }
          })
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAndListenToOrder()

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [orderId])

  const stages: OrderStatus[] = [
    {
      stage: 0,
      title: "Order Confirmed",
      description: "Your order has been placed successfully",
      icon: <ChefHat className="w-6 h-6" />,
      time: "00:00",
      completed: currentStage > 0,
      active: currentStage === 0,
    },
    {
      stage: 1,
      title: "Preparing Food",
      description: "Our chef is preparing your delicious meal",
      icon: <ChefHat className="w-6 h-6" />,
      time: "00:20",
      completed: currentStage > 1,
      active: currentStage === 1,
    },
    {
      stage: 2,
      title: "Ready for Pickup",
      description: "Your order is ready and rider is picking it up",
      icon: <Truck className="w-6 h-6" />,
      time: "00:45",
      completed: currentStage > 2,
      active: currentStage === 2,
    },
    {
      stage: 3,
      title: "On The Way",
      description: "Your order is on the way to your location",
      icon: <Truck className="w-6 h-6" />,
      time: "01:30",
      completed: currentStage > 3,
      active: currentStage === 3,
    },
    {
      stage: 4,
      title: "Arrived",
      description: "Your order has reached your location",
      icon: <Home className="w-6 h-6" />,
      time: "02:00",
      completed: currentStage > 4,
      active: currentStage === 4,
    },
  ]

  const isOrderComplete = currentStage >= 4

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading order tracking...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link href="/foods" className="text-primary hover:underline font-semibold">
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600 mb-4">
            Order ID: <span className="font-mono font-bold text-primary">{orderId}</span>
          </p>
          <div className="inline-block bg-white rounded-lg px-6 py-3 border-2 border-primary shadow-lg">
            <p className="text-lg font-bold text-primary">
              {isOrderComplete ? "Order Delivered! 🎉" : "Status updates in real-time"}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6 mb-12">
          {stages.map((stage, index) => (
            <div key={stage.stage} className="relative">
              {index < stages.length - 1 && (
                <div
                  className={`absolute left-8 top-20 w-1 h-20 transition-all duration-500 ${
                    stage.completed ? "bg-green-500" : stage.active ? "bg-blue-400" : "bg-gray-300"
                  }`}
                />
              )}

              {/* Stage Card */}
              <div
                className={`relative p-6 rounded-xl transition-all duration-500 border-2 ${
                  stage.completed
                    ? "bg-green-50 border-green-300 shadow-md"
                    : stage.active
                      ? "bg-blue-50 border-blue-400 shadow-lg ring-2 ring-blue-200"
                      : "bg-white border-gray-200"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon Circle */}
                  <div
                    className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 ${
                      stage.completed
                        ? "bg-green-500 text-white"
                        : stage.active
                          ? "bg-blue-500 text-white animate-pulse"
                          : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {stage.completed ? "✓" : stage.active ? "..." : index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{stage.title}</h3>
                      {stage.active && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                      {stage.completed && (
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                    
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isOrderComplete && (
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-8 text-white text-center shadow-xl mb-8">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Order Delivered!</h2>
            <p className="text-green-50 mb-6">Your food has been delivered to your doorstep. Enjoy your meal!</p>
            <div className="inline-block bg-white bg-opacity-20 backdrop-blur rounded-lg px-6 py-3 border border-white border-opacity-30">
              <p className="text-lg font-semibold">Thank you for ordering with Swirly! 🙏</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/foods">
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition">
              Order Again
            </button>
          </Link>
          <Link href="/order-history">
            <button className="px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:opacity-90 transition">
              My Orders
            </button>
          </Link>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  )
}
