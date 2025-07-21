import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { roleMiddleware } from "../middlewares/roleMiddleware.js";
import UserController from "../controllers/user.controller.js";
import { validationHandler } from '../middlewares/validationHandler.js';
import { updateUserValidation, createAdminValidation, createDoctorValidation, createPatientValidation, paginatedListValidation } from '../validations/user.validation.js';
import { validateAvailabilityRange } from "../validations/range-date-tima.validation.js";

const router = express.Router();

router.post(
  '/create-admin',
  authMiddleware,
  roleMiddleware(['admin']),
  createAdminValidation,
  validationHandler,
  UserController.createAdmin
);

router.post(
  '/create-patients',
  authMiddleware,
  roleMiddleware(['admin']),
  createPatientValidation,
  validationHandler,
  UserController.createPatient
);

router.post(
  '/create-doctors',
  authMiddleware,
  roleMiddleware(['admin']),
  createDoctorValidation,
  validationHandler,
  UserController.createDoctor
);

router.post(
  '/all',
  authMiddleware,
  roleMiddleware(['admin']),
  paginatedListValidation,
  validationHandler,
  UserController.all
);

router.post(
  '/staff',
  authMiddleware,
  roleMiddleware(['admin']),
  paginatedListValidation,
  validationHandler,
  UserController.listStaff
);

router.post(
  '/patients',
  authMiddleware,
  roleMiddleware(['admin']),
  paginatedListValidation,
  validationHandler,
  UserController.listPatients
);

router.get(
  '/userById/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  validationHandler,
  UserController.getById
);

router.put(
  '/update/:id',
  authMiddleware,
  updateUserValidation,
  validateAvailabilityRange,
  validationHandler,
  UserController.updateUser
);

router.delete(
  '/delete/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  UserController.deleteUser
);

/**
 * @swagger
 * /api/users/create-admin:
 *   post:
 *     summary: Crear un usuario administrador
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - dni
 *             properties:
 *               name:
 *                 type: string
 *                 example: Admin Uno
 *               email:
 *                 type: string
 *                 example: admin1@example.com
 *               dni:
 *                 type: string
 *                 example: 11112222
 *     responses:
 *       200:
 *         description: Administrador creado correctamente
 *       401:
 *         description: No autorizado o error en los datos
 */

/**
 * @swagger
 * /api/users/create-patients:
 *   post:
 *     summary: Crear un usuario paciente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dni
 *             properties:
 *               name:
 *                 type: string
 *                 example: Paciente Uno
 *               email:
 *                 type: string
 *                 example: paciente1@example.com
 *               dni:
 *                 type: string
 *                 example: 33334444
 *     responses:
 *       200:
 *         description: Paciente creado correctamente
 *       401:
 *         description: No autorizado o error en los datos
 */

/**
 * @swagger
 * /api/users/create-doctors:
 *   post:
 *     summary: Crear un usuario médico
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dni
 *               - specialties
 *               - availability
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dr. John Doe
 *               email:
 *                 type: string
 *                 example: doctor@example.com
 *               dni:
 *                 type: string
 *                 example: 55667788
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]  # IDs de las especialidades
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - weekday
 *                     - start_time
 *                     - end_time
 *                   properties:
 *                     weekday:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 1  # Lunes
 *                     start_time:
 *                       type: string
 *                       format: time
 *                       example: "08:00:00"
 *                     end_time:
 *                       type: string
 *                       format: time
 *                       example: "12:00:00"
 *     responses:
 *       200:
 *         description: Médico creado correctamente con especialidades y disponibilidad
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 10
 *                     name: Dr. John Doe
 *                     dni: 55667788
 *                     email: doctor@example.com
 *                     role: medico
 *                     specialties: [1, 3]
 *                 message:
 *                   type: string
 *                   example: Médico creado correctamente con especialidades y disponibilidad
 *       400:
 *         description: Error al registrar médico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Error al registrar médico
 */

/**
 * @swagger
 * /api/users/all:
 *   post:
 *     summary: Listar todos los usuarios con filtros dinámicos y paginación
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Página actual del listado
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Cantidad de registros por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 description: Filtros de búsqueda
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Ana
 *                   dni:
 *                     type: string
 *                     example: 12345678
 *                   rol:
 *                     type: string
 *                     example: paciente
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Ana Torres
 *                       email:
 *                         type: string
 *                         example: ana@example.com
 *                       dni:
 *                         type: string
 *                         example: 12345678
 *                       role:
 *                         type: string
 *                         example: paciente
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     perPage:
 *                       type: integer
 *                       example: 10
 *                     lastPage:
 *                       type: integer
 *                       example: 5
 *                 message:
 *                   type: string
 *                   example: Usuarios listados correctamente
 *       401:
 *         description: No autorizado o error en los datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Data inválida
 */


/**
 * @swagger
 * /api/users/staff:
 *   post:
 *     summary: Listar médicos y administradores con filtros
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Cantidad de registros por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Ana
 *                   dni:
 *                     type: string
 *                     example: 87654321
 *     responses:
 *       200:
 *         description: Lista de médicos y administradores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example:
 *                       id: 3
 *                       name: Admin María
 *                       email: maria@example.com
 *                       dni: 87654321
 *                       role: admin
 *                 pagination:
 *                   type: object
 *                   example:
 *                     total: 15
 *                     currentPage: 1
 *                     perPage: 10
 *                     lastPage: 2
 *                 message:
 *                   type: string
 *                   example: Médicos y administradores listados correctamente
 *       400:
 *         description: Error al obtener la lista de personal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Error al obtener usuarios
 */

/**
 * @swagger
 * /api/users/patients:
 *   post:
 *     summary: Listar pacientes con filtros
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Cantidad de registros por página
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filters:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: Juan
 *                   dni:
 *                     type: string
 *                     example: 12345678
 *     responses:
 *       200:
 *         description: Lista de pacientes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     example:
 *                       id: 7
 *                       name: Juan Paciente
 *                       email: juan.paciente@example.com
 *                       dni: 12345678
 *                       role: paciente
 *                 pagination:
 *                   type: object
 *                   example:
 *                     total: 25
 *                     currentPage: 1
 *                     perPage: 10
 *                     lastPage: 3
 *                 message:
 *                   type: string
 *                   example: Pacientes listados correctamente
 *       400:
 *         description: Error al obtener la lista de pacientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Error al obtener pacientes
 */

/**
 * @swagger
 * /api/users/userById/{id}:
 *   get:
 *     summary: Obtener datos de un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a consultar
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 5
 *                     name: Dr. Juan
 *                     email: juan@example.com
 *                     dni: 12345678
 *                     role: medico
 *                     specialties:
 *                       - id: 1
 *                         name: Cardiología
 *                     availability:
 *                       - weekday: 1
 *                         start_time: "08:00:00"
 *                         end_time: "12:00:00"
 *                 message:
 *                   type: string
 *                   example: Usuario obtenido correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
/**
 * @swagger
 * /api/users/update/{id}:
 *   put:
 *     summary: Actualizar un usuario por su ID (solo admins)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: María Editada
 *               email:
 *                 type: string
 *                 example: maria.nueva@example.com
 *               specialties:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 3]
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     weekday:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 1
 *                     start_time:
 *                       type: string
 *                       format: time
 *                       example: "09:00"
 *                     end_time:
 *                       type: string
 *                       format: time
 *                       example: "13:00"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 5
 *                     name: María Editada
 *                     email: maria.nueva@example.com
 *                     dni: 87654321
 *                     role: medico
 *                     specialties:
 *                       - id: 1
 *                         name: Cardiología
 *                     availability:
 *                       - weekday: 1
 *                         start_time: "09:00:00"
 *                         end_time: "13:00:00"
 *                 message:
 *                   type: string
 *                   example: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
/**
 * @swagger
 * /api/users/delete/{id}:
 *   delete:
 *     summary: Dar de baja (borrado lógico) a un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario a dar de baja
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario dado de baja correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario dado de baja correctamente
 *                 data:
 *                   type: object
 *                   example:
 *                     success: true
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado para el rol actual
 */

export default router;
