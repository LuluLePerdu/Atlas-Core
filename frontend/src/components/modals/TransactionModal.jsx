import { useState } from 'react'
import { X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useBudgetStore } from '../../stores/budgetStore'

export default function TransactionModal({ isOpen, onClose, categories }) {
  const { t } = useTranslation()
  const { createTransaction } = useBudgetStore()
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    category_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError(t('invalidPrice'))
      return
    }

    if (!formData.description) {
      setError('Description is required')
      return
    }

    setLoading(true)
    try {
      await createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Filter categories by type
  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy flex items-center gap-2">
            <DollarSign size={24} />
            {t('addTransaction')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-olympus-navy mb-2">
              {t('type')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income', category_id: '' }))}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingUp size={20} />
                {t('income')}
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category_id: '' }))}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <TrendingDown size={20} />
                {t('expenses')}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-olympus-navy mb-2">
              {t('amount')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                className="input-primary pl-8"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-olympus-navy mb-2">
              {t('category')}
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="input-primary"
            >
              <option value="">{t('selectCategory')}</option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {t(category.name.toLowerCase().replace(' ', ''))}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-olympus-navy mb-2">
              {t('description')}
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-primary"
              placeholder={t('description')}
              required
            />
          </div>

          {/* Date */}
          <div>
            <label htmlFor="transaction_date" className="block text-sm font-medium text-olympus-navy mb-2">
              {t('date')}
            </label>
            <input
              type="date"
              id="transaction_date"
              name="transaction_date"
              value={formData.transaction_date}
              onChange={handleChange}
              className="input-primary"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? t('loading') : t('addTransaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
