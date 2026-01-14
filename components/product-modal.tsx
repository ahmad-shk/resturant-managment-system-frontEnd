"use client"

import Image from "next/image"
import { X, Star, Clock, Leaf, Plus, Minus } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/app/providers"
import { useToast } from "@/components/toast-provider"

interface Food {
  id: number
  name: string
  price: number
  rating: number
  reviews: number
  image: string
  description: string
  isVeg: boolean
  preparationTime: string
}

interface ProductModalProps {
  food: Food | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductModal({ food, isOpen, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const { addToast } = useToast()

  if (!isOpen || !food) return null

  const handleAddToCart = () => {
    addToCart({
      id: food.id,
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: quantity,
    })
    addToast(`${quantity} ${food.name} added to cart!`, "success")
    onClose()
    setQuantity(1)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto fade-in slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition bg-white shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Section */}
          <div className="relative h-80 bg-gray-200 overflow-hidden">
            <Image src={food.image || "/placeholder.svg"} alt={food.name} fill className="object-cover" />
            {/* Veg/Non-Veg Badge */}
            <div className="absolute top-6 left-6">
              {food.isVeg ? (
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <div className="w-6 h-6 border-2 border-red-600 rounded"></div>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 space-y-6">
            {/* Title & Rating */}
            <div className="space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">{food.name}</h2>
              <p className="text-gray-600 text-lg leading-relaxed">{food.description}</p>

              {/* Rating & Time */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-xl">
                  <Star className="w-5 h-5 fill-primary text-primary" />
                  <span className="font-bold text-gray-900">{food.rating}</span>
                  <span className="text-gray-600">({food.reviews})</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-xl">
                  <Clock className="w-5 h-5 text-secondary" />
                  <span className="font-semibold text-gray-900">{food.preparationTime}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Price & Quantity */}
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">${food.price}</div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-4 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-white rounded-lg transition"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-white rounded-lg transition">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="w-full btn-primary text-lg py-4 flex items-center justify-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Add {quantity} to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
