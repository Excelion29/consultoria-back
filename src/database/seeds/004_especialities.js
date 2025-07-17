import db from '../config/db.js';

export default async function () {
  const specialties = [
    'Cardiología',
    'Dermatología',
    'Neurología',
    'Pediatría',
    'Oftalmología',
    'Medicina General'
  ];

  for (const name of specialties) {
    const [existing] = await db.query('SELECT * FROM specialties WHERE name = ?', [name]);

    if (existing.length === 0) {
      await db.query('INSERT INTO specialties (name) VALUES (?)', [name]);
      console.log(`✅ Especialidad registrada: ${name}`);
    } else {
      console.log(`⏭️  Especialidad ya existe: ${name}`);
    }
  }

  const [allSpecialties] = await db.query('SELECT id, name FROM specialties');

  const [doctors] = await db.query(`
    SELECT users.id as doctor_id, users.name
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE roles.name = 'medico'
  `);

  for (const doctor of doctors) {
    const random = Math.floor(Math.random() * allSpecialties.length);
    const specialty = allSpecialties[random];

    const [existing] = await db.query(
      'SELECT * FROM doctor_specialties WHERE doctor_id = ? AND specialty_id = ?',
      [doctor.doctor_id, specialty.id]
    );

    if (existing.length === 0) {
      await db.query(
        'INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES (?, ?)',
        [doctor.doctor_id, specialty.id]
      );
      console.log(`✅ Asignada especialidad '${specialty.name}' a ${doctor.name}`);
    } else {
      console.log(`⏭️  ${doctor.name} ya tiene '${specialty.name}'`);
    }
  }

  console.log('✅ Seeder ejecutado: 004_especialities.js');
}
