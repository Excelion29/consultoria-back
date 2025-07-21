import db from "../database/config/db.js";

class DoctorRepository {
  async findDoctorsByTimeRange(weekday, startTime, endTime) {
    const [doctors] = await db.query(
      `
      SELECT DISTINCT u.id, u.name, u.email, u.dni
      FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN doctor_availabilities da ON da.doctor_id = u.id
      WHERE 
        r.name = 'medico'
        AND u.is_deleted = false
        AND da.is_deleted = false
        AND da.weekday = ?
        AND da.start_time <= ?
        AND da.end_time >= ?
    `,
      [weekday, startTime, endTime]
    );

    for (const doctor of doctors) {
      const [specialties] = await db.query(
        `
        SELECT s.id, s.name
        FROM doctor_specialties ds
        JOIN specialties s ON s.id = ds.specialty_id
        WHERE ds.doctor_id = ? AND ds.is_deleted = false
      `,
        [doctor.id]
      );

      doctor.specialties = specialties;
    }

    return doctors;
  }
}
export default new DoctorRepository ();
