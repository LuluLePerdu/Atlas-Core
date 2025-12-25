import { useState } from 'react'
import { ShoppingCart, X, DollarSign, Check } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useMealStore } from '../../stores/mealStore'
import api from '../../services/api'

export default function GroceryListModal({ isOpen, onClose, weekStartDate }) {
  const { t } = useTranslation()
  const [groceryList, setGroceryList] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editingPrice, setEditingPrice] = useState(null)
  const [priceInput, setPriceInput] = useState('')

  const generateGroceryList = async () => {
    if (!weekStartDate) {
      setError('Week start date is required')
      return
    }

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

  const toggleItemChecked = async (itemIndex) => {
    if (!groceryList) return

    try {
      await api.patch(`/grocery/${groceryList.id}/item/${itemIndex}`)
      
      setGroceryList(prev => {
        const newItems = [...prev.items]
        newItems[itemIndex] = { 
          ...newItems[itemIndex], 
          checked: !newItems[itemIndex].checked 
        }
        
        // Calculate total spent
        const totalSpent = newItems
          .filter(item => item.checked && item.price)
          .reduce((sum, item) => sum + parseFloat(item.price), 0)
        
        return {
          ...prev,
          items: newItems,
          total_spent: totalSpent
        }
      })
    } catch (err) {
      console.error('Failed to toggle item:', err)
    }
  }

  const startEditingPrice = (itemIndex, currentPrice) => {
    setEditingPrice(itemIndex)
    setPriceInput(currentPrice || '')
  }

  const savePrice = async (itemIndex) => {
    if (!groceryList) {
      setEditingPrice(null)
      return
    }

    try {
      const price = priceInput ? parseFloat(priceInput) : 0
      if (isNaN(price) || price < 0) {
        setError(t('invalidPrice'))
        return
      }

      const newItems = [...groceryList.items]
      newItems[itemIndex] = { ...newItems[itemIndex], price }

      const totalSpent = newItems
        .filter(item => item.checked && item.price)
        .reduce((sum, item) => sum + parseFloat(item.price), 0)

      await api.patch(`/grocery/${groceryList.id}`, { 
        items: newItems,
        total_spent: totalSpent
      })

      setGroceryList(prev => ({
        ...prev,
        items: newItems,
        total_spent: totalSpent
      }))

      setEditingPrice(null)
      setPriceInput('')
    } catch (err) {
      console.error('Failed to save price:', err)
      setError(t('failedToSavePrice'))
    }
  }

  const completeGroceryList = async () => {
    if (!groceryList) return

    try {
      // Create transaction for grocery expenses
      const totalSpent = groceryList.total_spent || 0
      
      if (totalSpent > 0) {
        // Get Groceries category
        const categoriesRes = await api.get('/budget/categories')
        const groceriesCategory = categoriesRes.data.find(cat => cat.name === 'Groceries')
        
        await api.post('/budget/transactions', {
          amount: totalSpent,
          type: 'expense',
          category_id: groceriesCategory?.id,
          description: `${t('groceries')} - ${t('weekOf')} ${new Date(groceryList.week_start_date).toLocaleDateString()}`,
          transaction_date: new Date().toISOString().split('T')[0],
          source: 'grocery_list',
          source_id: groceryList.id
        })
      }

      await api.put(`/grocery/${groceryList.id}`, {
        is_purchased: true,
        purchased_at: new Date().toISOString()
      })

      onClose()
    } catch (err) {
      console.error('Failed to complete grocery list:', err)
      setError(t('failedToCompleteList'))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy flex items-center gap-2">
            <ShoppingCart size={24} />
            {t('groceryList')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {!groceryList && !loading && !error && (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">{t('generateGroceryListDesc')}</p>
              <button onClick={generateGroceryList} className="btn-primary">
                {t('generateGroceryList')}
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olympus-gold mx-auto"></div>
              <p className="mt-4 text-gray-600">{t('loading')}</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={generateGroceryList} className="btn-primary">
                {t('retry')}
              </button>
            </div>
          )}

          {groceryList && !loading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  {t('weekOf')}: {new Date(groceryList.week_start_date).toLocaleDateString()}
                </p>
                <button onClick={generateGroceryList} className="btn-secondary text-sm">
                  {t('regenerate')}
                </button>
              </div>

              {groceryList.total_spent > 0 && (
                <div className="bg-olympus-gold/10 border border-olympus-gold/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-olympus-navy">{t('totalSpent')}:</span>
                    <span className="text-2xl font-bold text-olympus-gold">
                      ${groceryList.total_spent.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {groceryList.items.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      item.checked 
                        ? 'bg-gray-100 opacity-60' 
                        : 'bg-olympus-marble hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={() => toggleItemChecked(index)}
                      className="mt-1 h-5 w-5 text-olympus-gold rounded focus:ring-olympus-gold cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${item.checked ? 'line-through text-gray-500' : 'text-olympus-navy'}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} {item.unit}
                      </p>
                      {item.recipes && item.recipes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t('for')}: {item.recipes.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {editingPrice === index ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={priceInput}
                            onChange={(e) => setPriceInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && savePrice(index)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="0.00"
                            autoFocus
                          />
                          <button
                            onClick={() => savePrice(index)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingPrice(null)}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditingPrice(index, item.price)}
                          className="flex items-center gap-1 px-2 py-1 text-sm text-olympus-navy hover:bg-white rounded border border-gray-200"
                        >
                          <DollarSign size={14} />
                          {item.price ? `$${parseFloat(item.price).toFixed(2)}` : t('addPrice')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {groceryList.items.length === 0 && (
                <p className="text-center text-gray-500 py-8">{t('noItemsInGroceryList')}</p>
              )}

              {groceryList.items.length > 0 && !groceryList.is_purchased && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={completeGroceryList}
                    className="btn-primary w-full"
                    disabled={groceryList.total_spent === 0}
                  >
                    {t('completeGroceryList')}
                  </button>
                  {groceryList.total_spent === 0 && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {t('addPricesToComplete')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
