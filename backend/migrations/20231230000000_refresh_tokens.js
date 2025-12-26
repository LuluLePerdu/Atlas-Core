exports.up = function(knex) {
  return knex.schema.createTable('refresh_tokens', table => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('token').notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.string('ip_address', 45);
    table.text('user_agent');
    table.boolean('revoked').defaultTo(false);
    table.timestamp('revoked_at');
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('token');
    table.index('expires_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('refresh_tokens');
};
