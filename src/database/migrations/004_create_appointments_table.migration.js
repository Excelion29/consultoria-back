export default {
  name: '004_create_appointments_table',
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        status ENUM('pendiente', 'confirmada', 'cancelada', 'reprogramada', 'completada') DEFAULT 'pendiente',
        reason TEXT,
        diagnosis TEXT DEFAULT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
  }
};
