const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const config = require('./config/config');
const { testConnection, syncDatabase } = require('./config/database');

// Import models to initialize associations
require('./models/associations');

// Import routes
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const operatorRoutes = require('./routes/operator.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'NextKraft API Documentation'
}));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.status(dbStatus ? 200 : 503).json({
    status: dbStatus ? 'healthy' : 'unhealthy',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NextKraft API',
    version: '1.0.0',
    status: 'running',
    documentation: '/api-docs'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/operator', operatorRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.env === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    // Option to start server even if DB connection fails (for development)
    const allowStartWithoutDB = process.env.ALLOW_START_WITHOUT_DB === 'true';
    
    if (!dbConnected) {
      if (allowStartWithoutDB) {
        console.warn('⚠️  Starting server without database connection (ALLOW_START_WITHOUT_DB=true)');
      } else {
        console.error('❌ Failed to connect to database. Server will not start.');
        console.error('   Set ALLOW_START_WITHOUT_DB=true in .env to start server anyway (not recommended for production)');
        process.exit(1);
      }
    } else {
      // Sync database (set to true to force sync, false for safe sync)
      // WARNING: force: true will drop all tables!
      if (process.env.SYNC_DB === 'true') {
        console.log('⚠️  Syncing database...');
        await syncDatabase(false); // Use false to avoid dropping tables
      }
    }
    
    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📝 Environment: ${config.env}`);
      console.log(`🌐 API available at http://localhost:${config.port}/api`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
