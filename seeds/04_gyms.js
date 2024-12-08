exports.seed = async function (knex) {
    await knex('Gyms').del();
    await knex('Gyms').insert([
      {
        id: 1,
        name: 'City Gym',
        address: '123 Fitness St, Metropolis',
        phone: '1234567894',
        email: 'info@citygym.com',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  };
  