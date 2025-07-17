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

  filterByRole(roleName) {
    if (roleName) {
      this.queryConditions.push(`roles.name LIKE ?`);
      this.queryParams.push(`%${roleName}%`);
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
    
    throw new Error("El usuario ya existe");
  }
}

export default new UserRepository();