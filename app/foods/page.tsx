"use client"

import { useState, useEffect } from "react"
import FoodCard from "@/components/food-card"
import FoodCategories from "@/components/food-categories"
import ProductModal from "@/components/product-modal"
import { useToast } from "@/components/toast-provider"
import { useLanguage } from "@/lib/use-language"
import { onMenuItemsChange } from "@/lib/firebase-menu"

interface Food {
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

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    setIsLoading(true)
    const unsubscribe = onMenuItemsChange((items) => {
      setFoods(items)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
    if (category) {
      const categoryName = category.replace("-", " ").toUpperCase()
      addToast(`Showing ${categoryName} items`, "info", 2000)
    } else {
      addToast("Showing all items", "info", 2000)
    }
  }

  const handleCardClick = (food: Food) => {
    setSelectedFood(food)
    setIsModalOpen(true)
  }

  const filteredFoods = selectedCategory ? foods.filter((food) => food.category === selectedCategory) : foods

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="mb-12 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-orange-600 rounded-full" />
            <span className="text-orange-600 font-semibold tracking-wide">{t("ourMenu")}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 text-balance">{t("discoverFlavors")}</h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl leading-relaxed">{t("menuDescription")}</p>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <FoodCategories selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
        </div>

        {/* Food Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} onCardClick={handleCardClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">{t("noItems")}</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        food={selectedFood}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFood(null)
        }}
      />
    </main>
  )
}
