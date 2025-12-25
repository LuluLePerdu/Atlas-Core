import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useTranslation } from '../../stores/languageStore'
import LanguageSwitcher from './LanguageSwitcher'
import { Calendar, Dumbbell, UtensilsCrossed, LayoutTemplate, LogOut, Home, UserCircle, Wallet } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home },
    { path: '/planner', label: t('weekPlanner'), icon: Calendar },
    { path: '/workouts', label: t('workouts'), icon: Dumbbell },
    { path: '/recipes', label: t('recipes'), icon: UtensilsCrossed },
    { path: '/templates', label: t('templates'), icon: LayoutTemplate },
    { path: '/budget', label: t('budget'), icon: Wallet },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-olympus-navy text-olympus-marble shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center min-w-[140px]">
            <Link to="/dashboard" className="font-display text-xl text-olympus-gold whitespace-nowrap">
              Atlas Core
            </Link>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-2 py-2 rounded-md text-xs font-medium transition-colors min-w-[95px] justify-center ${
                  isActive(path)
                    ? 'bg-olympus-gold text-olympus-navy'
                    : 'text-olympus-marble hover:bg-gray-700'
                }`}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  )
}
