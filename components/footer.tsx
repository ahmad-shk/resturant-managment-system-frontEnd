import { Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-2xl mb-4 text-orange-600">Tarim</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Premium food delivery service bringing delicious meals to your doorstep
            </p>
            <p className="text-gray-500 text-xs mt-4">© 2026 Tarim Food Delivery. All rights reserved.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 hover:text-orange-600 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-600 hover:text-orange-600 transition">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-orange-600 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/order-history" className="text-gray-600 hover:text-orange-600 transition">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-600 transition">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-600 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-600 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-orange-600 transition">
                  Refund Policy
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2 items-start">
                <Mail className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <a href="mailto:info@Tarim.com" className="text-gray-600 hover:text-orange-600 transition">
                  info@Tarim.com
                </a>
              </div>
              <div className="flex gap-2 items-start">
                <Phone className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <a href="tel:+15550000000" className="text-gray-600 hover:text-orange-600 transition">
                  +1 (555) 000-0000
                </a>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <address className="text-gray-600 text-xs not-italic">
                  123 Food Street
                  <br />
                  Flavor City, FC 12345
                </address>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
          <p>Tarim © 2026 - Delivering happiness, one meal at a time</p>
        </div>
      </div>
    </footer>
  )
}
