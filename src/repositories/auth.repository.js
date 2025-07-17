import db from "../database/config/db.js";

class AuthRepository {
  async getRoleIdByName(roleName) {
    const [rows] = await db.query(
      `SELECT id FROM roles WHERE name = ? LIMIT 1`,
      [roleName]
    );

    if (rows.length === 0) {
      throw new Error(`Rol '${roleName}' no encontrado`);
    }

    return rows[0].id;
  }

  async findUserByEmail(email) {
    const [rows] = await db.query(
      `
      SELECT users.*, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.email = ? AND users.is_deleted = false
    `,
      [email]
    );

    return rows[0];
  }

  async findUserByDNI(dni) {
    const [rows] = await db.query(
      `
      SELECT users.*, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.dni = ? AND users.is_deleted = false
    `,
      [dni]
    );

    return rows[0];
  }

  async findUserById(id) {
    const [rows] = await db.query(
      `
      SELECT users.id, users.name, users.email, users.dni, users.role_id, roles.name AS role
      FROM users
      JOIN roles ON users.role_id = roles.id
      WHERE users.id = ? AND users.is_deleted = false
    `,
      [id]
    );

    return rows[0];
  }

  async saveUserTokens(userId, accessToken, refreshToken) {
    await db.query(
      "INSERT INTO user_tokens (user_id, access_token, refresh_token) VALUES (?, ?, ?)",
      [userId, accessToken, refreshToken]
    );
  }

  async existsToken(token) {
    const [rows] = await db.query(
      "SELECT * FROM user_tokens WHERE access_token = ?",
      [token]
    );
    return rows.length > 0;
  }

  async existsRefreshToken(token) {
    const [rows] = await db.query(
      "SELECT * FROM user_tokens WHERE refresh_token = ?",
      [token]
    );
    return rows.length > 0;
  }

  async deleteUserTokens(userId) {
    await db.query("DELETE FROM user_tokens WHERE user_id = ?", [userId]);
  }
}

export default new AuthRepository();
