import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validationHandler } from "../middlewares/validationHandler.js";
import { createAppointmentValidation, listAppointmentsValidation } from "../validations/appointment.validation.js";

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["admin", "paciente"]),
  createAppointmentValidation,
  validationHandler,
  AppointmentController.create
);

router.post(
  "/list",
  authMiddleware,
  listAppointmentsValidation,
  validationHandler,
  AppointmentController.listMyAppointments
);

router.get(
  "/:id",
  authMiddleware,
  AppointmentController.getAppointmentDetail
);
/**
 * @swagger
 * tags:
 *   name: Citas
 *   description: Endpoints para gestión de citas médicas
 */

/**
 * @swagger
 * /api/appointment/create:
 *   post:
 *     summary: Crear una cita médica
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/AppointmentCreateByPatient'
 *               - $ref: '#/components/schemas/AppointmentCreateByAdmin'
 *     responses:
 *       201:
 *         description: Cita creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointmentId:
 *                       type: integer
 *                 message:
 *                   type: string
 *                   example: Cita creada correctamente
 *       400:
 *         description: Error de validación o conflicto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: string
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: El médico ya tiene una cita en ese rango de tiempo
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentCreateByPatient:
 *       type: object
 *       required:
 *         - doctor_id
 *         - appointment_date
 *         - appointment_time
 *         - reason
 *       properties:
 *         doctor_id:
 *           type: integer
 *           example: 3
 *         appointment_date:
 *           type: string
 *           format: date
 *           example: "2025-07-25"
 *         appointment_time:
 *           type: string
 *           pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *           example: "14:30"
 *         reason:
 *           type: string
 *           example: Dolor de cabeza persistente
 *
 *     AppointmentCreateByAdmin:
 *       allOf:
 *         - $ref: '#/components/schemas/AppointmentCreateByPatient'
 *         - type: object
 *           required:
 *             - patient_dni
 *             - patient_name
 *           properties:
 *             patient_dni:
 *               type: string
 *               example: "12345678"
 *             patient_name:
 *               type: string
 *               example: "María Torres"
 *             patient_email:
 *               type: string
 *               format: email
 *               example: "maria.torres@example.com"
 */
/**
 * @swagger
 * /api/appointment/list:
 *   post:
 *     summary: Listar citas del usuario autenticado (admin ve todas)
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Filtros opcionales para la búsqueda
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     enum: [pendiente, confirmada, cancelada, completada]
 *                   doctorName:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   time:
 *                     type: string
 *                     pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$"
 *             example:
 *               filters:
 *                 status: pendiente
 *                 doctorName: "Dr. Pérez"
 *                 date: "2025-07-21"
 *                 time: "10:30"
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: "Número de página (default: 1)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: "Cantidad de resultados por página (default: 10)"
 *     responses:
 *       200:
 *         description: Lista de citas recuperada con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     lastPage:
 *                       type: integer
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           appointment_date:
 *                             type: string
 *                           appointment_time:
 *                             type: string
 *                           status:
 *                             type: string
 *                           current_reason:
 *                             type: string
 *                           current_diagnosis:
 *                             type: string
 *                           patient_name:
 *                             type: string
 *                           doctor_name:
 *                             type: string
 *       400:
 *         description: Error de validación o interno
 */

/**
 * @swagger
 * /api/appointment/{id}:
 *   get:
 *     summary: Obtener detalle de una cita médica
 *     tags: [Citas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita médica
 *     responses:
 *       200:
 *         description: Detalle de cita recuperado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Error o acceso no autorizado
 */

export default router;
