"use client"

import { UtensilsCrossed, Leaf, Dice1 as Rice, Cake, Flame } from "lucide-react"

const CATEGORIES = [
  { id: "north-indian", label: "North Indian", icon: UtensilsCrossed },
  { id: "south-indian", label: "South Indian", icon: Leaf },
  { id: "rice", label: "Rice", icon: Rice },
  { id: "desserts", label: "Desserts", icon: Cake },
  { id: "snacks", label: "Snacks", icon: Flame },
]

export default function FoodCategories({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
          selectedCategory === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground hover:bg-muted/80"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((category) => {
        const Icon = category.icon
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all font-medium flex items-center gap-2 ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            <Icon className="w-4 h-4" />
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
