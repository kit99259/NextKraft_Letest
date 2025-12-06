const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// SSL Configuration
const getSSLConfig = () => {
  if (process.env.DB_SSL_ENABLED === 'true' || process.env.DB_SSL_ENABLED === '1') {
    if (!process.env.DB_SSL_CA) {
      throw new Error('DB_SSL_CA is required when DB_SSL_ENABLED is true');
    }

    const caPath = path.resolve(process.env.DB_SSL_CA);
    if (!fs.existsSync(caPath)) {
      throw new Error(`SSL CA certificate file not found at: ${caPath}`);
    }

    return {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
      ca: fs.readFileSync(caPath)
    };
  }
  return false;
};

// Initialize SSL configuration
let sslConfig;
try {
  sslConfig = getSSLConfig();
} catch (error) {
  console.error('❌ SSL Configuration Error:', error.message);
  throw error;
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nextkraft',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: sslConfig,
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 60000 // 60 seconds default
    },
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 60000,
    pool: {
      max: 10,
      min: 0,
      acquire: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000, // 60 seconds
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    retry: {
      max: 3
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    const sslStatus = process.env.DB_SSL_ENABLED === 'true' || process.env.DB_SSL_ENABLED === '1' 
      ? 'with SSL' 
      : 'without SSL';
    console.log(`✅ Database connected successfully ${sslStatus}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Sync database (use with caution in production)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: false });
    console.log('✅ Database synced successfully');
    return true;
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
