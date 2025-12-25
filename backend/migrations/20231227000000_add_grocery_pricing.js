exports.up = function(knex) {
  return knex.schema
    .alterTable('grocery_lists', (table) => {
      table.decimal('total_spent', 10, 2).nullable()
      table.boolean('is_purchased').defaultTo(false)
      table.timestamp('purchased_at').nullable()
    })
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('grocery_lists', (table) => {
      table.dropColumn('total_spent')
      table.dropColumn('is_purchased')
      table.dropColumn('purchased_at')
    })
};
