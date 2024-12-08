exports.seed = async function (knex) {
    await knex('TrainersDetails').del();
    await knex('TrainersDetails').insert([
      {
        id: 1,
        user_id: 3, // Ссылка на пользователя с ролью "trainer"
        specialization: 'Силовые тренировки',
        experience_years: 5,
        bio: 'Очень очень опытный малый',
        certifications: 'Сертифицированный тренер',
        photo_url: 'https://example.com/photo1.jpg',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  };
  