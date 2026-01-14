"use client"

import {
  saveOrderToFirebase,
  getOrderById,
  updateOrderStatusRealtime,
  getOrdersByUserId,
  subscribeToUserOrders,
  subscribeToOrderUpdates,
  searchOrders,
  getOrderAnalytics,
  deleteOrder,
} from "@/lib/firebase-utils"
import type { OrderData } from "@/lib/firebase-utils"

/**
 * Order Management Service Layer
 * Centralizes all order-related operations with Firebase sync
 */
export class OrderService {
  // CREATE Operations
  static async createOrder(orderData: OrderData): Promise<void> {
    console.log("[OrderService] Creating order:", orderData.id)
    await saveOrderToFirebase(orderData)
  }

  // READ Operations
  static async fetchOrder(orderId: string): Promise<OrderData | null> {
    console.log("[OrderService] Fetching order:", orderId)
    return getOrderById(orderId)
  }

  static async fetchUserOrders(userId: string): Promise<OrderData[]> {
    console.log("[OrderService] Fetching orders for user:", userId)
    return getOrdersByUserId(userId)
  }

  static async searchOrders(
    userId: string,
    filters?: {
      status?: string
      dateFrom?: number
      dateTo?: number
      minAmount?: number
      maxAmount?: number
    },
  ): Promise<OrderData[]> {
    console.log("[OrderService] Searching orders with filters:", filters)
    return searchOrders(userId, filters)
  }

  static async getAnalytics(userId: string): Promise<{
    totalOrders: number
    totalSpent: number
    averageOrderValue: number
    statusCounts: Record<string, number>
  }> {
    console.log("[OrderService] Fetching analytics for user:", userId)
    return getOrderAnalytics(userId)
  }

  // UPDATE Operations
  static async updateOrderStatus(orderId: string, statusIndex: number, status: string): Promise<void> {
    console.log("[OrderService] Updating order status:", orderId, "->", status)
    await updateOrderStatusRealtime(orderId, statusIndex, status)
  }

  // DELETE Operations
  static async deleteOrder(orderId: string): Promise<void> {
    console.log("[OrderService] Deleting order:", orderId)
    await deleteOrder(orderId)
  }

  // SUBSCRIPTION Operations (Real-time)
  static subscribeToOrder(
    orderId: string,
    onUpdate: (order: OrderData) => void,
    onError?: (error: Error) => void,
  ): () => void {
    console.log("[OrderService] Subscribing to order updates:", orderId)
    return subscribeToOrderUpdates(orderId, onUpdate, onError)
  }

  static subscribeToUserOrders(
    userId: string,
    onUpdate: (orders: OrderData[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    console.log("[OrderService] Subscribing to user orders:", userId)
    return subscribeToUserOrders(userId, onUpdate, onError)
  }

  // Helper Methods
  static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      confirmed: "Order Confirmed",
      preparing: "Preparing Your Food",
      ready: "Ready for Pickup",
      "on-the-way": "On The Way",
      delivered: "Delivered",
    }
    return labels[status] || status
  }

  static getStatusIndex(status: string): number {
    const statuses = ["confirmed", "preparing", "ready", "on-the-way", "delivered"]
    return statuses.indexOf(status)
  }

  static isOrderComplete(order: OrderData): boolean {
    return order.status === "delivered"
  }

  static getOrderProgress(order: OrderData): number {
    const statuses = ["confirmed", "preparing", "ready", "on-the-way", "delivered"]
    return ((order.currentStatusIndex + 1) / statuses.length) * 100
  }

  static async validateOrder(orderData: Partial<OrderData>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!orderData.id) errors.push("Order ID is required")
    if (!orderData.items || orderData.items.length === 0) errors.push("Order must contain items")
    if (!orderData.customerName) errors.push("Customer name is required")
    if (!orderData.customerEmail) errors.push("Customer email is required")
    if (!orderData.deliveryAddress) errors.push("Delivery address is required")
    if (!orderData.total || orderData.total <= 0) errors.push("Valid total amount is required")

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}

/**
 * Order Status Manager
 * Handles order status transitions and validations
 */
export class OrderStatusManager {
  static readonly STATUS_STEPS = ["confirmed", "preparing", "ready", "on-the-way", "delivered"] as const

  static canTransitionTo(currentStatus: string, nextStatus: string): boolean {
    const currentIndex = this.STATUS_STEPS.indexOf(currentStatus as any)
    const nextIndex = this.STATUS_STEPS.indexOf(nextStatus as any)
    return nextIndex === currentIndex + 1
  }

  static getNextStatus(currentStatus: string): string | null {
    const currentIndex = this.STATUS_STEPS.indexOf(currentStatus as any)
    if (currentIndex < this.STATUS_STEPS.length - 1) {
      return this.STATUS_STEPS[currentIndex + 1]
    }
    return null
  }

  static getAllowedTransitions(currentStatus: string): string[] {
    const nextStatus = this.getNextStatus(currentStatus)
    return nextStatus ? [nextStatus] : []
  }

  static async transitionOrder(orderId: string, fromStatus: string, toStatus: string): Promise<void> {
    if (!this.canTransitionTo(fromStatus, toStatus)) {
      throw new Error(`Cannot transition from ${fromStatus} to ${toStatus}`)
    }

    const nextIndex = this.STATUS_STEPS.indexOf(toStatus as any)
    await OrderService.updateOrderStatus(orderId, nextIndex, toStatus)
  }

  static getStatusDuration(status: string): number {
    const durations: Record<string, number> = {
      confirmed: 5 * 60 * 1000, // 5 minutes
      preparing: 20 * 60 * 1000, // 20 minutes
      ready: 10 * 60 * 1000, // 10 minutes
      "on-the-way": 30 * 60 * 1000, // 30 minutes
      delivered: 0,
    }
    return durations[status] || 0
  }
}
