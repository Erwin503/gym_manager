exports.seed = async function (knex) {
    await knex('Payments').del();
    await knex('Payments').insert([
      {
        id: 1,
        user_id: 4,
        gym_id: 1,
        amount: 150.0,
        payment_method: 'credit_card',
        payment_date: new Date(),
      },
    ]);
  };
  