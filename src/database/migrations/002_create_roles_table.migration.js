export default {
  name: '002_create_roles_table',
  up: async (db) => {
    // Crear tabla roles
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Agregar columna role_id a users
    await db.query(`
      ALTER TABLE users
      ADD COLUMN role_id INT,
      ADD CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
        ON DELETE SET NULL
    `);
  }
};
