import db from '../database/config/db.js';

export async function findUserByEmail(email) {
  const [rows] = await db.query(`
    SELECT users.*, roles.name as role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.email = ? AND users.is_deleted = false
  `, [email]);

  return rows[0];
}

export async function findUserByDNI(dni) {
  const [rows] = await db.query(`
    SELECT users.*, roles.name as role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.dni = ? AND users.is_deleted = false
  `, [dni]);

  return rows[0];
}

export async function findUserById(id) {
  const [rows] = await db.query(`
    SELECT users.id, users.name, email, dni, role_id, roles.name as role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.id = ?
  `, [id]);

  return rows[0];
}

export async function saveUserTokens(userId, accessToken, refreshToken) {
  await db.query(
    'INSERT INTO user_tokens (user_id, access_token, refresh_token) VALUES (?, ?, ?)',
    [userId, accessToken, refreshToken]
  );
}

export async function existsToken(token) {
  const [rows] = await db.query('SELECT * FROM user_tokens WHERE access_token = ?', [token]);
  return rows.length > 0;
}

export async function existsRefreshToken(token) {
  const [rows] = await db.query('SELECT * FROM user_tokens WHERE refresh_token = ?', [token]);
  return rows.length > 0;
}

export async function deleteUserTokens(userId) {
  await db.query('DELETE FROM user_tokens WHERE user_id = ?', [userId]);
}