import * as authService from '../services/auth.service.js';

export async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await authService.login(email, password);

    res.status(200).json({
      data: result,
      message: 'Inicio de sesión exitoso'
    });
  } catch (err) {
    res.status(401).json({
      data: null,
      message: err.message || 'Credenciales inválidas'
    });
  }
}

export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshTokenService(refreshToken);

    res.json({
      data: result,
      message: 'Nuevo token generado exitosamente'
    });
  } catch (err) {
    res.status(401).json({
      data: null,
      message: err.message || 'Refresh token inválido o expirado'
    });
  }
}

export async function me(req, res) {
  try {
    const user = await authService.getProfile(req.user.id);

    res.json({
      data: user,
      message: 'Perfil obtenido correctamente'
    });
  } catch (err) {
    res.status(404).json({
      data: null,
      message: 'Usuario no encontrado'
    });
  }
}

export async function logout(req, res) {
  try {
    await authService.logout(req.user.id);

    res.json({
      data: null,
      message: 'Sesión cerrada correctamente'
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      message: 'Error al cerrar sesión'
    });
  }
}