export default {
  name: "006_create_specialties_table",
  up: async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS specialties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS doctor_specialties (
        doctor_id INT NOT NULL,
        specialty_id INT NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (doctor_id, specialty_id),
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE CASCADE
      )
    `);
  },
};
