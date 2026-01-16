"use client"

import type React from "react"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { useLanguage } from "@/lib/use-language"
import { useToast } from "@/components/toast-provider"

export default function ContactPage() {
  const { t } = useLanguage()
  const { addToast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    })
    setIsLoading(false)
    addToast(t("messageSent"), "success", 3000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="h-1 w-12 bg-orange-600 rounded-full mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 text-balance">
              {t("contactTitle")}
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get in touch with Tarim - Your favorite food delivery service
          </p>
        </div>

        {/* Company Details */}
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>

            <div className="flex gap-6 items-start group">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                <a href="mailto:info@Tarim.com" className="text-orange-600 hover:text-orange-700 font-medium">
                  info@Tarim.com
                </a>
                <p className="text-sm text-gray-600 mt-1">We respond within 24 hours</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <Phone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                <a href="tel:+15550000000" className="text-orange-600 hover:text-orange-700 font-medium">
                  +1 (555) 000-0000
                </a>
                <p className="text-sm text-gray-600 mt-1">Available 24/7</p>
              </div>
            </div>

            <div className="flex gap-6 items-start group">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600 font-medium">123 Food Street</p>
                <p className="text-gray-600 font-medium">Flavor City, FC 12345</p>
              </div>
            </div>
          </div>

          {/* Business Hours & Info */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Business Hours</h2>

            <div className="flex gap-6 items-start group">
              <div className="p-4 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors flex-shrink-0">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="space-y-3 w-full">
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Monday - Friday</span>
                  <span className="text-gray-600">10:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Saturday</span>
                  <span className="text-gray-600">11:00 AM - 12:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-semibold">Sunday</span>
                  <span className="text-gray-600">11:00 AM - 11:00 PM</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About Tarim</h3>
              <p className="text-gray-600 leading-relaxed">
                Tarim is a premium food delivery service dedicated to bringing delicious meals from your favorite
                restaurants right to your doorstep. With fast delivery, fresh food, and excellent customer service,
                we're committed to making your dining experience exceptional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
