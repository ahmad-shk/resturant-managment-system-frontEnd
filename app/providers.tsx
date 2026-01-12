"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { ToastProvider } from "@/components/toast-provider"
import { LanguageProvider } from "@/components/language-provider"

export interface CartItem {
  id: number
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === newItem.id)
      if (existingItem) {
        return prevItems.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prevItems, { ...newItem, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}

interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  delivery: number
  total: number
  customerName: string
  customerEmail: string
  deliveryAddress: string
  paymentMethod: string
  orderDate: number
  status: "confirmed" | "preparing" | "ready" | "on-the-way" | "delivered"
  currentStatusIndex: number
  createdAt: number
}

interface OrderContextType {
  orders: Order[]
  addOrder: (order: Order) => void
  getOrderById: (id: string) => Order | undefined
  updateOrderStatus: (id: string, statusIndex: number) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("orders")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const addOrder = (order: Order) => {
    const newOrders = [...orders, order]
    setOrders(newOrders)
    if (typeof window !== "undefined") {
      localStorage.setItem("orders", JSON.stringify(newOrders))
    }
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  const updateOrderStatus = useCallback((id: string, statusIndex: number) => {
    setOrders((currentOrders) => {
      const updatedOrders = currentOrders.map((order) =>
        order.id === id ? { ...order, currentStatusIndex: statusIndex } : order,
      )
      if (typeof window !== "undefined") {
        localStorage.setItem("orders", JSON.stringify(updatedOrders))
      }
      return updatedOrders
    })
  }, [])

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderById, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error("useOrders must be used within OrderProvider")
  }
  return context
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <OrderProvider>
          <ToastProvider>{children}</ToastProvider>
        </OrderProvider>
      </CartProvider>
    </LanguageProvider>
  )
}
