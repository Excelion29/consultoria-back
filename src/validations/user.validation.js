import { check, body } from 'express-validator';
import { timeRegex } from '../utils/regex.js'

export const createAdminValidation = [
  check('name').notEmpty().withMessage('El nombre es obligatorio'),
  check('email').isEmail().withMessage('Email inválido'),
  check('dni')
    .notEmpty().withMessage('El DNI es obligatorio')
    .isLength({ min: 7, max: 10 }).withMessage('El DNI debe tener entre 7 y 10 dígitos'),
];

export const createPatientValidation = [
  check('name').notEmpty().withMessage('El nombre es obligatorio'),
  check('email').optional().isEmail().withMessage('Email inválido'),
  check('dni')
    .notEmpty().withMessage('El DNI es obligatorio')
    .isLength({ min: 7, max: 10 }).withMessage('El DNI debe tener entre 7 y 10 dígitos'),
];

export const createDoctorValidation = [
  check('name').notEmpty().withMessage('El nombre es obligatorio'),
  check('email').isEmail().withMessage('Email inválido'),
  check('dni').notEmpty().withMessage('El DNI es obligatorio')
    .isLength({ min: 7, max: 10 }).withMessage('El DNI debe tener entre 7 y 10 dígitos'),

  check('specialties').optional().isArray().withMessage('Las especialidades deben enviarse como arreglo'),
  check('specialties.*').optional().isInt().withMessage('Cada ID de especialidad debe ser un número'),

  check('availability').optional().isArray().withMessage('La disponibilidad debe enviarse como arreglo'),
  check('availability.*.weekday').optional().isInt({ min: 0, max: 6 }),
  check('availability.*.start_time').optional().matches(timeRegex).withMessage('Hora inválida, formato HH:mm'),
  check('availability.*.end_time').optional().matches(timeRegex).withMessage('Hora inválida, formato HH:mm'),
];

export const paginatedListValidation = [
  body('filters').optional().isObject().withMessage('Los filtros deben ser un objeto'),

  body('filters.name')
    .optional()
    .isString().withMessage('El nombre debe ser un texto'),

  body('filters.dni')
    .optional()
    .isString().withMessage('El DNI debe ser un texto'),

  body('filters.rol')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') return true;
      if (Array.isArray(value)) return value.every(r => typeof r === 'string');
      throw new Error('El rol debe ser un string o un arreglo de strings');
    }),

  body('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La página debe ser un número entero mayor a 0'),

  body('limit')
    .optional()
    .isInt({ min: 1 }).withMessage('El límite debe ser un número entero mayor a 0'),
];

export const updateUserValidation = [
  check('name').optional().isString().withMessage('El nombre debe ser un texto'),
  check('email').optional().isEmail().withMessage('Email inválido'),

  check('specialties').optional().isArray().withMessage('Las especialidades deben ser un arreglo'),
  check('specialties.*').optional().isInt().withMessage('Cada ID de especialidad debe ser numérico'),

  check('availability').optional().isArray().withMessage('La disponibilidad debe ser un arreglo'),
  check('availability.*.weekday').optional().isInt({ min: 0, max: 6 }),
  check('availability.*.start_time').optional().matches(timeRegex).withMessage('Hora inválida, formato HH:mm'),
  check('availability.*.end_time').optional().matches(timeRegex).withMessage('Hora inválida, formato HH:mm'),
];
