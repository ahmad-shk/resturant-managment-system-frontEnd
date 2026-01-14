import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from "firebase/auth"
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore"
import { ref, set, update, get, remove, onValue, off } from "firebase/database"
import { auth, db, rtdb } from "@/lib/firebase"

export interface OrderData {
  id: string
  items: any[]
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
  userId: string
  deviceId: string
}

// Auth Functions
export const checkUserExists = async (email: string): Promise<boolean> => {
  try {
    const q = query(collection(db, "users"), where("email", "==", email))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.length > 0
  } catch (error) {
    console.error("Error checking if user exists:", error)
    return false
  }
}

export const registerUser = async (email: string, password: string, name: string): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)

  // Store user profile in Firestore
  await setDoc(doc(db, "users", userCredential.user.uid), {
    email,
    name,
    createdAt: new Date(),
    uid: userCredential.user.uid,
  })

  return userCredential
}

export const loginUser = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password)
}

// Order Functions
export const saveOrderToFirebase = async (order: OrderData): Promise<void> => {
  try {
    // Save to Firestore
    await setDoc(doc(db, "orders", order.id), {
      ...order,
      createdAt: new Date(order.createdAt),
      orderDate: new Date(order.orderDate),
    })

    // Also save to Realtime Database for real-time updates
    await set(ref(rtdb, `orders/${order.id}`), {
      ...order,
      createdAt: order.createdAt,
      orderDate: order.orderDate,
    })

    // Link order to user
    if (order.userId) {
      await updateDoc(doc(db, "users", order.userId), {
        orders: [order.id],
      })
    }

    // Link order to device
    const deviceOrdersRef = ref(rtdb, `device_orders/${order.deviceId}`)
    const deviceOrdersList = await get(deviceOrdersRef)
    const existingOrders = deviceOrdersList.val() || []
    await set(deviceOrdersRef, [...existingOrders, order.id])
  } catch (error) {
    console.error("Error saving order:", error)
    throw error
  }
}

export const getOrdersByUserId = async (userId: string): Promise<OrderData[]> => {
  try {
    const q = query(collection(db, "orders"), where("userId", "==", userId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as OrderData[]
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

export const getOrdersByDeviceId = async (deviceId: string): Promise<OrderData[]> => {
  try {
    const q = query(collection(db, "orders"), where("deviceId", "==", deviceId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as OrderData[]
  } catch (error) {
    console.error("Error fetching orders by device:", error)
    return []
  }
}

export const getOrderById = async (orderId: string): Promise<OrderData | null> => {
  try {
    const docSnap = await getDoc(doc(db, "orders", orderId))
    if (docSnap.exists()) {
      return {
        ...docSnap.data(),
        id: orderId,
      } as OrderData
    }
    return null
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

export const updateOrderStatus = async (orderId: string, statusIndex: number, status: string): Promise<void> => {
  try {
    // Update in Firestore
    await updateDoc(doc(db, "orders", orderId), {
      currentStatusIndex: statusIndex,
      status,
    })

    // Update in Realtime Database for real-time updates
    await update(ref(rtdb, `orders/${orderId}`), {
      currentStatusIndex: statusIndex,
      status,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

export const subscribeToOrderUpdates = (
  orderId: string,
  onUpdate: (order: OrderData) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const orderRef = ref(rtdb, `orders/${orderId}`)

  const listener = onValue(
    orderRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const updatedOrder = snapshot.val()
        onUpdate({
          ...updatedOrder,
          id: orderId,
        })
      }
    },
    (error) => {
      console.error("Error subscribing to order:", error)
      onError?.(error)
    },
  )

  return () => off(orderRef, "value", listener)
}

export const subscribeToUserOrders = (
  userId: string,
  onUpdate: (orders: OrderData[]) => void,
  onError?: (error: Error) => void,
): (() => void) => {
  const userOrdersRef = ref(rtdb, `user_orders/${userId}`)

  const listener = onValue(
    userOrdersRef,
    async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const orderIds = snapshot.val() || []

          // Fetch all orders in parallel
          const ordersPromises = (Array.isArray(orderIds) ? orderIds : []).map((orderId: string) =>
            getOrderById(orderId),
          )

          const orders = await Promise.all(ordersPromises)
          onUpdate(orders.filter((o): o is OrderData => o !== null))
        } else {
          onUpdate([])
        }
      } catch (error) {
        console.error("Error fetching user orders:", error)
        onError?.(error as Error)
      }
    },
    (error) => {
      console.error("Error subscribing to user orders:", error)
      onError?.(error)
    },
  )

  return () => off(userOrdersRef, "value", listener)
}

export const updateOrderStatusRealtime = async (
  orderId: string,
  statusIndex: number,
  status: string,
  metadata?: Record<string, any>,
): Promise<void> => {
  try {
    const updateData = {
      currentStatusIndex: statusIndex,
      status,
      lastUpdated: new Date().getTime(),
      ...metadata,
    }

    // Update in Firestore
    await updateDoc(doc(db, "orders", orderId), updateData)

    // Update in Realtime Database immediately for real-time sync
    await update(ref(rtdb, `orders/${orderId}`), updateData)

    // Update status history
    await set(ref(rtdb, `order_status_history/${orderId}/${new Date().getTime()}`), {
      status,
      statusIndex,
      timestamp: new Date().getTime(),
      ...metadata,
    })
  } catch (error) {
    console.error("Error updating order status in realtime:", error)
    throw error
  }
}

export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, "orders", orderId))

    // Delete from Realtime Database
    await remove(ref(rtdb, `orders/${orderId}`))
    await remove(ref(rtdb, `order_status_history/${orderId}`))
  } catch (error) {
    console.error("Error deleting order:", error)
    throw error
  }
}

export const bulkUpdateOrders = async (orders: Array<{ id: string; updates: Partial<OrderData> }>): Promise<void> => {
  try {
    const batch = writeBatch(db)

    orders.forEach(({ id, updates }) => {
      batch.update(doc(db, "orders", id), updates)
    })

    await batch.commit()

    // Also update in RTDB
    for (const { id, updates } of orders) {
      await update(ref(rtdb, `orders/${id}`), {
        ...updates,
        lastUpdated: new Date().getTime(),
      })
    }
  } catch (error) {
    console.error("Error bulk updating orders:", error)
    throw error
  }
}

export const searchOrders = async (
  userId: string,
  filters?: {
    status?: string
    dateFrom?: number
    dateTo?: number
    minAmount?: number
    maxAmount?: number
  },
): Promise<OrderData[]> => {
  try {
    let q = query(collection(db, "orders"), where("userId", "==", userId))

    if (filters?.status) {
      q = query(collection(db, "orders"), where("userId", "==", userId), where("status", "==", filters.status))
    }

    const querySnapshot = await getDocs(q)
    let results = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as OrderData[]

    // Apply additional filters
    if (filters) {
      results = results.filter((order) => {
        if (filters.dateFrom && order.createdAt < filters.dateFrom) return false
        if (filters.dateTo && order.createdAt > filters.dateTo) return false
        if (filters.minAmount && order.total < filters.minAmount) return false
        if (filters.maxAmount && order.total > filters.maxAmount) return false
        return true
      })
    }

    return results
  } catch (error) {
    console.error("Error searching orders:", error)
    return []
  }
}

export const getOrderAnalytics = async (
  userId: string,
): Promise<{
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  statusCounts: Record<string, number>
}> => {
  try {
    const orders = await getOrdersByUserId(userId)

    const statusCounts = orders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, o) => sum + o.total, 0),
      averageOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0,
      statusCounts,
    }
  } catch (error) {
    console.error("Error calculating analytics:", error)
    throw error
  }
}
