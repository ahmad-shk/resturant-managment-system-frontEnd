"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, MapPin, Clock, Package, Check } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { getOrderById } from "@/lib/firebase-utils"
import type { OrderData } from "@/lib/firebase-utils"
import { ref, onValue } from "firebase/database"
import { rtdb } from "@/lib/firebase"

// Status steps array (UI display ke liye)
const STATUS_STEPS = ["Confirmed", "Preparing", "Ready", "On The Way", "Completed"]

export default function OrderDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const fetchOrderAndListen = async () => {
      try {
        if (!id) return

        // Initial fetch
        const fetchedOrder = await getOrderById(id as string)
        if (fetchedOrder) {
          setOrder(fetchedOrder)

          // Real-time listener for status updates
          const orderRef = ref(rtdb, `orders/${id}`)
          unsubscribeRef.current = onValue(
            orderRef,
            (snapshot) => {
              if (snapshot.exists()) {
                const updatedOrder = snapshot.val()
                setOrder((prevOrder) => ({
                  ...prevOrder,
                  ...updatedOrder,
                }))
              }
            },
            (error) => console.error("Firebase Error:", error)
          )
        }
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderAndListen()
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current()
    }
  }, [id])

  // --- LOGIC: Status Normalization (Hyphen handling) ---
  // Backend status "on-the-way" ko "on the way" mein convert karta hai
  const currentStatusString = (order?.status || "").toLowerCase().replace(/-/g, " ")
  
  const dynamicStatusIndex = STATUS_STEPS.findIndex(
    (step) => step.toLowerCase() === currentStatusString
  )

  // Pure logic for colors
  const getStatusColor = (index: number, currentIndex: number) => {
    // Agar order status 'Completed' hai (index 4) ya current step guzar chuka hai
    if (currentIndex === 4 || index < currentIndex) {
      return "bg-green-500 text-white"
    }
    // Agar ye current active step hai
    if (index === currentIndex) {
      return "bg-primary text-white animate-pulse ring-4 ring-primary/20"
    }
    return "bg-gray-200 text-gray-500"
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/order-history" className="text-primary hover:underline font-semibold">Back to Orders</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Navigation */}
        <Link href="/order-history" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition font-medium">
          <ArrowLeft className="w-5 h-5" /> Back to My Orders
        </Link>

        {/* Order Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-gray-100">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Order Details</p>
              <h1 className="text-4xl font-black text-gray-900">{order.id}</h1>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
              <Clock className="w-5 h-5 text-gray-400" />
              <div className="text-sm font-semibold text-gray-700">
                {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Live Tracking
            </h2>
            
            <div className="relative space-y-8">
              {STATUS_STEPS.map((step, index) => {
                const isDone = index < dynamicStatusIndex || dynamicStatusIndex === 4;
                const isActive = index === dynamicStatusIndex && dynamicStatusIndex !== 4;

                return (
                  <div key={step} className="flex items-start gap-6 relative">
                    {/* Progress Line */}
                    {index !== STATUS_STEPS.length - 1 && (
                      <div className={`absolute left-6 top-14 w-[2px] h-10 ${isDone ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                    
                    {/* Circle Icon */}
                    <div className={`w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-lg z-10 transition-all duration-500 ${getStatusColor(index, dynamicStatusIndex)}`}>
                      {isDone ? <Check className="w-6 h-6" /> : index + 1}
                    </div>

                    <div className="pt-2">
                      <h3 className={`font-bold text-lg leading-tight ${isActive ? 'text-primary' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                        {step}
                      </h3>
                      {isActive && <p className="text-sm text-primary font-medium mt-1 animate-pulse">Our team is on this...</p>}
                      {isDone && <p className="text-sm text-green-600 font-medium mt-1">Completed</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Items Summary */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Order Items
            </h2>
            <div className="space-y-5">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center font-black text-xl">
              <span className="text-gray-900">Total Paid</span>
              <span className="text-primary">${order.total}</span>
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm space-y-8">
            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Details</h2>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-900">{order.customerName}</p>
                <p className="text-sm text-gray-500">{order.customerEmail}</p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h2>
              <p className="text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {order.deliveryAddress}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Payment Method</h2>
              <div className="inline-block bg-primary text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                {order.paymentMethod}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}