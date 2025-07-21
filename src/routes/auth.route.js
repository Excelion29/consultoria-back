import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import AuthController from "../controllers/auth.controller.js";
import { loginValidation, refreshTokenValidation } from '../validations/auth.validation.js';
import { validationHandler } from '../middlewares/validationHandler.js';

const router = express.Router();

router.post("/login",loginValidation,validationHandler, AuthController.login);
router.get("/me", authMiddleware, AuthController.me);
router.post("/refresh-token",refreshTokenValidation, validationHandler, AuthController.refreshToken);
router.post("/logout", authMiddleware, AuthController.logout);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     description: Permite iniciar sesión con email o DNI, según el rol del usuario. Los administradores y médicos deben usar su email, mientras que los pacientes deben usar su DNI.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Correo electrónico (admin/médico) o DNI (paciente)
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el token de acceso y refresh token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5...
 *                     refreshToken:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: Juan Pérez
 *                         email:
 *                           type: string
 *                           example: admin@example.com
 *                         dni:
 *                           type: string
 *                           example: 71234567
 *                         role:
 *                           type: string
 *                           example: admin
 *                 message:
 *                   type: string
 *                   example: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales inválidas o error de autenticación.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   nullable: true
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: Credenciales inválidas
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Admin Principal
 *                 email:
 *                   type: string
 *                   example: admin@example.com
 *                 role:
 *                   type: string
 *                   example: admin
 *       401:
 *         description: Token no válido o no proporcionado.
 */

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Renovar token de acceso
 *     tags: [Auth]
 *     description: Genera un nuevo token de acceso usando un refresh token válido. No requiere estar autenticado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Nuevo token generado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token inválido o expirado.
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     description: Elimina el refresh token del servidor para invalidar la sesión.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sesión cerrada correctamente
 *       401:
 *         description: Token no válido o no proporcionado.
 */

export default router;
