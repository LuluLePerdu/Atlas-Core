import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, DollarSign, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../stores/languageStore'
import { useBudgetStore } from '../stores/budgetStore'
import TransactionModal from '../components/modals/TransactionModal'

export default function Budget() {
  const { t } = useTranslation()
  const {
    categories,
    transactions,
    summary,
    loading,
    fetchCategories,
    fetchMonthTransactions,
    fetchSummary,
    fetchCategoryBreakdown,
    createDefaultCategories
  } = useBudgetStore()

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [categoryBreakdown, setCategoryBreakdown] = useState([])

  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth() + 1

  useEffect(() => {
    const init = async () => {
      await fetchCategories()
      if (categories.length === 0) {
        await createDefaultCategories()
      }
      await fetchMonthTransactions(year, month)
      await fetchSummary(year, month)
      
      const breakdown = await fetchCategoryBreakdown(year, month)
      setCategoryBreakdown(breakdown)
    }
    init()
  }, [selectedDate])

  const previousMonth = () => {
    setSelectedDate(new Date(year, month - 2, 1))
  }

  const nextMonth = () => {
    setSelectedDate(new Date(year, month, 1))
  }

  const currentMonth = () => {
    setSelectedDate(new Date())
  }

  const monthName = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const getCategoryColor = (categoryName) => {
    const colors = {
      'Groceries': 'bg-green-500',
      'Rent': 'bg-blue-500',
      'Utilities': 'bg-yellow-500',
      'Transportation': 'bg-purple-500',
      'Entertainment': 'bg-pink-500',
      'Healthcare': 'bg-red-500',
      'Other': 'bg-gray-500',
      'Salary': 'bg-emerald-500',
      'Freelance': 'bg-indigo-500',
      'Other Income': 'bg-teal-500'
    }
    return colors[categoryName] || 'bg-olympus-gold'
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olympus-gold"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-olympus-marble">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display text-olympus-navy flex items-center gap-2">
                <Wallet size={32} />
                {t('myBudget')}
              </h1>
              <p className="text-gray-600 mt-1">{t('manageAccountSettings')}</p>
            </div>
            <button
              onClick={() => setIsTransactionModalOpen(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              {t('addTransaction')}
            </button>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-olympus-navy" />
            </button>
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-olympus-gold" />
              <span className="text-xl font-semibold text-olympus-navy min-w-[200px] text-center">
                {monthName}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ChevronRight size={24} className="text-olympus-navy" />
            </button>
            {selectedDate.getMonth() !== new Date().getMonth() && (
              <button
                onClick={currentMonth}
                className="ml-4 text-sm text-olympus-gold hover:text-olympus-navy transition-colors"
              >
                {t('thisMonth')}
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('income')}</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  ${summary.income?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('expenses')}</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ${summary.expenses?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown size={24} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-olympus-gold">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('balance')}</p>
                <p className={`text-3xl font-bold mt-2 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${summary.balance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-olympus-gold/20 p-3 rounded-full">
                <DollarSign size={24} className="text-olympus-navy" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-olympus-navy mb-4">{t('categoryBreakdown')}</h2>
            
            {categoryBreakdown.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t('noTransactions')}</p>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category_id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(cat.category_name)}`}></div>
                        <span className="text-sm font-medium text-olympus-navy">
                          {t(cat.category_name.toLowerCase().replace(' ', ''))}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        ${parseFloat(cat.total).toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getCategoryColor(cat.category_name)}`}
                        style={{
                          width: `${(parseFloat(cat.total) / summary.expenses * 100).toFixed(1)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-olympus-navy mb-4">{t('recentTransactions')}</h2>
            
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">{t('noTransactions')}</p>
                <p className="text-sm text-gray-400 mt-2">{t('addYourFirst')}</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 hover:bg-olympus-marble rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp size={20} className="text-green-600" />
                        ) : (
                          <TrendingDown size={20} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-olympus-navy">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString()} • {' '}
                          {transaction.category_name && t(transaction.category_name.toLowerCase().replace(' ', ''))}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isTransactionModalOpen && (
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          categories={categories}
        />
      )}
    </div>
  )
}
