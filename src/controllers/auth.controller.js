import AuthService from '../services/auth.service.js';

class AuthController {
  
  authService = AuthService;

  login = async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await this.authService.login(email, password);

      res.status(200).json({
        data: result,
        message: 'Inicio de sesión exitoso',
      });
    } catch (err) {
      res.status(401).json({
        data: null,
        message: err.message || 'Credenciales inválidas',
      });
    }
  };

  refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;
      const result = await this.authService.refreshTokenService(refreshToken);

      res.json({
        data: result,
        message: 'Nuevo token generado exitosamente',
      });
    } catch (err) {
      res.status(401).json({
        data: null,
        message: err.message || 'Refresh token inválido o expirado',
      });
    }
  };

  me = async (req, res) => {
    try {
      const user = await this.authService.getProfile(req.user.id);

      res.json({
        data: user,
        message: 'Perfil obtenido correctamente',
      });
    } catch (err) {
      res.status(404).json({
        data: null,
        message: 'Usuario no encontrado',
      });
    }
  };

  logout = async (req, res) => {
    try {
      await this.authService.logout(req.user.id);

      res.json({
        data: null,
        message: 'Sesión cerrada correctamente',
      });
    } catch (err) {
      res.status(500).json({
        data: null,
        message: 'Error al cerrar sesión',
      });
    }
  };
}

export default new AuthController();
