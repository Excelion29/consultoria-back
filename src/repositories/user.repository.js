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
      this.queryConditions.push(`(users.name LIKE ? OR users.dni LIKE ?)`);
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
      WHERE users.is_deleted = false
      ${whereClause ? `AND ${whereClause.slice(6)}` : ""}
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
      WHERE users.is_deleted = false
      ${whereClause ? `AND ${whereClause.slice(6)}` : ""}
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
    const user = await this.findByEmail(email);

    if (!user) {
      return await this._insertUser({ name, email, dni, password, roleId });
    }

    if (user.is_deleted) {
      return await this._reactivateUser({ name, dni, password, roleId, email });
    }

    throw new Error("El usuario ya existe");
  }

  async findByEmail(email) {
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    return rows[0] || null;
  }

  async _insertUser({ name, email, dni, password, roleId }) {
    const [result] = await db.query(
      `
    INSERT INTO users (name, email, dni, password, role_id, is_active, is_deleted)
    VALUES (?, ?, ?, ?, ?, true, false)
    `,
      [name, email, dni, password, roleId]
    );

    return await this.findById(result.insertId);
  }

  async _reactivateUser({ name, dni, password, roleId, email }) {
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

    const user = await this.findByEmail(email);
    return await this.findById(user.id);
  }

  async syncSpecialties(doctorId, specialties = []) {
    const [current] = await db.query(
      `SELECT specialty_id, is_deleted FROM doctor_specialties WHERE doctor_id = ?`,
      [doctorId]
    );

    const currentMap = new Map(
      current.map((row) => [row.specialty_id, row.is_deleted])
    );

    for (const sid of specialties) {
      if (currentMap.has(sid)) {
        if (currentMap.get(sid)) {
          await db.query(
            `UPDATE doctor_specialties SET is_deleted = false WHERE doctor_id = ? AND specialty_id = ?`,
            [doctorId, sid]
          );
        }
      } else {
        await db.query(
          `INSERT INTO doctor_specialties (doctor_id, specialty_id, is_deleted) VALUES (?, ?, false)`,
          [doctorId, sid]
        );
      }
    }

    const toDelete = [...currentMap.keys()].filter(
      (id) => !specialties.includes(id)
    );
    if (toDelete.length > 0) {
      await db.query(
        `UPDATE doctor_specialties SET is_deleted = true 
         WHERE doctor_id = ? AND specialty_id IN (${toDelete
           .map(() => "?")
           .join(",")})`,
        [doctorId, ...toDelete]
      );
    }
  }

  async syncAvailability(doctorId, availability = []) {
    const [current] = await db.query(
      `SELECT id, weekday, start_time, end_time, is_deleted FROM doctor_availabilities WHERE doctor_id = ?`,
      [doctorId]
    );

    const currentList = current.map((a) => ({
      ...a,
      key: `${a.weekday}-${a.start_time}-${a.end_time}`,
    }));

    const incomingKeys = new Set(
      availability.map((a) => `${a.weekday}-${a.start_time}-${a.end_time}`)
    );

    for (const a of availability) {
      const match = currentList.find(
        (c) => c.key === `${a.weekday}-${a.start_time}-${a.end_time}`
      );
      if (match) {
        if (match.is_deleted) {
          await db.query(
            `UPDATE doctor_availabilities SET is_deleted = false WHERE id = ?`,
            [match.id]
          );
        }
      } else {
        await db.query(
          `INSERT INTO doctor_availabilities (doctor_id, weekday, start_time, end_time, is_deleted)
           VALUES (?, ?, ?, ?, false)`,
          [doctorId, a.weekday, a.start_time, a.end_time]
        );
      }
    }

    const toDelete = currentList.filter((c) => !incomingKeys.has(c.key));
    if (toDelete.length > 0) {
      await db.query(
        `UPDATE doctor_availabilities SET is_deleted = true 
         WHERE id IN (${toDelete.map(() => "?").join(",")})`,
        toDelete.map((a) => a.id)
      );
    }
  }

  async findById(id) {
    const [rows] = await db.query(
      `
      SELECT users.id, users.name, users.email, users.dni, roles.name AS role, users.is_active
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = ? AND users.is_deleted = false
    `,
      [id]
    );

    if (rows.length === 0) return null;

    const user = rows[0];

    if (user.role === "medico") {
      const [specialties] = await db.query(
        `
        SELECT s.id, s.name
        FROM doctor_specialties ds
        JOIN specialties s ON s.id = ds.specialty_id
        WHERE ds.doctor_id = ? AND ds.is_deleted = false
      `,
        [id]
      );

      const [availability] = await db.query(
        `
        SELECT weekday, start_time, end_time
        FROM doctor_availabilities
        WHERE doctor_id = ? AND is_deleted = false
      `,
        [id]
      );

      user.specialties = specialties;
      user.availability = availability;
    }

    return user;
  }

  async updateUser(userId, data) {
    const allowedFields = ["name", "email", "is_active"];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (field in data) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    }

    if (updates.length === 0) {
      throw new Error("No hay campos válidos para actualizar");
    }

    values.push(userId);

    await db.query(
      `
    UPDATE users
    SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND is_deleted = false
    `,
      values
    );

    return await this.findById(userId);
  }

  async softDeleteUser(userId) {
    await db.query(
      `
      UPDATE users
      SET is_deleted = true, is_active = false, deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = false
      `,
      [userId]
    );

    return { success: true };
  }

}

export default new UserRepository();
