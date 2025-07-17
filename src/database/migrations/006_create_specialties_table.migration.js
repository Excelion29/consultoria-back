export default {
  name: "006_create_specialties_table",
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS specialties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE
      )
    `);
    
    await db.query(`
      ALTER TABLE users
      ADD COLUMN specialty_id INT DEFAULT NULL,
      ADD CONSTRAINT fk_user_specialty
        FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL
    `);
  },
};
