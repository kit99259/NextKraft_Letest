/**
 * WebSocket Client Sample for NextKraft API
 * 
 * This sample demonstrates how to connect to the Socket.IO WebSocket server
 * and receive real-time events from the API.
 * 
 * Usage:
 *   - Browser: Include socket.io-client library via CDN or npm
 *   - Node.js: npm install socket.io-client
 * 
 * Configuration:
 *   - Update SERVER_URL to match your server (default: http://localhost:3000)
 *   - Update JWT_TOKEN with a valid authentication token
 */

// Import Socket.IO client (for Node.js)
// For browser, use: <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
// For Node.js: const io = require('socket.io-client');

// ==================== CONFIGURATION ====================
const SERVER_URL = process.env.WEBSOCKET_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || 'YOUR_JWT_TOKEN_HERE';

// ==================== CLIENT SETUP ====================

// Initialize Socket.IO connection with authentication
const socket = io(SERVER_URL, {
  auth: {
    token: JWT_TOKEN
  },
  // Alternative: You can also pass token as query parameter
  // query: {
  //   token: JWT_TOKEN
  // },
  transports: ['websocket', 'polling'], // Use websocket first, fallback to polling
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 20000
});

// ==================== CONNECTION EVENTS ====================

// Connection established successfully
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');
  console.log('Socket ID:', socket.id);
  
  // Send a ping to test the connection
  socket.emit('ping');
});

// Connection confirmation from server
socket.on('connected', (data) => {
  console.log('📨 Connection confirmed from server:', data);
  console.log('   User ID:', data.userId);
  console.log('   Role:', data.role);
  console.log('   Timestamp:', data.timestamp);
});

// Connection error
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  
  if (error.message.includes('Authentication error')) {
    console.error('   Please check your JWT token');
  }
});

// Disconnected from server
socket.on('disconnect', (reason) => {
  console.log('❌ Disconnected from server:', reason);
  
  if (reason === 'io server disconnect') {
    // Server disconnected the client, reconnect manually
    socket.connect();
  }
});

// Reconnection attempt
socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
});

// Reconnection successful
socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`);
});

// Reconnection failed
socket.on('reconnect_failed', () => {
  console.error('❌ Failed to reconnect to server');
});

// ==================== KEEP-ALIVE EVENTS ====================

// Response to ping
socket.on('pong', (data) => {
  console.log('🏓 Pong received:', data.timestamp);
});

// ==================== PARKING REQUEST EVENTS ====================

// New parking request created (sent to operators)
socket.on('new_parking_request', (data) => {
  console.log('🚗 New parking request received:', {
    id: data.id,
    userId: data.userId,
    carId: data.carId,
    projectId: data.projectId,
    parkingSystemId: data.parkingSystemId,
    status: data.status,
    car: data.car,
    user: data.user,
    timestamp: data.timestamp
  });
  
  // Handle the new parking request in your application
  // Example: Update UI, show notification, etc.
});

// Parking request status changed
socket.on('parking_request_status_changed', (data) => {
  console.log('🔄 Parking request status changed:', {
    parkingRequestId: data.parkingRequestId,
    status: data.status,
    previousStatus: data.previousStatus,
    timestamp: data.timestamp
  });
});

// Parking request accepted
socket.on('parking_request_accepted', (data) => {
  console.log('✅ Parking request accepted:', {
    parkingRequestId: data.parkingRequestId,
    operatorId: data.operatorId,
    timestamp: data.timestamp
  });
});

// ==================== PALLET EVENTS ====================

// Pallet assigned to customer
socket.on('pallet_assigned', (data) => {
  console.log('📍 Pallet assigned:', {
    palletId: data.palletId,
    customerId: data.customerId,
    carId: data.carId,
    status: data.status,
    parkingRequestId: data.parkingRequestId,
    timestamp: data.timestamp
  });
  
  // Handle pallet assignment in your application
  // Example: Show pallet location, update map, etc.
});

// ==================== CAR RELEASE EVENTS ====================

// Car release request (sent to operators)
socket.on('car_release_request', (data) => {
  console.log('🚪 Car release request:', {
    requestId: data.requestId,
    customerId: data.customerId,
    carId: data.carId,
    palletId: data.palletId,
    timestamp: data.timestamp
  });
});

// Car released
socket.on('car_released', (data) => {
  console.log('🚗 Car released:', {
    requestId: data.requestId,
    carId: data.carId,
    palletId: data.palletId,
    timestamp: data.timestamp
  });
});

// ==================== REQUEST EVENTS ====================

// Request status changed
socket.on('request_status_changed', (data) => {
  console.log('🔄 Request status changed:', {
    requestId: data.requestId,
    status: data.status,
    previousStatus: data.previousStatus,
    timestamp: data.timestamp
  });
});

// Request accepted
socket.on('request_accepted', (data) => {
  console.log('✅ Request accepted:', {
    requestId: data.requestId,
    operatorId: data.operatorId,
    timestamp: data.timestamp
  });
});

// ==================== PARKING SYSTEM EVENTS ====================

// Parking system status changed (broadcast to customers)
socket.on('parking_system_status_changed', (data) => {
  console.log('🏢 Parking system status changed:', {
    parkingSystemId: data.parkingSystemId,
    status: data.status,
    availableSpots: data.availableSpots,
    timestamp: data.timestamp
  });
});

// ==================== CUSTOM EVENT HANDLER ====================

// Generic handler for any other events
socket.onAny((eventName, ...args) => {
  console.log(`📨 Received event: ${eventName}`, args);
});

// ==================== UTILITY FUNCTIONS ====================

/**
 * Send a ping to the server
 */
function sendPing() {
  socket.emit('ping');
  console.log('🏓 Ping sent');
}

/**
 * Disconnect from the server
 */
function disconnect() {
  socket.disconnect();
  console.log('Disconnected from server');
}

/**
 * Reconnect to the server
 */
function reconnect() {
  socket.connect();
  console.log('Attempting to reconnect...');
}

/**
 * Check connection status
 */
function getConnectionStatus() {
  return {
    connected: socket.connected,
    disconnected: socket.disconnected,
    id: socket.id
  };
}

// ==================== EXPORT FOR NODE.JS ====================
// Uncomment if using in Node.js environment
// module.exports = {
//   socket,
//   sendPing,
//   disconnect,
//   reconnect,
//   getConnectionStatus
// };

// ==================== EXAMPLE USAGE ====================

// Example: Send ping every 30 seconds to keep connection alive
// setInterval(() => {
//   if (socket.connected) {
//     sendPing();
//   }
// }, 30000);

// Example: Handle specific event with custom logic
// socket.on('pallet_assigned', (data) => {
//   // Your custom logic here
//   alert(`Pallet ${data.palletId} has been assigned to you!`);
//   updateUI(data);
// });

console.log('WebSocket client initialized. Waiting for connection...');
console.log('Server URL:', SERVER_URL);
console.log('Make sure to set a valid JWT_TOKEN before connecting.');


