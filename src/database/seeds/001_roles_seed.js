import db from '../config/db.js';

export default async function () {
  const roles = ['admin', 'medico', 'paciente'];

  const [existing] = await db.query('SELECT name FROM roles');
  const existingNames = existing.map(r => r.name);

  for (const role of roles) {
    if (!existingNames.includes(role)) {
      await db.query('INSERT INTO roles (name) VALUES (?)', [role]);
      console.log(`🎯 Rol creado: ${role}`);
    } else {
      console.log(`⏭️  Rol ya existe: ${role}`);
    }
  }

  console.log('✅ Seeder ejecutado: 001_roles_seed.js');
}
