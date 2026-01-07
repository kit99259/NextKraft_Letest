const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./config.js');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NextKraft API',
      version: '1.0.0',
      description: 'API documentation for NextKraft application',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server'
      },
      {
        url: 'https://nextkraft.zikasha.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

