/**
 * WebSocket Client for Node.js - NextKraft API
 * 
 * Install dependencies:
 *   npm install socket.io-client
 * 
 * Usage:
 *   node websocket-client-node.js
 * 
 * Or with environment variables:
 *   WEBSOCKET_URL=http://localhost:3000 JWT_TOKEN=your_token node websocket-client-node.js
 */

const io = require('socket.io-client');

// ==================== CONFIGURATION ====================
const SERVER_URL = process.env.WEBSOCKET_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || 'YOUR_JWT_TOKEN_HERE';

// ==================== HELPER FUNCTIONS ====================

function log(message, type = 'info', data = null) {
    const timestamp = new Date().toISOString();
    const prefix = {
        'info': '📨',
        'success': '✅',
        'error': '❌',
        'warning': '⚠️'
    }[type] || '📨';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

// ==================== CLIENT SETUP ====================

log('Initializing WebSocket client...', 'info');
log(`Server URL: ${SERVER_URL}`, 'info');

if (JWT_TOKEN === 'YOUR_JWT_TOKEN_HERE') {
    log('WARNING: Please set JWT_TOKEN environment variable or update the code', 'warning');
    log('Example: JWT_TOKEN=your_token node websocket-client-node.js', 'info');
}

const socket = io(SERVER_URL, {
    auth: {
        token: JWT_TOKEN
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    timeout: 20000
});

// ==================== CONNECTION EVENTS ====================

socket.on('connect', () => {
    log('Connected to WebSocket server', 'success', { socketId: socket.id });
    socket.emit('ping');
});

socket.on('connected', (data) => {
    log('Connection confirmed from server', 'success', data);
});

socket.on('connect_error', (error) => {
    log('Connection error: ' + error.message, 'error');
    
    if (error.message.includes('Authentication error')) {
        log('Please check your JWT token', 'warning');
    }
});

socket.on('disconnect', (reason) => {
    log('Disconnected from server: ' + reason, 'warning');
    
    if (reason === 'io server disconnect') {
        log('Server disconnected the client, attempting to reconnect...', 'info');
        socket.connect();
    }
});

socket.on('reconnect_attempt', (attemptNumber) => {
    log(`Reconnection attempt ${attemptNumber}...`, 'warning');
});

socket.on('reconnect', (attemptNumber) => {
    log(`Reconnected after ${attemptNumber} attempts`, 'success');
});

socket.on('reconnect_failed', () => {
    log('Failed to reconnect to server', 'error');
    process.exit(1);
});

// ==================== KEEP-ALIVE EVENTS ====================

socket.on('pong', (data) => {
    log('Pong received', 'info', data);
});

// ==================== PARKING REQUEST EVENTS ====================

socket.on('new_parking_request', (data) => {
    log('New parking request received', 'info', data);
    // Add your custom handling logic here
});

socket.on('parking_request_status_changed', (data) => {
    log('Parking request status changed', 'info', data);
});

socket.on('parking_request_accepted', (data) => {
    log('Parking request accepted', 'success', data);
});

// ==================== PALLET EVENTS ====================

socket.on('pallet_assigned', (data) => {
    log('Pallet assigned', 'success', data);
    // Add your custom handling logic here
});

// ==================== CAR RELEASE EVENTS ====================

socket.on('car_release_request', (data) => {
    log('Car release request', 'info', data);
});

socket.on('car_released', (data) => {
    log('Car released', 'success', data);
});

// ==================== REQUEST EVENTS ====================

socket.on('request_status_changed', (data) => {
    log('Request status changed', 'info', data);
});

socket.on('request_accepted', (data) => {
    log('Request accepted', 'success', data);
});

// ==================== PARKING SYSTEM EVENTS ====================

socket.on('parking_system_status_changed', (data) => {
    log('Parking system status changed', 'info', data);
});

// ==================== GENERIC EVENT HANDLER ====================

socket.onAny((eventName, ...args) => {
    log(`Received event: ${eventName}`, 'info', args);
});

// ==================== UTILITY FUNCTIONS ====================

function sendPing() {
    if (socket.connected) {
        socket.emit('ping');
        log('Ping sent', 'info');
    } else {
        log('Cannot send ping: not connected', 'warning');
    }
}

function disconnect() {
    socket.disconnect();
    log('Disconnected from server', 'warning');
}

function getConnectionStatus() {
    return {
        connected: socket.connected,
        disconnected: socket.disconnected,
        id: socket.id
    };
}

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGINT', () => {
    log('Shutting down...', 'info');
    disconnect();
    process.exit(0);
});

process.on('SIGTERM', () => {
    log('Shutting down...', 'info');
    disconnect();
    process.exit(0);
});

// ==================== EXAMPLE: PERIODIC PING ====================

// Uncomment to send ping every 30 seconds
// setInterval(() => {
//     if (socket.connected) {
//         sendPing();
//     }
// }, 30000);

log('WebSocket client initialized. Waiting for connection...', 'info');

// Export for use as a module
module.exports = {
    socket,
    sendPing,
    disconnect,
    getConnectionStatus
};


