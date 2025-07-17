import bcrypt from "bcrypt";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

import AuthRepository from "../repositories/auth.repository.js";

class AuthService {
  constructor() {
    this.authRepository = AuthRepository;
  }

  async login(identifier, password) {
    let user;

    if (identifier.includes('@')) {
      user = await this.authRepository.findUserByEmail(identifier);
    } else {
      user = await this.authRepository.findUserByDNI(identifier);
    }

    if (!user) throw new Error('Usuario no encontrado');

    const isEmailLogin = identifier.includes('@');
    if (isEmailLogin && user.role === 'paciente') {
      throw new Error('El paciente debe iniciar sesión con su DNI');
    }
    if (!isEmailLogin && user.role !== 'paciente') {
      throw new Error('Solo los pacientes pueden iniciar sesión con DNI');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Contraseña incorrecta');

    await this.authRepository.deleteUserTokens(user.id);

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    await this.authRepository.saveUserTokens(user.id, token, refreshToken);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dni: user.dni,
        role: user.role,
      },
    };
  }

  async refreshTokenService(refreshToken) {
    const validInDB = await this.authRepository.existsRefreshToken(
      refreshToken
    );
    if (!validInDB) throw new Error("Refresh token no registrado");

    const decoded = verifyRefreshToken(refreshToken);
    const user = await this.authRepository.findUserById(decoded.id);
    if (!user) throw new Error("Usuario no encontrado");

    await this.authRepository.deleteUserTokens(user.id);

    const newAccessToken = generateToken({ id: user.id, role: user.role });
    const newRefreshToken = generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    await this.authRepository.saveUserTokens(
      user.id,
      newAccessToken,
      newRefreshToken
    );

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getProfile(userId) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  }

  async logout(userId) {
    await this.authRepository.deleteUserTokens(userId);
  }
}

export default new AuthService();
