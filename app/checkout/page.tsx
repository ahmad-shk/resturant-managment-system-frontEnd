"use client"

import type React from "react"

import { ArrowLeft, MapPin, CreditCard, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/providers"
import { useToast } from "@/components/toast-provider"
import { useAuth } from "@/lib/auth-context"
import { saveOrderToFirebase } from "@/lib/firebase-utils"
import type { OrderData } from "@/lib/firebase-utils"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { addToast } = useToast()
  const { user, deviceId, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && !user) {
      addToast("Please login to place an order", "error")
      router.push("/auth/login")
    }
  }, [isAuthenticated, user, router, addToast])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCVV: "",
  })

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showCVV, setShowCVV] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = Math.round(subtotal * 0.05)
  const delivery = subtotal > 30 ? 0 : 10
  const total = subtotal + tax + delivery

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.address) {
      addToast("Please fill in all delivery details", "error")
      return
    }

    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCVV) {
        addToast("Please fill in all card details", "error")
        return
      }
      if (formData.cardNumber.replace(/\s/g, "").length !== 16) {
        addToast("Card number must be 16 digits", "error")
        return
      }
      if (formData.cardCVV.length !== 3) {
        addToast("CVV must be 3 digits", "error")
        return
      }
    }

    setIsLoading(true)

    setTimeout(async () => {
      const newOrderId = `ORD-${Math.floor(Math.random() * 1000000)}`
      setOrderId(newOrderId)

      const orderData: OrderData = {
        id: newOrderId,
        items: items,
        subtotal: subtotal,
        tax: tax,
        delivery: delivery,
        total: total,
        customerName: formData.name,
        customerEmail: formData.email,
        deliveryAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        orderDate: new Date().getTime(),
        status: "confirmed",
        currentStatusIndex: 0,
        createdAt: new Date().getTime(),
        userId: user?.uid || "",
        deviceId: deviceId || "",
      }

      try {
        await saveOrderToFirebase(orderData)

        setOrderPlaced(true)
        addToast("Payment successful! Order placed.", "success")
        clearCart()

        setTimeout(() => {
          router.push(`/track-order?orderId=${newOrderId}`)
        }, 2000)
      } catch (error) {
        console.error("Error saving order:", error)
        addToast("Failed to save order. Please try again.", "error")
        setIsLoading(false)
      }
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatCardNumber = (value: string) => {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "€1 ")
      .trim()
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`
    }
    return cleaned
  }

  if (orderPlaced) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-xl space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Payment successful. Your order is being prepared.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <p className="text-sm text-gray-600">Order Number</p>
              <p className="text-2xl font-bold text-green-600">{orderId}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Redirecting to Order Tracking...</p>
              <div className="flex justify-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background py-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="font-medium text-gray-700">Processing Payment...</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <Link href="/cart" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition">
          <ArrowLeft className="w-5 h-5" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Delivery Address
              </h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { id: "card", label: "Credit/Debit Card", demo: true },
                  { id: "upi", label: "UPI (Demo)" },
                  { id: "wallet", label: "Digital Wallet (Demo)" },
                  { id: "cod", label: "Cash on Delivery" },
                ].map((method) => (
                  <label
                    key={method.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition"
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={formData.paymentMethod === method.id}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="font-medium">{method.label}</span>
                    {method.demo && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-auto">
                        Interactive Demo
                      </span>
                    )}
                  </label>
                ))}
              </div>

              {formData.paymentMethod === "card" && (
                <div className="mt-6 pt-6 border-t border-border space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Demo Card:</strong> Use any 16-digit number (e.g., 1234567890123456)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))
                        setFormData((prev) => ({ ...prev, cardNumber: formatted }))
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value)
                          setFormData((prev) => ({ ...prev, cardExpiry: formatted }))
                        }}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <div className="relative">
                        <input
                          type={showCVV ? "text" : "password"}
                          name="cardCVV"
                          value={formData.cardCVV}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              cardCVV: e.target.value.replace(/\D/g, "").slice(0, 3),
                            }))
                          }}
                          placeholder="123"
                          maxLength="3"
                          className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCVV(!showCVV)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                          {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-card rounded-xl p-6 border border-border sticky top-4 space-y-6">
              <h2 className="text-xl font-semibold">Order Summary</h2>

              <div className="space-y-3 pb-4 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">€{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">€{tax}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-medium">{delivery === 0 ? "FREE" : `€${delivery}`}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">€{total}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
