"use client"

import { Clock, CheckCircle, Truck, Package } from "lucide-react"
import Link from "next/link"
import { useOrders } from "@/app/providers"

const getStatusColor = (statusIndex: number) => {
  switch (statusIndex) {
    case 0:
      return "bg-blue-100 text-blue-700"
    case 1:
      return "bg-orange-100 text-orange-700"
    case 2:
      return "bg-yellow-100 text-yellow-700"
    case 3:
      return "bg-purple-100 text-purple-700"
    case 4:
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

const getStatusText = (statusIndex: number) => {
  switch (statusIndex) {
    case 0:
      return "Confirmed"
    case 1:
      return "Preparing"
    case 2:
      return "Ready"
    case 3:
      return "On The Way"
    case 4:
      return "Delivered"
    default:
      return "Unknown"
  }
}

const getStatusIcon = (statusIndex: number) => {
  switch (statusIndex) {
    case 0:
      return <CheckCircle className="w-5 h-5" />
    case 1:
      return <Package className="w-5 h-5" />
    case 2:
      return <CheckCircle className="w-5 h-5" />
    case 3:
      return <Truck className="w-5 h-5" />
    case 4:
      return <CheckCircle className="w-5 h-5" />
    default:
      return <Clock className="w-5 h-5" />
  }
}

export default function OrdersPage() {
  const { orders } = useOrders()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">No Orders Yet</h1>
          <p className="text-gray-600">Start ordering delicious food from our menu!</p>
          <Link
            href="/foods"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:opacity-90 transition"
          >
            Browse Menu
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-primary transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.currentStatusIndex)}`}
                >
                  {getStatusIcon(order.currentStatusIndex)}
                  <span>{getStatusText(order.currentStatusIndex)}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Items</p>
                  <p className="text-lg font-semibold text-gray-900">{order.items.length} items</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="text-lg font-bold text-primary">₹{order.total}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Delivery</p>
                  <p className="text-lg font-semibold text-gray-900">{order.deliveryAddress.split(",")[0]}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button className="px-4 py-2 text-primary font-medium hover:bg-orange-50 rounded-lg transition">
                  View Details
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
