export default {
  name: '005_create_doctor_availabilities_table',
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctor_availabilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        day_of_week TINYINT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_availability_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }
};
