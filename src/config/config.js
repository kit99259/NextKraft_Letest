require('dotenv').config();

module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nextkraft',
    port: process.env.DB_PORT || 3306
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // Firebase Cloud Messaging configuration
  fcm: {
    // Firebase Admin SDK service account key (JSON string or path to JSON file)
    // You can either:
    // 1. Set FCM_SERVICE_ACCOUNT_KEY as a JSON string in .env
    // 2. Set FCM_SERVICE_ACCOUNT_PATH as path to JSON file
    serviceAccountKey: process.env.FCM_SERVICE_ACCOUNT_KEY || null,
    serviceAccountPath: process.env.FCM_SERVICE_ACCOUNT_PATH || null
  }
};

