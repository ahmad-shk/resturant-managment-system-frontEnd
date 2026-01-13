import { db } from "@/lib/firebase"
import { collection, getDocs, onSnapshot } from "firebase/firestore"

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  rating: number
  reviews: number
  image: string
  description: string
  isVeg: boolean
  preparationTime: string
}

// Fetch all menu items from Firebase
export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const menusRef = collection(db, "menus")
    const querySnapshot = await getDocs(menusRef)
    const items: MenuItem[] = []

    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data(),
      } as MenuItem)
    })

    return items
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return []
  }
}

// Real-time listener for menu items
export function onMenuItemsChange(callback: (items: MenuItem[]) => void) {
  try {
    const menusRef = collection(db, "menus")
    const unsubscribe = onSnapshot(menusRef, (snapshot) => {
      const items: MenuItem[] = []
      snapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data(),
        } as MenuItem)
      })
      callback(items)
    })

    return unsubscribe
  } catch (error) {
    console.error("Error setting up menu listener:", error)
    return () => {}
  }
}
