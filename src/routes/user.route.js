import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import UserController from '../controllers/user.controller.js';

const router = express.Router();

router.post('/create', authMiddleware, roleMiddleware(['admin']), UserController.create);

router.post('/all', authMiddleware, roleMiddleware(['admin']), UserController.all);


/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags:
 *       - Usuarios
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
 *               - roleId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: correo@example.com
 *               dni:
 *                 type: string
 *                 example: 71643222
 *               roleId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 5
 *                     name: Juan Pérez
 *                     email: juan@example.com
 *                     dni: 12345678
 *                     role_id: 2
 *                 message:
 *                   type: string
 *                   example: Crear usuario
 *       401:
 *         description: No autorizado o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Data inválida
 */

/**
 * @swagger
 * /api/users/all:
 *   post:
 *     summary: Listar usuarios con filtros y paginación
 *     tags:
 *       - Usuarios
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
 *                   rol:
 *                     type: string
 *                     example: admin
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
 *                     example:
 *                       id: 1
 *                       name: Juan Pérez
 *                       email: juan@example.com
 *                       dni: 12345678
 *                       role: admin
 *                 pagination:
 *                   type: object
 *                   example:
 *                     total: 50
 *                     currentPage: 1
 *                     perPage: 10
 *                     lastPage: 5
 *                 message:
 *                   type: string
 *                   example: Usuarios listados correctamente
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: Error al listar usuarios
 */

export default router;