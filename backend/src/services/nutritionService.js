/**
 * Nutrition Service - Calculate macros from ingredients
 * Uses local database + Open Food Facts API fallback
 */

const axios = require('axios');
const db = require('../config/database');

class NutritionService {
  constructor() {
    this.OPEN_FOOD_FACTS_API = 'https://world.openfoodfacts.org/api/v2/search';
    this.cache = new Map(); // Cache for API results
  }

  /**
   * Find ingredient nutrition from database first, then API fallback
   */
  async findIngredient(name) {
    const normalized = name.toLowerCase().trim();
    
    // Try local database first (fast, no rate limit)
    const dbResult = await db('ingredients')
      .whereRaw('LOWER(name) = ? OR LOWER(name_fr) = ? OR LOWER(name_en) = ?', 
        [normalized, normalized, normalized])
      .first();

    if (dbResult) {
      return {
        calories: parseFloat(dbResult.calories_per_100g),
        protein: parseFloat(dbResult.protein_per_100g),
        carbs: parseFloat(dbResult.carbs_per_100g),
        fat: parseFloat(dbResult.fat_per_100g),
        source: 'database'
      };
    }

    // Partial match in database
    const partialMatch = await db('ingredients')
      .whereRaw('LOWER(name) LIKE ? OR LOWER(name_fr) LIKE ? OR LOWER(name_en) LIKE ?',
        [`%${normalized}%`, `%${normalized}%`, `%${normalized}%`])
      .first();

    if (partialMatch) {
      return {
        calories: parseFloat(partialMatch.calories_per_100g),
        protein: parseFloat(partialMatch.protein_per_100g),
        carbs: parseFloat(partialMatch.carbs_per_100g),
        fat: parseFloat(partialMatch.fat_per_100g),
        source: 'database-partial'
      };
    }

    // Fallback to Open Food Facts API (only if not found in DB)
    // This respects rate limits by using DB as primary source
    const apiResult = await this.searchOpenFoodFacts(normalized);
    if (apiResult) {
      return apiResult;
    }

    return null;
  }

  /**
   * Search Open Food Facts API (only as fallback, respects rate limits)
   */
  async searchOpenFoodFacts(ingredientName) {
    const cacheKey = ingredientName.toLowerCase();
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await axios.get(this.OPEN_FOOD_FACTS_API, {
        params: {
          search_terms: ingredientName,
          page_size: 3,
          fields: 'product_name,nutriments'
        },
        headers: {
          'User-Agent': 'AtlasCore/1.0 (contact@atlascore.app)'
        },
        timeout: 5000
      });

      if (response.data && response.data.products && response.data.products.length > 0) {
        const product = response.data.products[0];
        const nutriments = product.nutriments;

        if (nutriments && (nutriments['energy-kcal_100g'] || nutriments['energy_100g'])) {
          const nutritionData = {
            calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy_100g'] / 4.184 || 0),
            protein: Math.round((nutriments['proteins_100g'] || 0) * 10) / 10,
            carbs: Math.round((nutriments['carbohydrates_100g'] || 0) * 10) / 10,
            fat: Math.round((nutriments['fat_100g'] || 0) * 10) / 10,
            source: 'OpenFoodFacts'
          };

          this.cache.set(cacheKey, nutritionData);
          return nutritionData;
        }
      }

      return null;
    } catch (error) {
      console.error(`Open Food Facts API error: ${error.message}`);
      return null;
    }
  }

  /**
   * Parse quantity string to grams
   */
  parseQuantityToGrams(quantity, unit, ingredientName) {
    let grams = 0;
    const qty = parseFloat(quantity) || 1;
    
    // Common conversions to grams
    const conversions = {
      'g': 1,
      'gram': 1,
      'gramme': 1,
      'kg': 1000,
      'kilogram': 1000,
      'oz': 28.35,
      'lb': 453.59,
      'pound': 453.59,
      'cup': 240, // ml, varies by ingredient
      'tasse': 240,
      'tbsp': 15,
      'c. à soupe': 15,
      'tsp': 5,
      'c. à thé': 5,
      'ml': 1,
      'l': 1000,
      'litre': 1000,
    };
    
    const normalizedUnit = unit?.toLowerCase().trim() || '';
    
    // Find matching conversion
    for (const [key, value] of Object.entries(conversions)) {
      if (normalizedUnit.includes(key)) {
        grams = qty * value;
        break;
      }
    }
    
    // If no unit or "piece", estimate based on ingredient
    if (grams === 0) {
      // Estimate common ingredients by piece
      const pieceEstimates = {
        'egg': 50,
        'oeuf': 50,
        'apple': 182,
        'pomme': 182,
        'banana': 118,
        'banane': 118,
        'potato': 150,
        'tomato': 123,
        'tomate': 123,
        'onion': 110,
        'oignon': 110,
      };
      
      const ingName = ingredientName.toLowerCase();
      for (const [key, value] of Object.entries(pieceEstimates)) {
        if (ingName.includes(key)) {
          grams = qty * value;
          break;
        }
      }
      
      // Default to 100g per piece if unknown
      if (grams === 0) {
        grams = qty * 100;
      }
    }
    
    return grams;
  }

  /**
   * Calculate nutrition for a single ingredient
   */
  async calculateIngredientNutrition(ingredient) {
    const nutritionData = await this.findIngredient(ingredient.name);
    
    if (!nutritionData) {
      return null; // Ingredient not found
    }
    
    const grams = this.parseQuantityToGrams(
      ingredient.quantity,
      ingredient.unit,
      ingredient.name
    );
    
    // Calculate based on 100g reference
    const multiplier = grams / 100;
    
    return {
      ingredient: ingredient.name,
      grams: Math.round(grams),
      calories: Math.round(nutritionData.calories * multiplier),
      protein: Math.round(nutritionData.protein * multiplier * 10) / 10,
      carbs: Math.round(nutritionData.carbs * multiplier * 10) / 10,
      fat: Math.round(nutritionData.fat * multiplier * 10) / 10,
      source: nutritionData.source
    };
  }

  /**
   * Calculate total nutrition for a recipe
   */
  async calculateRecipeNutrition(ingredients, servings = 1) {
    const total = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      foundIngredients: 0,
      totalIngredients: ingredients.length,
      details: []
    };
    
    // Process ingredients in parallel for better performance
    const nutritionResults = await Promise.all(
      ingredients.map(ingredient => this.calculateIngredientNutrition(ingredient))
    );
    
    for (const nutrition of nutritionResults) {
      if (nutrition) {
        total.calories += nutrition.calories;
        total.protein += nutrition.protein;
        total.carbs += nutrition.carbs;
        total.fat += nutrition.fat;
        total.foundIngredients++;
        total.details.push(nutrition);
      }
    }
    
    // Calculate per serving
    const perServing = {
      calories: Math.round(total.calories / servings),
      protein: Math.round((total.protein / servings) * 10) / 10,
      carbs: Math.round((total.carbs / servings) * 10) / 10,
      fat: Math.round((total.fat / servings) * 10) / 10,
    };
    
    return {
      total,
      perServing,
      coverage: `${total.foundIngredients}/${total.totalIngredients} ingredients`,
      details: total.details
    };
  }
}

module.exports = new NutritionService();
