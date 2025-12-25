const db = require('../config/database');

class Recipe {
  static async create(recipeData) {
    const dataToInsert = {
      ...recipeData,
      ingredients: JSON.stringify(recipeData.ingredients),
      macros_per_serving: recipeData.macros_per_serving ? JSON.stringify(recipeData.macros_per_serving) : null,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const [recipe] = await db('recipes')
      .insert(dataToInsert)
      .returning('*');
    return recipe;
  }

  static async findById(id) {
    return await db('recipes').where({ id }).first();
  }

  static async findByUser(userId, filters = {}) {
    let query = db('recipes').where({ user_id: userId });

    if (filters.tags && filters.tags.length > 0) {
      query = query.whereRaw('tags && ?', [filters.tags]);
    }

    if (filters.difficulty) {
      query = query.where({ difficulty: filters.difficulty });
    }

    return await query.orderBy('name');
  }

  static async update(id, updates) {
    const dataToUpdate = {
      ...updates,
      updated_at: new Date()
    };
    
    if (updates.ingredients) {
      dataToUpdate.ingredients = JSON.stringify(updates.ingredients);
    }
    
    if (updates.macros_per_serving) {
      dataToUpdate.macros_per_serving = JSON.stringify(updates.macros_per_serving);
    }
    
    const [recipe] = await db('recipes')
      .where({ id })
      .update(dataToUpdate)
      .returning('*');
    return recipe;
  }

  static async delete(id) {
    return await db('recipes').where({ id }).del();
  }

  static async findPublic(filters = {}) {
    let query = db('recipes').where({ is_public: true });

    if (filters.tags) {
      query = query.whereRaw('tags && ?', [filters.tags]);
    }

    return await query.orderBy('name');
  }
}

module.exports = Recipe;
