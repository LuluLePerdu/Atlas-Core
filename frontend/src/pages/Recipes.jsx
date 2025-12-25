import { useEffect, useState } from 'react'
import { useMealStore } from '../stores/mealStore'
import { Plus, UtensilsCrossed, Edit, Trash2, Clock, Users } from 'lucide-react'
import Loading from '../components/shared/Loading'
import { useTranslation } from '../stores/languageStore'
import RecipeModal from '../components/modals/RecipeModal'

export default function Recipes() {
  const { t } = useTranslation()
  const { recipes, loading, fetchRecipes, deleteRecipe } = useMealStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [maxPrepTime, setMaxPrepTime] = useState(null)
  const [minProtein, setMinProtein] = useState(null)

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const handleEdit = (recipe, e) => {
    e.stopPropagation()
    setEditingRecipe(recipe)
    setIsModalOpen(true)
  }

  const handleDelete = async (recipeId, e) => {
    e.stopPropagation()
    if (window.confirm(t('confirmDelete'))) {
      await deleteRecipe(recipeId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRecipe(null)
  }

  // Get all unique tags from recipes
  const allTags = [...new Set(recipes.flatMap(r => r.tags || []))]

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    // Search term
    if (searchTerm && !recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Difficulty
    if (selectedDifficulty !== 'all' && recipe.difficulty !== selectedDifficulty) {
      return false
    }

    // Tags
    if (selectedTags.length > 0) {
      const recipeTags = recipe.tags || []
      if (!selectedTags.some(tag => recipeTags.includes(tag))) {
        return false
      }
    }

    // Max prep time (total time)
    if (maxPrepTime) {
      const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)
      if (totalTime > maxPrepTime) {
        return false
      }
    }

    // Min protein
    if (minProtein && recipe.macros_per_serving) {
      const protein = recipe.macros_per_serving.protein || 0
      if (protein < minProtein) {
        return false
      }
    }

    return true
  })

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedDifficulty('all')
    setSelectedTags([])
    setMaxPrepTime(null)
    setMinProtein(null)
  }

  const hasActiveFilters = searchTerm || selectedDifficulty !== 'all' || 
                          selectedTags.length > 0 || maxPrepTime || minProtein

  if (loading) return <Loading />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-display text-olympus-navy">{t('recipes')}</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>{t('addRecipeBtn')}</span>
        </button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 olympus-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-olympus-navy">{t('filters')}</h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-olympus-gold hover:text-olympus-gold-light"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder={t('searchRecipes')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('difficulty')}
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">{t('all')}</option>
                <option value="easy">{t('easy')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="hard">{t('hard')}</option>
              </select>
            </div>

            {/* Max prep time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('maxTime')}
              </label>
              <select
                value={maxPrepTime || ''}
                onChange={(e) => setMaxPrepTime(e.target.value ? parseInt(e.target.value) : null)}
                className="input-field w-full"
              >
                <option value="">{t('any')}</option>
                <option value="15">15 {t('min')}</option>
                <option value="30">30 {t('min')}</option>
                <option value="45">45 {t('min')}</option>
                <option value="60">60 {t('min')}</option>
              </select>
            </div>

            {/* Min protein */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('minProtein')}
              </label>
              <select
                value={minProtein || ''}
                onChange={(e) => setMinProtein(e.target.value ? parseInt(e.target.value) : null)}
                className="input-field w-full"
              >
                <option value="">{t('any')}</option>
                <option value="20">20g+</option>
                <option value="30">30g+</option>
                <option value="40">40g+</option>
                <option value="50">50g+</option>
              </select>
            </div>

            {/* Results count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredRecipes.length} {t('recipesFound')}
              </div>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tags')}
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      selectedTags.includes(tag)
                        ? 'bg-olympus-gold text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RecipeModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        recipe={editingRecipe}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full olympus-card text-center py-12">
            <UtensilsCrossed size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {hasActiveFilters ? t('noRecipesMatch') : t('noRecipesYet')}
            </h3>
            <p className="text-gray-500 mb-4">
              {hasActiveFilters ? t('tryDifferentFilters') : t('addFirstRecipe')}
            </p>
            {!hasActiveFilters && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                {t('addRecipeBtn')}
              </button>
            )}
          </div>
        ) : (
          filteredRecipes.map(recipe => (
            <div 
              key={recipe.id} 
              className="olympus-card hover:shadow-xl transition-shadow group relative"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {recipe.image_url && (
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleEdit(recipe, e)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-olympus-gold transition-colors"
                  title={t('edit')}
                >
                  <Edit size={16} className="text-olympus-navy" />
                </button>
                <button
                  onClick={(e) => handleDelete(recipe.id, e)}
                  className="p-2 bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors"
                  title={t('delete')}
                >
                  <Trash2 size={16} className="text-red-500 hover:text-white" />
                </button>
              </div>

              <h3 className="text-xl font-semibold text-olympus-navy mb-2">
                {recipe.name}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {recipe.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{recipe.prep_time + recipe.cook_time} {t('min')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{recipe.servings}</span>
                </div>
                <span className="capitalize px-2 py-1 bg-olympus-marble rounded text-xs">
                  {recipe.difficulty}
                </span>
              </div>

              {recipe.tags && recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-olympus-gold/20 text-olympus-navy px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
