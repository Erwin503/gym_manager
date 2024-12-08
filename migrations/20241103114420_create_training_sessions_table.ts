import { Knex } from 'knex';

export const up = async function (knex: Knex) {
  await knex.schema.createTable("TrainingSessions", (table) => {
    table.increments("id").primary(); // Уникальный идентификатор
    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("Users")
      .onDelete("CASCADE"); // Ссылка на пользователя
    table
      .integer("working_hour_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("TrainerWorkingHours")
      .onDelete("CASCADE"); // Ссылка на рабочий час
    table
      .integer("gym_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("Gyms")
      .onDelete("CASCADE"); // Ссылка на зал
    table
      .enu("status", ["booked", "completed", "canceled"])
      .notNullable()
      .defaultTo("booked"); // Статус сессии
    table.string("training_type", 100).nullable(); // Тип тренировки
    table.text("comments").nullable(); // Комментарии
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  });
};

export const down = async function (knex: Knex) {
  await knex.schema.dropTableIfExists("TrainingSessions");
};
