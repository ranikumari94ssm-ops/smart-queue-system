const bcrypt = require('bcrypt');
const pool = require('./db');

async function seedUsers() {
  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    const users = [
      { name: 'Rani Kumari', email: 'user@test.com', role: 'User', password: passwordHash },
      { name: 'Staff Member', email: 'staff@test.com', role: 'Staff', password: passwordHash },
      { name: 'System Admin', email: 'admin@test.com', role: 'Admin', password: passwordHash },
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (name, email, role, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING`,
        [user.name, user.email, user.role, user.password]
      );
    }
    console.log('Seed users created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
}

seedUsers();
