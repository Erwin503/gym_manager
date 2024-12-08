import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Memberships', (table) => {
    table.increments('id').primary();
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('Users')
      .onDelete('CASCADE');
    table
      .integer('gym_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('Gyms')
      .onDelete('CASCADE');
    table.timestamp('start_date').notNullable();
    table.timestamp('end_date').notNullable();
    table.integer('sessions_included');
    table.integer('sessions_used').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('Memberships');
}
