export default {
  name: "007_create_notifications_table",
  up: async (db) => {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('email', 'pantalla') DEFAULT 'pantalla',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  },
};
