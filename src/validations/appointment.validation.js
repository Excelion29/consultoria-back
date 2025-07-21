import { check, body } from "express-validator";
import { timeRegex, dateRegex } from "../utils/regex.js";

export const createAppointmentValidation = [
  check("doctor_id").isInt().withMessage("El ID del médico debe ser numérico"),

  check("appointment_date")
    .matches(dateRegex)
    .withMessage("Fecha inválida, formato requerido YYYY-MM-DD"),

  check("appointment_time")
    .matches(timeRegex)
    .withMessage("Hora inválida, formato requerido HH:mm"),

  check("reason")
    .notEmpty()
    .withMessage("El motivo de la cita es obligatorio"),

  check("patient_dni")
    .if((value, { req }) => req.user?.role === "admin")
    .notEmpty()
    .withMessage("El DNI del paciente es obligatorio")
    .isLength({ min: 7, max: 10 })
    .withMessage("El DNI debe tener entre 7 y 10 caracteres"),

  check("patient_name")
    .if((value, { req }) => req.user?.role === "admin")
    .notEmpty()
    .withMessage("El nombre del paciente es obligatorio"),
];


export const listAppointmentsValidation = [
  body("filters.status")
    .optional()
    .isIn(["pendiente", "confirmada", "cancelada", "completada"])
    .withMessage("El estado debe ser uno de: pendiente, confirmada, cancelada, completada"),

  body("filters.doctorName")
    .optional()
    .isString()
    .withMessage("El nombre del doctor debe ser un texto"),

  body("filters.date")
    .optional()
    .matches(dateRegex)
    .withMessage("La fecha debe tener el formato YYYY-MM-DD"),

  body("filters.time")
    .optional()
    .matches(timeRegex)
    .withMessage("La hora debe tener el formato HH:mm"),

  check("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El número de página debe ser un entero positivo"),

  check("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El límite debe ser un entero positivo"),
];