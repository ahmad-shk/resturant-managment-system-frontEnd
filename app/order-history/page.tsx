"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { ShoppingBag, User, ChevronRight, Calendar, DollarSign } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { getOrdersByUserId } from "@/lib/firebase-utils"
import { useLanguage } from "@/lib/use-language"
import type { OrderData } from "@/lib/firebase-utils"
import { ref, onValue } from "firebase/database"
import { rtdb } from "@/lib/firebase"
import { Download } from "lucide-react" // Download icon ke liye
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"



export default function OrderHistoryPage() {
  const { user, deviceId } = useAuth()
  const { t } = useLanguage()
  const [firebaseOrders, setFirebaseOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const unsubscribesRef = useRef<(() => void)[]>([])
  const ordersTrackedRef = useRef<Set<string>>(new Set())
  // Component ke andar...
  const generateReceipt = (order: OrderData) => {
    const doc = new jsPDF()

    // Header: Restaurant Name
    doc.setFontSize(22)
    doc.setTextColor(234, 88, 12) // Orange color
    doc.text("TARIM RESTAURANT", 105, 20, { align: "center" })

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("Official Order Receipt", 105, 28, { align: "center" })

    // Order Info
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(`Order ID: ${order.id}`, 14, 45)
    doc.text(`Date: ${formatDate(order.createdAt)}`, 14, 52)
    doc.text(`Status: ${order.status.toUpperCase()}`, 14, 59)

    // Items Table
    const tableData = order.items.map(item => [
      item.name,
      `x${item.quantity}`,
      `€${item.price}`,
      `€${(item.quantity * item.price).toFixed(2)}`
    ])

    autoTable(doc, {
      startY: 65,
      head: [['Item', 'Qty', 'Price', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [234, 88, 12] }
    })

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.text(`Subtotal: €${order.subtotal}`, 140, finalY)
    doc.text(`Delivery: €${order.delivery}`, 140, finalY + 7)
    doc.text(`Tax: €${order.tax}`, 140, finalY + 14)

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text(`Total Amount: €${order.total}`, 140, finalY + 24)

    // Save the PDF
    doc.save(`Tarim_Order_${order.id}.pdf`)
  }




useEffect(() => {
    const fetchOrders = async () => {
      const localStorageUid = localStorage.getItem("userUID")
      if (!localStorageUid) {
        setFirebaseOrders([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const orders = await getOrdersByUserId(localStorageUid)
        
        // --- UPDATE: Newest Orders First (Sorting) ---
        const sortedOrders = orders.sort((a, b) => b.createdAt - a.createdAt)
        setFirebaseOrders(sortedOrders)

        unsubscribesRef.current.forEach((unsub) => unsub())
        unsubscribesRef.current = []
        ordersTrackedRef.current.clear()

        const newUnsubscribes: (() => void)[] = []
        sortedOrders.forEach((order) => {
          if (!ordersTrackedRef.current.has(order.id)) {
            ordersTrackedRef.current.add(order.id)
            const orderRef = ref(rtdb, `orders/${order.id}`)
            const unsubscribe = onValue(orderRef, (snapshot) => {
              if (snapshot.exists()) {
                const updatedOrder = snapshot.val()
                setFirebaseOrders((prev) => {
                  const newOrders = prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
                  // Update ke baad bhi sorting maintain rakhein
                  return [...newOrders].sort((a, b) => b.createdAt - a.createdAt)
                })
              }
            })
            newUnsubscribes.push(unsubscribe)
          }
        })
        unsubscribesRef.current = newUnsubscribes
      } catch (error) {
        console.error("Error:", error)
        setFirebaseOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
    return () => unsubscribesRef.current.forEach((unsub) => unsub())
  }, [user?.uid])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800"
      case "ready":
        return "bg-purple-100 text-purple-800"
      case "on-the-way":
        return "bg-orange-100 text-orange-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">Loading your orders...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        {/* Header with Icons */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-orange-600" />
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{t("orderHistoryTitle")}</h1>
              <p className="text-gray-600 mt-2">View all your orders in one place • Updates in real-time</p>
            </div>
          </div>
        </div>

        {/* Orders List or Empty State */}
        {firebaseOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-6">
              <ShoppingBag className="w-10 h-10 text-orange-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t("noOrders")}</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start ordering delicious food from Tarim today!</p>
            <Link
              href="/foods"
              className="inline-block px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold rounded-lg transition-all"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {firebaseOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden animate-fade-in"
              >
                <div className="p-6 sm:p-8">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    {/* Order ID */}
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">Order ID</p>
                      <p className="text-lg font-semibold text-gray-900">{order.id}</p>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">{t("orderDate")}</p>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex items-start gap-3">
                      <span className="w-5 h-5 text-green-600 -mt-0.5 flex-shrink-0 text-lg font-semibold">€</span>
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-1">{t("orderTotal")}</p>
                        <p className="text-lg font-semibold text-gray-900">€{order.total}</p>
                      </div>
                    </div>

                    {/* Status - Now with real-time indicator */}
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
  {/* Left Side: Status */}
  <div className="flex-1">
    <p className="text-sm text-gray-600 font-medium mb-2">{t("orderStatus")}</p>
    <div className="flex items-center gap-3">
      <span
        className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}
      >
        {order.status}
      </span>
      
      {/* Live Indicator (Optional) */}
      {/* {order.status !== "completed" && order.status !== "delivered" && (
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 font-bold uppercase">Live</span>
        </span>
      )} */}
    </div>
  </div>

  {/* Right Side: Download Button (Sirf completed status par) */}
  {order.status === "completed" && (
    <div className="flex items-center gap-2">
      {/* <p className="text-xs text-gray-400 font-medium hidden sm:block">Download Invoice:</p> */}
      <button
        onClick={() => generateReceipt(order)}
        className="p-3 bg-green-50 hover:bg-green-600 text-green-600 hover:text-white rounded-xl transition-all duration-300 border border-green-100 shadow-sm active:scale-95 group"
        title="Download Receipt"
      >
        <Download className="w-5 h-5 group-hover:rotate-6" />
      </button>
    </div>
  )}
</div>
                    {/* Order ID aur Download Button */}
                    

                    {/* Order Items */}
                    <div className="border-t border-gray-200 pt-6 mb-6">
                      <p className="text-sm font-semibold text-gray-600 mb-4">Items ({order.items.length})</p>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-orange-600 font-semibold text-xs">x{item.quantity}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-600">€{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Details Summary */}
                  <div className="border-t border-gray-200 pt-6 bg-gray-50 -mx-6 -mb-6 px-6 py-6 sm:px-8 sm:py-6">
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold text-gray-900">€{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-semibold text-gray-900">€{order.tax}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-semibold text-gray-900">€{order.delivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="font-bold text-orange-600 text-lg">€{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                  <Link
                    href={`/orders/${order.id}`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition-colors group"
                  >
                    {t("viewDetails")}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
