exports.seed = async function (knex) {
    await knex('Memberships').del();
    await knex('Memberships').insert([
      {
        id: 1,
        user_id: 4,
        gym_id: 1,
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        sessions_included: 12,
        sessions_used: 2,
        created_at: new Date(),
      },
    ]);
  };
  