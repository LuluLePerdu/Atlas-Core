import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useTranslation } from '../stores/languageStore'
import { Calendar, Dumbbell, UtensilsCrossed, ShoppingCart } from 'lucide-react'
import { format, startOfWeek } from 'date-fns'
import GroceryListModal from '../components/modals/GroceryListModal'

export default function Dashboard() {
  const { user, fetchUser } = useAuthStore()
  const { t } = useTranslation()
  const [isGroceryModalOpen, setIsGroceryModalOpen] = useState(false)
  const [weekStartDate] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  )

  useEffect(() => {
    if (!user) fetchUser()
  }, [user, fetchUser])

  const quickActions = [
    {
      title: t('planWeek'),
      description: t('quickActions'),
      icon: Calendar,
      link: '/planner',
      color: 'bg-blue-500'
    },
    {
      title: t('workouts'),
      description: t('addWorkout'),
      icon: Dumbbell,
      link: '/workouts',
      color: 'bg-red-500'
    },
    {
      title: t('recipes'),
      description: t('addRecipe'),
      icon: UtensilsCrossed,
      link: '/recipes',
      color: 'bg-green-500'
    },
    {
      title: t('viewGroceryList'),
      description: t('quickActions'),
      icon: ShoppingCart,
      action: () => setIsGroceryModalOpen(true),
      color: 'bg-purple-500'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <GroceryListModal 
        isOpen={isGroceryModalOpen} 
        onClose={() => setIsGroceryModalOpen(false)}
        weekStartDate={weekStartDate}
      />
      
      <div className="mb-12">
        <h1 className="text-4xl font-display text-olympus-navy mb-4">
          {t('welcome')}, {user?.username}
        </h1>
        <p className="text-xl text-gray-600">
          {t('tagline')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickActions.map((action) => {
          const content = (
            <div className="olympus-card hover:shadow-xl transition-shadow cursor-pointer">
              <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <action.icon className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-olympus-navy mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 text-sm">{action.description}</p>
            </div>
          )

          return action.link ? (
            <Link key={action.title} to={action.link}>
              {content}
            </Link>
          ) : (
            <div key={action.title} onClick={action.action}>
              {content}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="olympus-card">
          <h2 className="text-2xl font-display text-olympus-navy mb-4">{t('thisWeekFocus')}</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-olympus-marble rounded-lg">
              <span className="text-gray-700">{t('workoutsScheduled')}</span>
              <span className="font-semibold text-olympus-navy">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-olympus-marble rounded-lg">
              <span className="text-gray-700">{t('mealsPlanned')}</span>
              <span className="font-semibold text-olympus-navy">0</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-olympus-marble rounded-lg">
              <span className="text-gray-700">{t('calendarCompletion')}</span>
              <span className="font-semibold text-olympus-navy">0%</span>
            </div>
          </div>
        </div>

        <div className="olympus-card">
          <h2 className="text-2xl font-display text-olympus-navy mb-4">{t('quickTips')}</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-olympus-gold mr-2">•</span>
              <span>{t('tip1')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-olympus-gold mr-2">•</span>
              <span>{t('tip2')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-olympus-gold mr-2">•</span>
              <span>{t('tip3')}</span>
            </li>
            <li className="flex items-start">
              <span className="text-olympus-gold mr-2">•</span>
              <span>{t('tip4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
