export default {
  name: '004_create_appointments_table',
  up: async (db) => {
    // Escribe aquí tu SQL
    await db.query(`
       CREATE TABLE appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status ENUM('pendiente', 'confirmada', 'reprogramada', 'cancelada', 'completada') DEFAULT 'pendiente',
        current_reason TEXT,
        current_diagnosis TEXT,
        is_deleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id),
        FOREIGN KEY (doctor_id) REFERENCES users(id)
      );
    `);
  }
};
