import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTranslation } from '../../stores/languageStore'
import LanguageSwitcher from './LanguageSwitcher'
import { Calendar, Dumbbell, UtensilsCrossed, LayoutTemplate, LogOut, Home, UserCircle, Wallet, Menu, X } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home },
    { path: '/planner', label: t('weekPlanner'), icon: Calendar },
    { path: '/workouts', label: t('workouts'), icon: Dumbbell },
    { path: '/recipes', label: t('recipes'), icon: UtensilsCrossed },
    { path: '/templates', label: t('templates'), icon: LayoutTemplate },
    { path: '/budget', label: t('budget'), icon: Wallet },
  ]

  const isActive = (path) => location.pathname === path

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="bg-olympus-navy text-olympus-marble shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="font-display text-xl text-olympus-gold whitespace-nowrap">
              Atlas Core
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-olympus-gold text-olympus-navy'
                    : 'text-olympus-marble hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher />
            <Link
              to="/account"
              className="flex items-center space-x-2 text-sm text-olympus-marble hover:text-olympus-gold transition-colors"
            >
              <UserCircle size={18} />
              <span>{user?.username}</span>
            </Link>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-sm text-olympus-marble hover:text-olympus-gold transition-colors"
            >
              <LogOut size={18} />
              <span>{t('logout')}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-olympus-marble hover:bg-gray-700 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-olympus-gold text-olympus-navy'
                    : 'text-olympus-marble hover:bg-gray-700'
                }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            ))}
            
            {/* Mobile user section */}
            <div className="border-t border-gray-700 pt-3 mt-3 space-y-1">
              <Link
                to="/account"
                onClick={handleNavClick}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base text-olympus-marble hover:bg-gray-700"
              >
                <UserCircle size={20} />
                <span>{user?.username}</span>
              </Link>
              
              <div className="flex items-center space-x-3 px-3 py-3">
                <LanguageSwitcher />
              </div>
              
              <button
                onClick={() => {
                  logout()
                  handleNavClick()
                }}
                className="flex items-center space-x-3 px-3 py-3 rounded-md text-base text-olympus-marble hover:bg-gray-700 w-full"
              >
                <LogOut size={20} />
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
