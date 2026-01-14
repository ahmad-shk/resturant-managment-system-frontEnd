import { createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { ref, set, update, get } from "firebase/database"
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
