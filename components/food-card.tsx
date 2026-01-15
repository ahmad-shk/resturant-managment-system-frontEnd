"use client"

import type React from "react"

import Image from "next/image"
import { Star, Clock, Leaf, Plus } from "lucide-react"
import { useCart } from "@/app/providers"
import { useToast } from "@/components/toast-provider"

interface Food {
  id: string
  name: string
  price: number
  rating: number
  reviews: number
  image: string
  description: string
  isVeg: boolean
  preparationTime: string
}

export default function FoodCard({ food, onCardClick }: { food: Food; onCardClick: (food: Food) => void }) {
  const { addToCart } = useCart()
  const { addToast } = useToast()

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    addToCart({
      id: Number.parseInt(food.id) || food.id.charCodeAt(0),
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: 1,
    })
    addToast(`${food.name} added to cart!`, "success")
  }

  return (
    <div
      onClick={() => onCardClick(food)}
      className="food-card group hover:scale-105 active:scale-95 transition-transform duration-300"
    >
      {/* Image Container */}
      <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        <Image
          src={food.image || "/placeholder.svg"}
          alt={food.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Veg/Non-Veg Badge */}
        <div className="absolute top-4 right-4">
          {food.isVeg ? (
            <div className="bg-white rounded-lg p-2 shadow-lg hover:shadow-xl transition">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
          ) : (
            <div className="bg-white rounded-lg p-2 shadow-lg hover:shadow-xl transition">
              <div className="w-5 h-5 border-2 border-red-600 rounded"></div>
            </div>
          )}
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl px-3 py-2 shadow-lg font-bold text-primary text-lg">
        €{food.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-primary transition">
            {food.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{food.description}</p>
        </div>

        {/* Rating & Time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-semibold text-sm text-gray-900">{food.rating}</span>
            <span className="text-gray-600 text-xs">({food.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">{food.preparationTime}</span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={handleQuickAdd}
          className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Quick Add
        </button>
      </div>
    </div>
  )
}
