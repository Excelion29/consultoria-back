import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.route.js';
import swaggerSpec from './swagger.js'; 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Mi API Express',
    version: '1.0.0',
    description: 'Documentación generada con Swagger UI',
  },
  paths: {
    '/': {
      get: {
        summary: 'Ruta principal',
        responses: {
          200: {
            description: 'Respuesta exitosa',
          },
        },
      },
    },
  },
};

app.use('/api/auth', authRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
  console.log(`📘 Swagger en http://localhost:${PORT}/api-docs`);
});
