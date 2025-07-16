import db from '../config/db.js';
import bcrypt from 'bcrypt';

export default async function () {
  const [rows] = await db.query('SELECT id, name FROM roles');
  const roleMap = Object.fromEntries(rows.map(r => [r.name, r.id]));

  const users = [
    {
      name: 'Administrador Principal',
      email: 'admin@example.com',
      dni: '12345678',
      password: await bcrypt.hash('12345678', 10),
      role: 'admin'
    },
    {
      name: 'Dr. Juan Médico',
      email: 'medico@example.com',
      dni: '87654321',
      password: await bcrypt.hash('87654321', 10),
      role: 'medico'
    },
    {
      name: 'Paciente Pérez',
      email: 'paciente@example.com',
      dni: '11223344',
      password: await bcrypt.hash('11223344', 10),
      role: 'paciente'
    }
  ];

  for (const user of users) {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [user.email]);
    if (existing.length === 0) {
      await db.query(`
        INSERT INTO users (name, email, dni, password, role_id, is_active, is_deleted)
        VALUES (?, ?, ?, ?, ?, true, false)
      `, [user.name, user.email, user.dni, user.password, roleMap[user.role]]);
      console.log(`✅ Usuario creado: ${user.name}`);
    } else {
      console.log(`⏭️  Usuario ya existe: ${user.email}`);
    }
  }

  console.log('✅ Seeder ejecutado: 002_users_seed.js');
}
