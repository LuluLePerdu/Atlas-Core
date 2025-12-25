const db = require('../config/database');

class Template {
  static async create(templateData) {
    const [template] = await db('week_templates')
      .insert({
        ...templateData,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    return template;
  }

  static async findById(id) {
    return await db('week_templates').where({ id }).first();
  }

  static async findByUser(userId) {
    return await db('week_templates')
      .where({ user_id: userId })
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'desc');
  }

  static async findDefault(userId) {
    return await db('week_templates')
      .where({ user_id: userId, is_default: true })
      .first();
  }

  static async update(id, updates) {
    const [template] = await db('week_templates')
      .where({ id })
      .update({
        ...updates,
        updated_at: new Date()
      })
      .returning('*');
    return template;
  }

  static async setDefault(userId, templateId) {
    await db('week_templates')
      .where({ user_id: userId })
      .update({ is_default: false });

    return await this.update(templateId, { is_default: true });
  }

  static async delete(id) {
    return await db('week_templates').where({ id }).del();
  }
}

module.exports = Template;
