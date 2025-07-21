import { check } from 'express-validator';

export const loginValidation = [
  check('identifier')
    .notEmpty()
    .withMessage('El identificador (email o DNI) es obligatorio'),
  check('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 7 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const refreshTokenValidation = [
  check('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es obligatorio')
    .isString()
    .withMessage('El refresh token debe ser un string'),
];
