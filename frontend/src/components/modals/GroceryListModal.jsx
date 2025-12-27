import { useState, useEffect } from 'react'
import { ShoppingCart, X, Printer, RefreshCw } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import api from '../../services/api'

export default function GroceryListModal({ isOpen, onClose, weekStartDate }) {
  const { t } = useTranslation()
  const [groceryList, setGroceryList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && weekStartDate) {
      loadOrGenerateGroceryList()
    }
  }, [isOpen, weekStartDate])

  const loadOrGenerateGroceryList = async () => {
    if (!weekStartDate) return

    setLoading(true)
    setError(null)
    try {
      // Try to load existing list first
      try {
        const { data } = await api.get(`/grocery/week/${weekStartDate}`)
        setGroceryList(data)
        setLoading(false)
        return
      } catch (err) {
        // If 404, list doesn't exist yet, generate it
        if (err.response?.status !== 404) {
          throw err
        }
      }

      // Generate new list if it doesn't exist
      const { data } = await api.post('/grocery/generate', { week_start_date: weekStartDate })
      setGroceryList(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load grocery list')
    } finally {
      setLoading(false)
    }
  }

  const regenerateGroceryList = async () => {
    if (!weekStartDate) return

    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/grocery/generate', { week_start_date: weekStartDate })
      setGroceryList(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate grocery list')
    } finally {
      setLoading(false)
    }
  }

  const updateItem = async (index, updates) => {
    if (!groceryList) return

    const newItems = [...groceryList.items]
    newItems[index] = { ...newItems[index], ...updates }

    // Update local state immediately
    setGroceryList(prev => ({
      ...prev,
      items: newItems,
      total_spent: newItems
        .filter(item => item.checked && item.price)
        .reduce((sum, item) => sum + parseFloat(item.price), 0)
    }))

    // Save to backend
    try {
      await api.patch(`/grocery/${groceryList.id}`, {
        items: newItems,
        total_spent: newItems
          .filter(item => item.checked && item.price)
          .reduce((sum, item) => sum + parseFloat(item.price), 0)
      })
    } catch (err) {
      console.error('Failed to update:', err)
    }
  }

  const handlePriceChange = (index, value) => {
    const price = parseFloat(value) || 0
    updateItem(index, { price })
  }

  const toggleCheck = (index) => {
    const item = groceryList.items[index]
    updateItem(index, { checked: !item.checked })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-olympus-navy text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <ShoppingCart size={24} className="flex-shrink-0 sm:w-7 sm:h-7" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-display truncate">{t('groceryList')}</h2>
              {groceryList && (
                <p className="text-sm text-olympus-gold">
                  {new Date(groceryList.week_start_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {groceryList && (
              <>
                <button 
                  onClick={regenerateGroceryList}
                  disabled={loading}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition disabled:opacity-50"
                  title={t('regenerate') || 'Regenerate list'}
                >
                  <RefreshCw size={18} className="sm:w-5 sm:h-5" />
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="hidden sm:block p-2 hover:bg-white/10 rounded transition"
                  title={t('print')}
                >
                  <Printer size={20} />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-white/10 rounded transition">
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olympus-gold mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={loadOrGenerateGroceryList} className="btn-primary">
                {t('retry')}
              </button>
            </div>
          )}

          {groceryList && !loading && (
            <div>
              {/* Total Summary */}
              {groceryList.total_spent > 0 && (
                <div className="bg-olympus-gold/10 border-2 border-olympus-gold rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base sm:text-lg font-semibold text-olympus-navy">{t('totalSpent')}:</span>
                    <span className="text-2xl sm:text-3xl font-bold text-olympus-gold">
                      ${groceryList.total_spent.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    {groceryList.items.filter(i => i.checked).length} of {groceryList.items.length} items purchased
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="w-10 sm:w-12 p-2 sm:p-3"></th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-olympus-navy text-sm sm:text-base">Item</th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-olympus-navy w-24 sm:w-32 text-sm sm:text-base">Quantity</th>
                      <th className="text-left p-2 sm:p-3 font-semibold text-olympus-navy w-24 sm:w-32 text-sm sm:text-base">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groceryList.items.map((item, index) => (
                      <tr 
                        key={index}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                          item.checked ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="p-2 sm:p-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.checked || false}
                            onChange={() => toggleCheck(index)}
                            className="h-4 w-4 sm:h-5 sm:w-5 text-olympus-gold rounded focus:ring-olympus-gold cursor-pointer"
                          />
                        </td>
                        <td className="p-2 sm:p-3">
                          <div>
                            <p className={`font-medium text-sm sm:text-base ${item.checked ? 'line-through text-gray-500' : 'text-olympus-navy'}`}>
                              {item.name}
                            </p>
                            {item.source_recipes && item.source_recipes.length > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                                Used in {item.source_recipes.length} recipe{item.source_recipes.length > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 text-gray-700 text-sm sm:text-base">
                          {typeof item.quantity === 'number' ? item.quantity.toFixed(1) : item.quantity} {item.unit}
                        </td>
                        <td className="p-2 sm:p-3">
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-0.5 sm:mr-1 text-sm">$</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.price || ''}
                              onChange={(e) => handlePriceChange(index, e.target.value)}
                              placeholder="0.00"
                              className="w-16 sm:w-20 px-1.5 sm:px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {groceryList.items.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No items in this week's grocery list</p>
                  <p className="text-sm mt-2">Add meals to your week planner to generate a list</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {groceryList && !loading && groceryList.items.length > 0 && (
          <div className="border-t border-gray-300 p-4 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Changes save automatically
            </div>
            <button onClick={onClose} className="btn-primary">
              {t('close')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
