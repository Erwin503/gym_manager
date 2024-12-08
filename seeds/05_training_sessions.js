exports.seed = async function(knex) {
  await knex('TrainingSessions').del();

  await knex('TrainingSessions').insert([
    {
      user_id: 1,
      working_hour_id: 2,
      gym_id: 1,
      status: 'booked',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      user_id: 2,
      working_hour_id: 1,
      gym_id: 2,
      status: 'booked',
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);
};