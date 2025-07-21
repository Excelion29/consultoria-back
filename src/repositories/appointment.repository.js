import db from "../database/config/db.js";

class AppointmentRepository {
  constructor() {
    this.queryConditions = [];
    this.queryParams = [];
  }

  resetQuery() {
    this.queryConditions = [];
    this.queryParams = [];
    return this;
  }

  filterByStatus(status) {
    if (status) {
      this.queryConditions.push(`a.status = ?`);
      this.queryParams.push(status);
    }
    return this;
  }

  filterByDoctorName(name) {
    if (name) {
      this.queryConditions.push(`d.name LIKE ?`);
      this.queryParams.push(`%${name}%`);
    }
    return this;
  }

  filterByDate(date) {
    if (date) {
      this.queryConditions.push(`a.appointment_date = ?`);
      this.queryParams.push(date);
    }
    return this;
  }

  filterByTime(time) {
    if (time) {
      this.queryConditions.push(`a.appointment_time = ?`);
      this.queryParams.push(time);
    }
    return this;
  }

  filterByUserRole(role, userId) {
    if (role === "medico") {
      this.queryConditions.push(`a.doctor_id = ?`);
      this.queryParams.push(userId);
    } else if (role === "paciente") {
      this.queryConditions.push(`a.patient_id = ?`);
      this.queryParams.push(userId);
    }
    return this;
  }

  async getPaginatedResults(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const whereClause = this.queryConditions.length
      ? `WHERE ${this.queryConditions.join(" AND ")}`
      : "";

    const [appointments] = await db.query(
      `
      SELECT a.id, a.appointment_date, a.appointment_time, a.status,
             a.current_reason, a.current_diagnosis,
             p.name AS patient_name, d.name AS doctor_name
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT ? OFFSET ?
    `,
      [...this.queryParams, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN users d ON a.doctor_id = d.id
      ${whereClause}
    `,
      this.queryParams
    );

    return {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      data: appointments,
    };
  }

  async createAppointment({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
  }) {
    const [result] = await db.query(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, current_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, doctorId, appointmentDate, appointmentTime, reason]
    );

    return result.insertId;
  }

  async addHistory({ appointmentId, changedBy, status, comment }) {
    await db.query(
      `INSERT INTO appointment_history (appointment_id, changed_by, status, comment)
       VALUES (?, ?, ?, ?)`,
      [appointmentId, changedBy, status, comment]
    );
  }

  async checkDoctorExists(doctorId) {
    const [rows] = await db.query(
      `SELECT id FROM users WHERE id = ? AND role_id = (SELECT id FROM roles WHERE name = 'medico') AND is_deleted = false`,
      [doctorId]
    );
    return rows.length > 0;
  }

  async checkDoctorAvailability(doctorId, weekday, time) {
    const [rows] = await db.query(
      `SELECT * FROM doctor_availabilities
       WHERE doctor_id = ? AND weekday = ?
       AND start_time <= ? AND end_time >= ?
       AND is_deleted = false`,
      [doctorId, weekday, time, time]
    );

    return rows.length > 0;
  }

  async checkOverlappingWithDuration(doctorId, date, startTime, endTime) {
    const [rows] = await db.query(
      `SELECT * FROM appointments
     WHERE doctor_id = ? 
     AND appointment_date = ? 
     AND is_deleted = false
     AND status IN ('pendiente', 'confirmada')
     AND (
       (appointment_time >= ? AND appointment_time < ?)
       OR
       (ADDTIME(appointment_time, '00:30:00') > ? AND appointment_time <= ?)
     )`,
      [doctorId, date, startTime, endTime, startTime, startTime]
    );
    return rows.length > 0;
  }

  async getAppointmentById(appointmentId) {
    const [[appointment]] = await db.query(
      `SELECT a.*, 
            p.name AS patient_name, 
            d.name AS doctor_name 
     FROM appointments a
     JOIN users p ON a.patient_id = p.id
     JOIN users d ON a.doctor_id = d.id
     WHERE a.id = ? AND a.is_deleted = false`,
      [appointmentId]
    );

    if (!appointment) return null;

    const [history] = await db.query(
      `SELECT ah.*, u.name AS changed_by_name
     FROM appointment_history ah
     JOIN users u ON ah.changed_by = u.id
     WHERE ah.appointment_id = ?
     ORDER BY ah.created_at ASC`,
      [appointmentId]
    );

    appointment.history = history;
    return appointment;
  }
}

export default new AppointmentRepository();
