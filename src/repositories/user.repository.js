import db from "../database/config/db.js";

class UserRepository {
  constructor() {
    this.queryConditions = [];
    this.queryParams = [];
  }

  resetQuery() {
    this.queryConditions = [];
    this.queryParams = [];
    return this;
  }

  filterByName(name) {
    if (name) {
      this.queryConditions.push(`(users.name LIKE ? or users.dni LIKE ?)`);
      this.queryParams.push(`%${name}%`, `%${name}%`);
    }
    return this;
  }

  filterByDNI(dni) {
    if (dni) {
      this.queryConditions.push(`users.dni LIKE ?`);
      this.queryParams.push(`%${dni}%`);
    }
    return this;
  }

  filterByRole(roleNameOrArray) {
    if (Array.isArray(roleNameOrArray) && roleNameOrArray.length > 0) {
      const placeholders = roleNameOrArray.map(() => "?").join(",");
      this.queryConditions.push(`roles.name IN (${placeholders})`);
      this.queryParams.push(...roleNameOrArray);
    } else if (typeof roleNameOrArray === "string") {
      this.queryConditions.push(`roles.name LIKE ?`);
      this.queryParams.push(`%${roleNameOrArray}%`);
    }
    return this;
  }

  async getPaginatedResults(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const whereClause = this.queryConditions.length
      ? `WHERE ${this.queryConditions.join(" AND ")}`
      : "";

    const [users] = await db.query(
      `
      SELECT users.id, users.name, users.email, users.dni, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      ${whereClause}
      ORDER BY users.id DESC
      LIMIT ? OFFSET ?
    `,
      [...this.queryParams, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM users
      JOIN roles ON users.role_id = roles.id
      ${whereClause}
    `,
      this.queryParams
    );

    return {
      total,
      page,
      limit,
      lastPage: Math.ceil(total / limit),
      data: users,
    };
  }

  async saveUser(name, email, dni, password, roleId) {
    const [existing] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (existing.length === 0) {
      // Insertar nuevo usuario
      const [result] = await db.query(
        `
      INSERT INTO users (name, email, dni, password, role_id, is_active, is_deleted)
      VALUES (?, ?, ?, ?, ?, true, false)
      `,
        [name, email, dni, password, roleId]
      );

      const insertedId = result.insertId;

      const [user] = await db.query(
        `SELECT id, name, email, dni, role_id FROM users WHERE id = ?`,
        [insertedId]
      );

      return user[0];
    }

    const user = existing[0];

    if (user.is_deleted) {
      await db.query(
        `
      UPDATE users
      SET 
        name = ?, 
        dni = ?, 
        password = ?, 
        role_id = ?, 
        is_active = true, 
        is_deleted = false,
        deleted_at = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
      `,
        [name, dni, password, roleId, email]
      );

      const [updatedUser] = await db.query(
        `SELECT id, name, email, dni, role_id FROM users WHERE email = ?`,
        [email]
      );

      return updatedUser[0];
    }

    throw new Error("El usuario ya existe");
  }

  async attachSpecialtyToDoctor(doctorId, specialtyId) {
    const [exists] = await db.query(
      `
      SELECT * FROM doctor_specialties WHERE doctor_id = ? AND specialty_id = ?
    `,
      [doctorId, specialtyId]
    );

    if (exists.length === 0) {
      await db.query(
        `
        INSERT INTO doctor_specialties (doctor_id, specialty_id) VALUES (?, ?)
      `,
        [doctorId, specialtyId]
      );
    }
  }

  async saveAvailability(doctorId, weekday, start_time, end_time) {
    const [exists] = await db.query(
      `
      SELECT * FROM doctor_availabilities 
      WHERE doctor_id = ? AND weekday = ? AND start_time = ? AND end_time = ?
    `,
      [doctorId, weekday, start_time, end_time]
    );

    if (exists.length === 0) {
      await db.query(
        `
        INSERT INTO doctor_availabilities (doctor_id, weekday, start_time, end_time)
        VALUES (?, ?, ?, ?)
      `,
        [doctorId, weekday, start_time, end_time]
      );
    }
  }
}

export default new UserRepository();
