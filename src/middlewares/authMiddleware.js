import { verifyToken } from '../utils/jwt.js';
import AuthRepository from '../repositories/auth.repository.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    const isValid = await AuthRepository.existsToken(token);
    if (!isValid) {
      return res.status(401).json({ message: 'Token inválido o revocado' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Usa el refresh token.' });
    }
    return res.status(401).json({ message: 'Token inválido.' });
  }
}