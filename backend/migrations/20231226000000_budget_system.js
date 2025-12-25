exports.up = function(knex) {
  return knex.schema
    // Budget categories
    .createTable('budget_categories', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.enu('type', ['income', 'expense']).notNullable()
      table.string('color').defaultTo('#3498db')
      table.string('icon').nullable()
      table.boolean('is_default').defaultTo(false)
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.index(['user_id', 'type'])
    })
    
    // Transactions
    .createTable('transactions', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('category_id').nullable().references('id').inTable('budget_categories').onDelete('SET NULL')
      table.decimal('amount', 10, 2).notNullable()
      table.enu('type', ['income', 'expense']).notNullable()
      table.string('description').notNullable()
      table.date('transaction_date').notNullable()
      table.string('source').nullable() // e.g., 'manual', 'grocery_list'
      table.uuid('source_id').nullable() // reference to grocery list or other source
      table.text('notes').nullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.index(['user_id', 'transaction_date'])
      table.index(['user_id', 'type'])
      table.index(['category_id'])
    })
    
    // Monthly budgets
    .createTable('monthly_budgets', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('category_id').notNullable().references('id').inTable('budget_categories').onDelete('CASCADE')
      table.integer('month').notNullable() // 1-12
      table.integer('year').notNullable()
      table.decimal('budget_amount', 10, 2).notNullable()
      table.timestamp('created_at').defaultTo(knex.fn.now())
      table.timestamp('updated_at').defaultTo(knex.fn.now())
      table.unique(['user_id', 'category_id', 'month', 'year'])
      table.index(['user_id', 'month', 'year'])
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('monthly_budgets')
    .dropTableIfExists('transactions')
    .dropTableIfExists('budget_categories')
};
