import { Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Header Component
 * Design: Sticky navigation with logo and menu
 * Features: Responsive menu, brand logo, and navigation links
 */

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/manus-storage/logo-icon_bfd3654c.png"
            alt="ConnectLive"
            className="w-10 h-10"
          />
          <span className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
            ConnectLive
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
            الميزات
          </a>
          <a href="#faq" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
            الأسئلة الشائعة
          </a>
          <a href="#safety" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
            الأمان
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
            تسجيل الدخول
          </button>
          <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 px-6 rounded-full hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg">
            ابدأ الآن
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-900" />
          ) : (
            <Menu className="w-6 h-6 text-gray-900" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 px-4 space-y-4 animate-in fade-in slide-in-from-top-2">
          <a href="#features" className="block text-gray-700 hover:text-purple-600 font-medium py-2">
            الميزات
          </a>
          <a href="#faq" className="block text-gray-700 hover:text-purple-600 font-medium py-2">
            الأسئلة الشائعة
          </a>
          <a href="#safety" className="block text-gray-700 hover:text-purple-600 font-medium py-2">
            الأمان
          </a>
          <div className="flex flex-col gap-2 pt-4">
            <button className="text-purple-600 font-semibold py-2">
              تسجيل الدخول
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold py-2 px-6 rounded-full">
              ابدأ الآن
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
