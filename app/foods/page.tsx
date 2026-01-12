"use client"

import { useState } from "react"
import FoodCard from "@/components/food-card"
import FoodCategories from "@/components/food-categories"
import ProductModal from "@/components/product-modal"
import { useToast } from "@/components/toast-provider"
import { useLanguage } from "@/lib/use-language"

interface Food {
  id: number
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

const MOCK_FOODS: Food[] = [
  {
    id: 1,
    name: "Butter Chicken",
    category: "north-indian",
    price: 280,
    rating: 4.5,
    reviews: 324,
    image: "https://images.unsplash.com/photo-1553379459-d2229ba7433b?w=500&h=500&fit=crop",
    description: "Tender chicken in a rich, creamy tomato-based sauce",
    isVeg: false,
    preparationTime: "25-30 min",
  },
  {
    id: 2,
    name: "Paneer Tikka",
    category: "north-indian",
    price: 250,
    rating: 4.7,
    reviews: 512,
    image: "https://images.unsplash.com/photo-1585867740718-e72ca04db0f6?w=500&h=500&fit=crop",
    description: "Marinated cottage cheese grilled to perfection",
    isVeg: true,
    preparationTime: "20-25 min",
  },
  {
    id: 3,
    name: "Biryani",
    category: "rice",
    price: 320,
    rating: 4.6,
    reviews: 456,
    image: "https://images.unsplash.com/photo-1631202142357-6bc84f3a7b0a?w=500&h=500&fit=crop",
    description: "Fragrant basmati rice cooked with spices and meat",
    isVeg: false,
    preparationTime: "30-35 min",
  },
  {
    id: 4,
    name: "Dosa",
    category: "south-indian",
    price: 120,
    rating: 4.4,
    reviews: 289,
    image: "https://images.unsplash.com/photo-1626522927191-cd4628902249?w=500&h=500&fit=crop",
    description: "Crispy rice and lentil crepe with sambar and chutney",
    isVeg: true,
    preparationTime: "15-20 min",
  },
  {
    id: 5,
    name: "Gulab Jamun",
    category: "desserts",
    price: 80,
    rating: 4.8,
    reviews: 678,
    image: "https://images.unsplash.com/photo-1585314817248-d3f1db1b8c4e?w=500&h=500&fit=crop",
    description: "Soft milk solids balls soaked in sugar syrup",
    isVeg: true,
    preparationTime: "10-15 min",
  },
  {
    id: 6,
    name: "Samosa",
    category: "snacks",
    price: 50,
    rating: 4.5,
    reviews: 345,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=500&fit=crop",
    description: "Crispy pastry filled with spiced potatoes and peas",
    isVeg: true,
    preparationTime: "10-12 min",
  },
  {
    id: 7,
    name: "Chole Bhature",
    category: "north-indian",
    price: 150,
    rating: 4.6,
    reviews: 398,
    image: "https://images.unsplash.com/photo-1585314817248-d3f1db1b8c4e?w=500&h=500&fit=crop",
    description: "Fluffy fried bread with spiced chickpeas",
    isVeg: true,
    preparationTime: "20-25 min",
  },
  {
    id: 8,
    name: "Masala Dosa",
    category: "south-indian",
    price: 150,
    rating: 4.7,
    reviews: 567,
    image: "https://images.unsplash.com/photo-1626522927191-cd4628902249?w=500&h=500&fit=crop",
    description: "Crispy dosa with spiced potato filling",
    isVeg: true,
    preparationTime: "18-22 min",
  },
  {
    id: 9,
    name: "Chicken Biryani",
    category: "rice",
    price: 350,
    rating: 4.7,
    reviews: 612,
    image: "https://images.unsplash.com/photo-1631202142357-6bc84f3a7b0a?w=500&h=500&fit=crop",
    description: "Fragrant rice with tender chicken and aromatic spices",
    isVeg: false,
    preparationTime: "35-40 min",
  },
]

export default function FoodsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addToast } = useToast()
  const { t } = useLanguage()

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

  const filteredFoods = selectedCategory ? MOCK_FOODS.filter((food) => food.category === selectedCategory) : MOCK_FOODS

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
        {filteredFoods.length > 0 ? (
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
