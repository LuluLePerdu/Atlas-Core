import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Calculator } from 'lucide-react'
import { useTranslation } from '../../stores/languageStore'
import { useMealStore } from '../../stores/mealStore'
import api from '../../services/api'

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
    tags: []
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
        tags: recipe.tags || []
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
        tags: []
      })
    }
  }, [recipe, isOpen])
  const [currentIngredient, setCurrentIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'g'
  })
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [ingredientSuggestions, setIngredientSuggestions] = useState([])
  const [showIngredientDropdown, setShowIngredientDropdown] = useState(false)
  const [showCustomIngredientForm, setShowCustomIngredientForm] = useState(false)
  const [customIngredientMacros, setCustomIngredientMacros] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  })
  const [currentInstruction, setCurrentInstruction] = useState('')
  const [currentTag, setCurrentTag] = useState('')
  const [calculatingNutrition, setCalculatingNutrition] = useState(false)
  const [nutritionResult, setNutritionResult] = useState(null)

  // Common units
  const UNITS = [
    { value: 'g', label: 'g' },
    { value: 'kg', label: 'kg' },
    { value: 'ml', label: 'ml' },
    { value: 'l', label: 'l' },
    { value: 'cup', label: t('cup') || 'tasse' },
    { value: 'tbsp', label: t('tablespoon') || 'c. à soupe' },
    { value: 'tsp', label: t('teaspoon') || 'c. à café' },
    { value: 'piece', label: t('piece') || 'pièce' },
    { value: 'oz', label: 'oz' },
    { value: 'lb', label: 'lb' }
  ]

  if (!isOpen) return null

  // Search ingredients with debounce
  const searchIngredients = async (query) => {
    if (query.length < 2) {
      setIngredientSuggestions([])
      setShowIngredientDropdown(false)
      return
    }

    try {
      const { data } = await api.get(`/recipes/search-ingredients?query=${encodeURIComponent(query)}`)
      setIngredientSuggestions(data)
      setShowIngredientDropdown(true)
    } catch (error) {
      console.error('Failed to search ingredients:', error)
      setShowIngredientDropdown(true) // Show dropdown even on error to allow custom ingredient
    }
  }

  const handleIngredientSearchChange = (value) => {
    setIngredientSearch(value)
    setCurrentIngredient(prev => ({ ...prev, name: value }))
    
    // Debounce search
    clearTimeout(window.ingredientSearchTimeout)
    window.ingredientSearchTimeout = setTimeout(() => {
      searchIngredients(value)
    }, 300)
  }

  const selectIngredient = (ingredient) => {
    setIngredientSearch(ingredient.name)
    setCurrentIngredient(prev => ({ ...prev, name: ingredient.name }))
    setShowIngredientDropdown(false)
  }

  const calculateNutrition = async () => {
    if (formData.ingredients.length === 0) {
      alert(t('addIngredientsFirst'))
      return
    }

    setCalculatingNutrition(true)
    setNutritionResult(null)

    try {
      const { data } = await api.post('/recipes/calculate-nutrition', {
        ingredients: formData.ingredients,
        servings: formData.servings
      })

      setNutritionResult(data)
      
      // Optionally auto-fill the macros (user can see the details and decide)
      // For now, just show the results
    } catch (error) {
      console.error('Failed to calculate nutrition:', error)
      alert(t('nutritionCalculationFailed'))
    } finally {
      setCalculatingNutrition(false)
    }
  }

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
    setCurrentIngredient({ name: '', quantity: '', unit: 'g' })
    setIngredientSearch('')
    setIngredientSuggestions([])
    setShowCustomIngredientForm(false)
    setCustomIngredientMacros({ calories: '', protein: '', carbs: '', fat: '' })
  }

  const addCustomIngredient = async () => {
    if (!currentIngredient.name || !currentIngredient.quantity) {
      alert(t('fillRequiredFields') || 'Remplissez les champs requis')
      return
    }

    // Save custom ingredient to database
    try {
      await api.post('/ingredients', {
        name: currentIngredient.name,
        name_fr: currentIngredient.name,
        name_en: currentIngredient.name,
        calories_per_100g: parseFloat(customIngredientMacros.calories) || 0,
        protein_per_100g: parseFloat(customIngredientMacros.protein) || 0,
        carbs_per_100g: parseFloat(customIngredientMacros.carbs) || 0,
        fat_per_100g: parseFloat(customIngredientMacros.fat) || 0,
        category: 'custom',
        source: 'user'
      })
      
      // Add to recipe
      addIngredient()
    } catch (error) {
      console.error('Failed to save custom ingredient:', error)
      alert(t('failedToSaveIngredient') || 'Échec de la sauvegarde de l\'ingrédient')
    }
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-olympus-navy">{t('ingredients')}</h3>
              {formData.ingredients.length > 0 && (
                <button
                  type="button"
                  onClick={calculateNutrition}
                  disabled={calculatingNutrition}
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Calculator size={16} />
                  {calculatingNutrition ? t('calculating') : t('calculateNutrition')}
                </button>
              )}
            </div>

            {/* Nutrition Results */}
            {nutritionResult && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-green-900">{t('nutritionResults')}</h4>
                  <span className="text-xs text-green-700">{nutritionResult.coverage}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-900">{nutritionResult.perServing.calories}</div>
                    <div className="text-xs text-green-700">{t('calories')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">{nutritionResult.perServing.protein}g</div>
                    <div className="text-xs text-green-700">{t('protein')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">{nutritionResult.perServing.carbs}g</div>
                    <div className="text-xs text-green-700">{t('carbs')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-900">{nutritionResult.perServing.fat}g</div>
                    <div className="text-xs text-green-700">{t('fat')}</div>
                  </div>
                </div>
                <p className="text-xs text-green-700 mt-2 text-center">
                  {t('perServing')} ({formData.servings} {t('servings')})
                </p>
              </div>
            )}
            
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
                <div className="col-span-3">{t('quantity')}</div>
                <div className="col-span-2">{t('unit')}</div>
                <div className="col-span-2"></div>
              </div>
              <div className="grid grid-cols-12 gap-2">
                {/* Ingredient Search with Dropdown */}
                <div className="col-span-5 relative">
                  <input
                    type="text"
                    placeholder={t('searchIngredient') || 'Poulet, riz, tomate...'}
                    value={ingredientSearch}
                    onChange={(e) => handleIngredientSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                    onFocus={() => ingredientSuggestions.length > 0 && setShowIngredientDropdown(true)}
                    onBlur={() => setTimeout(() => setShowIngredientDropdown(false), 200)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  
                  {/* Dropdown with suggestions */}
                  {showIngredientDropdown && ingredientSearch.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {ingredientSuggestions.length > 0 && ingredientSuggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectIngredient(suggestion)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center"
                        >
                          <span className="font-medium">{suggestion.name}</span>
                          <span className="text-xs text-gray-500">
                            {suggestion.calories}cal | {suggestion.protein}g P
                          </span>
                        </button>
                      ))}
                      
                      {/* Not found? Create custom */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowIngredientDropdown(false)
                          setShowCustomIngredientForm(true)
                        }}
                        className="w-full px-3 py-2 text-left text-sm bg-blue-50 hover:bg-blue-100 border-t border-blue-200 text-blue-700 font-medium"
                      >
                        + {t('notFound')} "{ingredientSearch}" ? {t('addCustomIngredient')}
                      </button>
                    </div>
                  )}
                </div>
                
                <input
                  type="text"
                  placeholder="200"
                  value={currentIngredient.quantity}
                  onChange={(e) => setCurrentIngredient(prev => ({ ...prev, quantity: e.target.value }))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                
                {/* Unit Selector */}
                <select
                  value={currentIngredient.unit}
                  onChange={(e) => setCurrentIngredient(prev => ({ ...prev, unit: e.target.value }))}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                
                <button
                  type="button"
                  onClick={addIngredient}
                  className="col-span-2 btn-secondary flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {/* Custom Ingredient Form (if not found) */}
              {showCustomIngredientForm && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-blue-900">
                      {t('addCustomIngredient') || 'Ajouter un ingrédient personnalisé'}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCustomIngredientForm(false)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <p className="text-xs text-blue-700 mb-3">
                    {t('customIngredientHelp') || 'Entrez les macros pour 100g de cet ingrédient'}
                  </p>
                  
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div>
                      <label className="text-xs text-blue-900">{t('calories')}</label>
                      <input
                        type="number"
                        placeholder="165"
                        value={customIngredientMacros.calories}
                        onChange={(e) => setCustomIngredientMacros(prev => ({ ...prev, calories: e.target.value }))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-blue-900">{t('protein')} (g)</label>
                      <input
                        type="number"
                        placeholder="31"
                        value={customIngredientMacros.protein}
                        onChange={(e) => setCustomIngredientMacros(prev => ({ ...prev, protein: e.target.value }))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-blue-900">{t('carbs')} (g)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={customIngredientMacros.carbs}
                        onChange={(e) => setCustomIngredientMacros(prev => ({ ...prev, carbs: e.target.value }))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-blue-900">{t('fat')} (g)</label>
                      <input
                        type="number"
                        placeholder="3.6"
                        value={customIngredientMacros.fat}
                        onChange={(e) => setCustomIngredientMacros(prev => ({ ...prev, fat: e.target.value }))}
                        className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addCustomIngredient}
                    className="w-full btn-primary text-sm"
                  >
                    {t('saveAndAdd') || 'Sauvegarder et ajouter'}
                  </button>
                </div>
              )}
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
