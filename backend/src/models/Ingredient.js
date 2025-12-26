const db = require('../config/database');

class Ingredient {
  static async create(ingredientData) {
    const [ingredient] = await db('ingredients')
      .insert({
        ...ingredientData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return ingredient;
  }

  static async findById(id) {
    return await db('ingredients').where({ id }).first();
  }

  static async search(query, limit = 20) {
    // Search in name, name_fr, and name_en
    return await db('ingredients')
      .where(function() {
        this.whereRaw('LOWER(name) LIKE ?', [`%${query.toLowerCase()}%`])
          .orWhereRaw('LOWER(name_fr) LIKE ?', [`%${query.toLowerCase()}%`])
          .orWhereRaw('LOWER(name_en) LIKE ?', [`%${query.toLowerCase()}%`]);
      })
      .orderByRaw(`
        CASE 
          WHEN LOWER(name) = ? THEN 1
          WHEN LOWER(name_fr) = ? THEN 1
          WHEN LOWER(name_en) = ? THEN 1
          WHEN LOWER(name) LIKE ? THEN 2
          WHEN LOWER(name_fr) LIKE ? THEN 2
          WHEN LOWER(name_en) LIKE ? THEN 2
          ELSE 3
        END
      `, [
        query.toLowerCase(), query.toLowerCase(), query.toLowerCase(),
        `${query.toLowerCase()}%`, `${query.toLowerCase()}%`, `${query.toLowerCase()}%`
      ])
      .limit(limit);
  }

  static async findByCategory(category) {
    return await db('ingredients')
      .where({ category })
      .orderBy('name');
  }

  static async findPublic() {
    return await db('ingredients')
      .whereNull('user_id')
      .orderBy('name');
  }

  static async findByUser(userId) {
    return await db('ingredients')
      .where({ user_id: userId })
      .orderBy('name');
  }

  static async update(id, updates) {
    const [ingredient] = await db('ingredients')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return ingredient;
  }

  static async delete(id) {
    return await db('ingredients').where({ id }).del();
  }
}

module.exports = Ingredient;
