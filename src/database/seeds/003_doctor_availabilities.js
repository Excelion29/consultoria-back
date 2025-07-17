import db from '../config/db.js';

export default async function () {
  const [medicos] = await db.query(`
    SELECT users.id, users.name
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE roles.name = 'medico'
  `);

  const horarios = [
    { weekday: 1, start_time: '08:00:00', end_time: '12:00:00' }, // Lunes
    { weekday: 3, start_time: '14:00:00', end_time: '18:00:00' }, // Miércoles
    { weekday: 5, start_time: '08:00:00', end_time: '12:00:00' }, // Viernes
  ];

  for (const medico of medicos) {
    for (const h of horarios) {
      const [exists] = await db.query(
        `
        SELECT id FROM doctor_availabilities
        WHERE doctor_id = ? AND weekday = ? AND start_time = ? AND end_time = ?
        `,
        [medico.id, h.weekday, h.start_time, h.end_time]
      );

      if (exists.length === 0) {
        await db.query(
          `
          INSERT INTO doctor_availabilities (doctor_id, weekday, start_time, end_time)
          VALUES (?, ?, ?, ?)
        `,
          [medico.id, h.weekday, h.start_time, h.end_time]
        );

        console.log(`✅ Disponibilidad registrada para ${medico.name} - Día ${h.weekday}`);
      } else {
        console.log(`⏭️  Ya existe disponibilidad para ${medico.name} - Día ${h.weekday}`);
      }
    }
  }

  console.log('✅ Seeder ejecutado: 003_doctor_availabilities.js');
}
