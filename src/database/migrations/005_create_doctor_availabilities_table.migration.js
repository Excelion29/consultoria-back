export default {
  name: '005_create_doctor_availabilities_table',
  up: async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctor_availabilities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        weekday TINYINT NOT NULL, -- Aquí está el campo que falta
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }
}
