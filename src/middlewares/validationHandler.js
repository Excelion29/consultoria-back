import { validationResult } from 'express-validator';

export const validationHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      data: null,
      message: 'Errores de validación',
      errors: errors.array(),
    });
  }
  next();
};
