"use client"

import { useEffect, useState } from "react"
import { subscribeToUserOrders, subscribeToOrderUpdates } from "@/lib/firebase-utils"
import type { OrderData } from "@/lib/firebase-utils"

export const useRealtimeOrders = (userId: string | null) => {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setOrders([])
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = subscribeToUserOrders(
      userId,
      (updatedOrders) => {
        setOrders(updatedOrders.sort((a, b) => b.createdAt - a.createdAt))
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [userId])

  return { orders, loading, error }
}

export const useRealtimeOrder = (orderId: string | null) => {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setLoading(false)
      return
    }

    setLoading(true)

    const unsubscribe = subscribeToOrderUpdates(
      orderId,
      (updatedOrder) => {
        setOrder(updatedOrder)
        setLoading(false)
        setError(null)
      },
      (err) => {
        setError(err)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [orderId])

  return { order, loading, error }
}
