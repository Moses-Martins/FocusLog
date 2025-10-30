import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation for my app',
  },
  servers: [
    {
      url: 'https://focuslog.onrender.com/',
      description: 'Development server',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/**/*.ts'], // adjust as needed
};

// ✅ Some setups need swaggerJSDoc.default(options)
export const swaggerSpec = (swaggerJSDoc as any).default
  ? (swaggerJSDoc as any).default(options)
  : (swaggerJSDoc as any)(options);

export const swaggerUiMiddleware = swaggerUi;
