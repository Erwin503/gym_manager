const bcrypt = require('bcryptjs'); // Используем require вместо import

exports.seed = async function (knex) {
  // Удаляем все существующие записи
  await knex('Users').del();

  // Хешируем пароли для пользователей
  const passwordHash = await bcrypt.hash('password123', 10);

  // Вставляем новые записи
  await knex('Users').insert([
    {
      id: 1,
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password_hash: passwordHash,
      phone: '1234567890',
      role: 'super_admin',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: 'Gym Admin',
      email: 'gymadmin@example.com',
      password_hash: passwordHash,
      phone: '1234567891',
      role: 'gym_admin',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: 'Trainer',
      email: 'trainer@example.com',
      password_hash: passwordHash,
      phone: '1234567892',
      role: 'trainer',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 4,
      name: 'User',
      email: 'user@example.com',
      password_hash: passwordHash,
      phone: '1234567893',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
};
