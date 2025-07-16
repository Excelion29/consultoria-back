export default {
  name: '001_create_users_table',
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        number VARCHAR(20),
        email VARCHAR(100) NOT NULL UNIQUE,
        dni VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        
        is_active BOOLEAN DEFAULT true,
        is_deleted BOOLEAN DEFAULT false,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      )
    `);
  }
};
