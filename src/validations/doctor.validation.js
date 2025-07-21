import { check } from 'express-validator';

export const availableDoctorsValidation = [
  check('start_time')
    .notEmpty().withMessage('La fecha y hora de inicio es obligatoria')
    .isISO8601().withMessage('La fecha y hora de inicio debe estar en formato ISO 8601'),

  check('end_time')
    .notEmpty().withMessage('La fecha y hora de fin es obligatoria')
    .isISO8601().withMessage('La fecha y hora de fin debe estar en formato ISO 8601'),
];
