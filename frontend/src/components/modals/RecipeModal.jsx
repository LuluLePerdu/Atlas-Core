import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useMealStore } from '../../stores/mealStore'

export default function RecipeModal({ isOpen, onClose, recipe }) {
  const { t } = useTranslation()
  const { createRecipe, updateRecipe } = useMealStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    difficulty: 'medium',
    ingredients: [],
    instructions: [],
    tags: [],
    macros_per_serving: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  })

  // Load recipe data when editing
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || '',
        description: recipe.description || '',
        prep_time: recipe.prep_time || 0,
        cook_time: recipe.cook_time || 0,
        servings: recipe.servings || 1,
        difficulty: recipe.difficulty || 'medium',
        ingredients: typeof recipe.ingredients === 'string' ? JSON.parse(recipe.ingredients) : recipe.ingredients || [],
        instructions: recipe.instructions || [],
        tags: recipe.tags || [],
        macros_per_serving: typeof recipe.macros_per_serving === 'string' ? JSON.parse(recipe.macros_per_serving) : recipe.macros_per_serving || { calories: 0, protein: 0, carbs: 0, fat: 0 }
      })
    } else {
      setFormData({
        name: '',
        description: '',
        prep_time: 0,
        cook_time: 0,
        servings: 1,
        difficulty: 'medium',
        ingredients: [],
        instructions: [],
        tags: [],
        macros_per_serving: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      })
    }
  }, [recipe, isOpen])
  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    quantity: '',
    unit: ''
  })
  const [currentInstruction, setCurrentInstruction] = useState('')
  const [currentTag, setCurrentTag] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (recipe) {
        await updateRecipe(recipe.id, formData)
      } else {
        await createRecipe(formData)
      }
      onClose()
    } catch (error) {
      console.error('Failed to save recipe:', error)
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    if (!currentIngredient.name || !currentIngredient.quantity) return
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, currentIngredient]
    }))
    setCurrentIngredient({ name: '', quantity: '', unit: '' })
  }

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const addInstruction = () => {
    if (!currentInstruction.trim()) return
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, currentInstruction]
    }))
    setCurrentInstruction('')
  }

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (!currentTag.trim() || formData.tags.includes(currentTag)) return
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, currentTag]
    }))
    setCurrentTag('')
  }

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-display text-olympus-navy">
            {recipe ? t('editRecipe') : t('addRecipe')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('recipeName')}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-olympus-gold focus:border-transparent"
            />
          </div>

          {/* Times and servings */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('prepTime')} ({t('min')})
              </label>
              <input
                type="number"
                min="0"
                value={formData.prep_time}
                onChange={(e) => setFormData(prev => ({ ...prev, prep_time: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('cookTime')} ({t('min')})
              </label>
              <input
                type="number"
                min="0"
                value={formData.cook_time}
                onChange={(e) => setFormData(prev => ({ ...prev, cook_time: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('servings')}
              </label>
              <input
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('difficulty')}
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="easy">{t('easy')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="hard">{t('hard')}</option>
              </select>
            </div>
          </div>

          {/* Ingredients */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-olympus-navy mb-4">{t('ingredients')}</h3>
            
            <div className="space-y-2 mb-4">
              {formData.ingredients.map((ing, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-olympus-marble rounded-lg">
                  <span className="text-sm">
                    {ing.quantity} {ing.unit} {ing.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500">
                <div className="col-span-5">{t('ingredient')}</div>
                <div className="col-span-3">{t('quantity')} (ex: 2, 1/2, 250)</div>
                <div className="col-span-2">{t('unit')} (ex: tasse, g, c. à soupe)</div>
                <div className="col-span-2"></div>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  placeholder="Tomate"
                  value={currentIngredient.name}
                  onChange={(e) => setCurrentIngredient(prev => ({ ...prev, name: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="2"
                  value={currentIngredient.quantity}
                  onChange={(e) => setCurrentIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  placeholder="tasses"
                  value={currentIngredient.unit}
                  onChange={(e) => setCurrentIngredient(prev => ({ ...prev, unit: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button
                  type="button"
                  onClick={addIngredient}
                  className="col-span-2 btn-secondary flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-olympus-navy mb-4">{t('instructions')}</h3>
            
            <div className="space-y-2 mb-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-olympus-marble rounded-lg">
                  <span className="text-sm flex-1">
                    <strong>{index + 1}.</strong> {instruction}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeInstruction(index)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Étape..."
                value={currentInstruction}
                onChange={(e) => setCurrentInstruction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addInstruction}
                className="btn-secondary"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Macros */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-olympus-navy mb-4">{t('macros')}</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('calories')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.macros_per_serving.calories}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macros_per_serving: { ...prev.macros_per_serving, calories: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('protein')} (g)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.macros_per_serving.protein}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macros_per_serving: { ...prev.macros_per_serving, protein: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('carbs')} (g)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.macros_per_serving.carbs}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macros_per_serving: { ...prev.macros_per_serving, carbs: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t('fat')} (g)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.macros_per_serving.fat}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    macros_per_serving: { ...prev.macros_per_serving, fat: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-olympus-navy mb-4">Tags</h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-olympus-marble rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tag..."
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="btn-secondary"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name || formData.ingredients.length === 0}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
