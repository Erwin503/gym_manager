exports.seed = async function (knex) {
    await knex('TrainerWorkingHours').del();
    await knex('TrainerWorkingHours').insert([
      {
        id: 1,
        trainer_id: 3, // Ссылка на пользователя с ролью "trainer"
        day_of_week: 'Monday',
        specific_date: null,
        start_time: '09:00',
        end_time: '10:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        trainer_id: 3,
        day_of_week: 'Monday',
        specific_date: null,
        start_time: '10:00',
        end_time: '11:00',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  };
  