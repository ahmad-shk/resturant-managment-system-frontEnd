"use client"

import Link from "next/link"
import Image from "next/image"
import { Utensils, Clock, Leaf, Star } from "lucide-react"
import { useLanguage } from "@/lib/use-language"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Utensils className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Welcome to Admin</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 text-balance">{t("tagline")}</h1>
            </div>
            <p className="text-xl text-gray-600 leading-relaxed">{t("description")}</p>
            <Link href="/foods">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg">
                {t("orderNow")}
              </button>
            </Link>
          </div>

          <div className="relative h-96 md:h-full min-h-96">
            <Image
              src="https://res.cloudinary.com/jamesmarycloud/image/upload/v1653207144/home-page_ldrxp1.png"
              alt="Delicious food delivery"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{t("whyChoose")}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: t("fastDelivery"), desc: t("fastDeliveryDesc") },
              { icon: Leaf, title: t("freshIngredients"), desc: t("freshIngredientsDesc") },
              { icon: Star, title: t("topRated"), desc: t("topRatedDesc") },
            ].map((item, i) => (
              <div key={i} className="p-6 bg-orange-50 rounded-xl text-center hover:bg-orange-100 transition-colors">
                <item.icon className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
