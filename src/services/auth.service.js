import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken, verifyRefreshToken  } from '../utils/jwt.js';
import {
  findUserByEmail,
  findUserById,
  existsRefreshToken,
  deleteUserTokens,
  saveUserTokens
} from '../repositories/auth.repository.js';

export async function login(email, password) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Usuario no encontrado');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Contraseña incorrecta');

  await deleteUserTokens(user.id);

  const token = generateToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

  await saveUserTokens(user.id, token, refreshToken);

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      dni: user.dni,
      role: user.role
    }
  };
}

export async function refreshTokenService(refreshToken) {
  const validInDB = await existsRefreshToken(refreshToken);
  if (!validInDB) throw new Error('Refresh token no registrado');

  const decoded = verifyRefreshToken(refreshToken);
  const user = await findUserById(decoded.id);
  if (!user) throw new Error('Usuario no encontrado');

  await deleteUserTokens(user.id);

  const newAccessToken = generateToken({ id: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });

  await saveUserTokens(user.id, newAccessToken, newRefreshToken);

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function getProfile(userId) {
  const user = await findUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  return user;
}

export async function logout(userId) {
  await deleteUserTokens(userId);
}