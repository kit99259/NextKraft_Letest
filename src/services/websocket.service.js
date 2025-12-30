const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { User } = require('../models/associations');

let io = null;
const connectedUsers = new Map(); // userId -> Set of socketIds mapping

/**
 * Initialize WebSocket server
 * @param {http.Server} server - HTTP server instance
 */
const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.cors.origin || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Fetch user from database to verify it exists
      const user = await User.findByPk(decoded.userId);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.Id;
      socket.userRole = user.Role;
      socket.username = user.Username;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return next(new Error('Authentication error: Invalid token'));
      }
      if (error.name === 'TokenExpiredError') {
        return next(new Error('Authentication error: Token expired'));
      }
      return next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;
    const username = socket.username;

    console.log(`✅ WebSocket: User ${userId} (${username}, ${userRole}) connected`);

    // Store user connection
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

    // Join role-based rooms for broadcasting
    socket.join(userRole); // 'customer' or 'operator' or 'admin'
    socket.join(`user_${userId}`); // User-specific room

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ WebSocket: User ${userId} (${username}) disconnected`);
      
      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId).delete(socket.id);
        if (connectedUsers.get(userId).size === 0) {
          connectedUsers.delete(userId);
        }
      }
    });

    // Handle custom events (optional - for keep-alive)
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Send connection confirmation
    socket.emit('connected', {
      message: 'WebSocket connection established',
      userId: userId,
      role: userRole,
      timestamp: new Date().toISOString()
    });
  });

  console.log('🔌 WebSocket server initialized');
  return io;
};

/**
 * Send notification to a specific user via WebSocket
 * @param {number} userId - User ID
 * @param {string} event - Event name
 * @param {object} data - Notification data
 */
const emitToUser = (userId, event, data) => {
  if (!io) {
    console.warn('WebSocket server not initialized');
    return false;
  }

  // Emit to user-specific room
  io.to(`user_${userId}`).emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  });

  console.log(`📤 WebSocket: Emitted ${event} to user ${userId}`);
  return true;
};

/**
 * Send notification to multiple users via WebSocket
 * @param {Array<number>} userIds - Array of user IDs
 * @param {string} event - Event name
 * @param {object} data - Notification data
 */
const emitToUsers = (userIds, event, data) => {
  if (!io) {
    console.warn('WebSocket server not initialized');
    return false;
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return false;
  }

  userIds.forEach(userId => {
    emitToUser(userId, event, data);
  });

  return true;
};

/**
 * Broadcast to all users of a specific role
 * @param {string} role - User role ('customer' or 'operator' or 'admin')
 * @param {string} event - Event name
 * @param {object} data - Notification data
 */
const emitToRole = (role, event, data) => {
  if (!io) {
    console.warn('WebSocket server not initialized');
    return false;
  }

  io.to(role).emit(event, {
    ...data,
    timestamp: new Date().toISOString()
  });

  console.log(`📤 WebSocket: Emitted ${event} to all ${role}s`);
  return true;
};

/**
 * Check if a user is connected
 * @param {number} userId - User ID
 * @returns {boolean}
 */
const isUserConnected = (userId) => {
  return connectedUsers.has(userId) && connectedUsers.get(userId).size > 0;
};

/**
 * Get number of connected users
 * @returns {number}
 */
const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

/**
 * Get list of connected user IDs
 * @returns {Array<number>}
 */
const getConnectedUserIds = () => {
  return Array.from(connectedUsers.keys());
};

module.exports = {
  initializeWebSocket,
  emitToUser,
  emitToUsers,
  emitToRole,
  isUserConnected,
  getConnectedUsersCount,
  getConnectedUserIds,
  getIO: () => io
};



