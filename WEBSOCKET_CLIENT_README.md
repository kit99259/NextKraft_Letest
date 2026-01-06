# WebSocket Client Samples for NextKraft API

This directory contains sample WebSocket clients that demonstrate how to connect to the NextKraft Socket.IO server and receive real-time events.

## Files

1. **`websocket-client-sample.js`** - General template (works in both browser and Node.js)
2. **`websocket-client-browser.html`** - Complete HTML page with UI for browser testing
3. **`websocket-client-node.js`** - Node.js specific version with CLI support

## Prerequisites

### For Browser Usage
- No installation needed! Just open `websocket-client-browser.html` in a web browser
- The HTML file includes Socket.IO client library via CDN

### For Node.js Usage
```bash
npm install socket.io-client
```

## Configuration

### Server URL
Default: `http://localhost:3000`

You can change this by:
- **Browser**: Update the input field in the HTML page
- **Node.js**: Set environment variable `WEBSOCKET_URL` or edit the code

### JWT Token
You need a valid JWT token from your authentication API to connect.

**How to get a token:**
1. Login via your authentication endpoint (e.g., `POST /api/auth/login`)
2. Copy the token from the response
3. Use it in the client

**Setting the token:**
- **Browser**: Enter it in the JWT Token input field
- **Node.js**: Set environment variable `JWT_TOKEN` or edit the code
  ```bash
  JWT_TOKEN=your_token_here node websocket-client-node.js
  ```

## Usage

### Browser (HTML)
1. Open `websocket-client-browser.html` in your web browser
2. Enter your server URL (default: `http://localhost:3000`)
3. Enter your JWT token
4. Click "Connect"
5. Watch the events log for real-time updates

### Node.js
```bash
# Basic usage
node websocket-client-node.js

# With environment variables
WEBSOCKET_URL=http://localhost:3000 JWT_TOKEN=your_token node websocket-client-node.js
```

## Events

The client listens for the following events from the server:

### Connection Events
- `connect` - Connection established
- `connected` - Connection confirmation from server
- `disconnect` - Disconnected from server
- `connect_error` - Connection error occurred
- `reconnect` - Reconnected after disconnection

### Keep-Alive Events
- `pong` - Response to ping (server confirms connection is alive)

### Parking Request Events
- `new_parking_request` - New parking request created (sent to operators)
- `parking_request_status_changed` - Parking request status updated
- `parking_request_accepted` - Parking request accepted by operator

### Pallet Events
- `pallet_assigned` - Pallet assigned to customer

### Car Release Events
- `car_release_request` - Car release request (sent to operators)
- `car_released` - Car has been released

### Request Events
- `request_status_changed` - Request status updated
- `request_accepted` - Request accepted by operator

### Parking System Events
- `parking_system_status_changed` - Parking system status updated (broadcast to customers)

## Event Data Structure

### `new_parking_request`
```json
{
  "id": 123,
  "userId": 456,
  "carId": 789,
  "projectId": 1,
  "parkingSystemId": 2,
  "status": "pending",
  "car": {
    "id": 789,
    "carType": "sedan",
    "carModel": "Model X",
    "carCompany": "Company",
    "carNumber": "ABC123"
  },
  "user": {
    "id": 456,
    "username": "customer1",
    "role": "customer"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### `pallet_assigned`
```json
{
  "palletId": "101",
  "customerId": "456",
  "carId": "789",
  "status": "assigned",
  "parkingRequestId": "123",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Customization

### Adding Custom Event Handlers

In any of the client files, you can add custom handlers:

```javascript
socket.on('your_custom_event', (data) => {
    console.log('Custom event received:', data);
    // Your custom logic here
});
```

### Periodic Ping

To keep the connection alive, you can send periodic pings:

```javascript
setInterval(() => {
    if (socket.connected) {
        socket.emit('ping');
    }
}, 30000); // Every 30 seconds
```

## Troubleshooting

### Connection Errors

**"Authentication error: No token provided"**
- Make sure you've set the JWT token correctly

**"Authentication error: Invalid token"**
- Your token may be expired or invalid
- Get a new token from the authentication API

**"Connection timeout"**
- Check if the server is running
- Verify the server URL is correct
- Check firewall/network settings

### Reconnection Issues

The client automatically attempts to reconnect if disconnected. You can adjust reconnection settings in the client configuration:

```javascript
{
    reconnection: true,
    reconnectionDelay: 1000,        // Initial delay (ms)
    reconnectionDelayMax: 5000,     // Max delay (ms)
    reconnectionAttempts: 5         // Max attempts
}
```

## Integration Examples

### React Component
```javascript
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function WebSocketComponent({ token }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io('http://localhost:3000', {
            auth: { token }
        });

        newSocket.on('pallet_assigned', (data) => {
            console.log('Pallet assigned:', data);
            // Update your React state
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, [token]);

    return <div>Connected: {socket?.connected ? 'Yes' : 'No'}</div>;
}
```

### Vue.js Component
```javascript
import { onMounted, onUnmounted, ref } from 'vue';
import io from 'socket.io-client';

export default {
    setup() {
        const socket = ref(null);

        onMounted(() => {
            socket.value = io('http://localhost:3000', {
                auth: { token: 'your_token' }
            });

            socket.value.on('pallet_assigned', (data) => {
                console.log('Pallet assigned:', data);
            });
        });

        onUnmounted(() => {
            socket.value?.close();
        });

        return { socket };
    }
}
```

## Security Notes

- **Never commit JWT tokens to version control**
- Use environment variables for tokens in production
- The token is sent in the connection handshake, so use HTTPS in production
- Tokens expire after a certain time (check your JWT configuration)

## Support

For issues or questions:
1. Check the server logs for connection attempts
2. Verify your JWT token is valid
3. Ensure the server is running and accessible
4. Check network/firewall settings


