export default {
  name: '009_create_appointment_history_table',
  up: async (db) => {
    await db.query(`
      CREATE TABLE appointment_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        appointment_id INT NOT NULL,
        changed_by INT NOT NULL,
        status ENUM('pendiente', 'confirmada', 'cancelada', 'completada') NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (appointment_id) REFERENCES appointments(id),
        FOREIGN KEY (changed_by) REFERENCES users(id)
      );
    `);
  }
};
