import express from "express";
import DoctorController from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import { validationHandler } from "../middlewares/validationHandler.js";
import { validateDatetimeRange } from "../validations/range-date-tima.validation.js";
import { availableDoctorsValidation } from "../validations/doctor.validation.js";

const router = express.Router();

router.post(
  "/available",
  authMiddleware,
  roleMiddleware(["admin", "paciente"]),
  availableDoctorsValidation,
  validationHandler,
  validateDatetimeRange,
  DoctorController.getAvailableDoctors
);

/**
 * @swagger
 * /api/doctors/available:
 *   post:
 *     summary: Obtener doctores disponibles en un rango de fecha y hora
 *     tags: [Doctores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - start_time
 *               - end_time
 *             properties:
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-22T09:00:00"
 *                 description: Fecha y hora de inicio del rango de búsqueda
 *               end_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-22T11:30:00"
 *                 description: Fecha y hora de fin del rango de búsqueda
 *     responses:
 *       200:
 *         description: Lista de doctores disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 4
 *                       name:
 *                         type: string
 *                         example: Dr. Ana López
 *                       email:
 *                         type: string
 *                         example: ana.lopez@example.com
 *                       dni:
 *                         type: string
 *                         example: 12345678
 *                 message:
 *                   type: string
 *                   example: Doctores disponibles listados correctamente
 *       400:
 *         description: Error en los parámetros de entrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: La fecha y hora de fin debe ser posterior a la de inicio
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol no permitido
 */

export default router;
