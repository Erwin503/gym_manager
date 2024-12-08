import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('Payments', (table) => {
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
    table.decimal('amount', 10, 2).notNullable();
    table.string('payment_method', 50);
    table.timestamp('payment_date').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('Payments');
}
