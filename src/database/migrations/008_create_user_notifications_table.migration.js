export default {
  name: "008_create_user_notifications_table",
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        notification_id INT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_user_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_notification_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
      )
    `);
  },
};
