# Nextkraft Smart Parking System - Backend API

A Node.js + Express backend API built with TypeScript for the Nextkraft Smart Parking System.

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Supabase** - PostgreSQL database client
- **JWT** - Authentication using HS256 algorithm
- **bcrypt** - Password hashing
- **Zod** - Input validation
- **Winston** - Logging
- **dotenv** - Environment variable management

## Project Structure

```
backend/
├─ src/
│  ├─ app.ts                    # Express app bootstrap
│  ├─ server.ts                 # Server start script
│  ├─ config/                   # Environment configs
│  ├─ models/                   # DB queries using Supabase
│  ├─ controllers/              # Route logic handlers
│  ├─ services/                 # Business logic
│  ├─ validators/               # Zod input validation
│  ├─ middleware/               # Auth & error handling
│  ├─ utils/                    # Helper utilities
│  ├─ routes/                   # API route definitions
│  ├─ types/                    # TypeScript type definitions
│  └─ constants/                # Role constants
├─ .env.example
├─ tsconfig.json
├─ package.json
└─ README.md
```

## Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and fill in your values:
     ```
     SUPABASE_URL=your_supabase_project_url
     SUPABASE_ANON_KEY=your_supabase_anon_key
     JWT_SECRET=your_jwt_secret_key_minimum_32_characters
     PORT=3000
     NODE_ENV=development
     ```

## Database Setup

Make sure your Supabase database has the following tables:

- `users` - User accounts with username, password_hash, and role
- `admins` - Admin profiles linked to users
- `operators` - Operator profiles linked to users
- `customers` - Customer profiles linked to users
- `projects` - Parking projects
- `pallets` - Parking pallets
- `cars` - Customer vehicles
- `requests` - Parking requests

## Running the Development Server

```bash
npm run dev
```

This will start the server with hot-reload using `tsx watch`. The server will be available at `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication

- **POST** `/api/auth/login`
  - Request body:
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "data": {
        "token": "jwt_token_here",
        "role": "ADMIN|OPERATOR|CUSTOMER",
        "user": {
          "id": "user_id",
          "username": "username",
          "role": "ADMIN|OPERATOR|CUSTOMER",
          "profile": { ... }
        }
      }
    }
    ```

### Protected Routes (Require JWT Token)

All protected routes require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

- **GET** `/api/admin/dashboard` - Admin dashboard (requires ADMIN role)
- **GET** `/api/operator/dashboard` - Operator dashboard (requires OPERATOR role)
- **GET** `/api/customer/dashboard` - Customer dashboard (requires CUSTOMER role)

### Health Check

- **GET** `/api/health` - API health check endpoint

## Error Handling

The API uses a global error handler that:
- Logs errors using Winston
- Returns consistent error responses
- Handles Zod validation errors
- Provides appropriate HTTP status codes

Error response format:
```json
{
  "success": false,
  "error": "Error message"
}
```

## Authentication Flow

1. User sends login request with username and password
2. System finds user in database
3. Password is compared using bcrypt
4. If valid, JWT token is generated with user id, role, and username
5. Role-specific profile is fetched from relevant table
6. Token and user data are returned

## Role-Based Access Control

The system supports three roles:
- **ADMIN** - Full system access
- **OPERATOR** - Operational access
- **CUSTOMER** - Customer access

Routes are protected using middleware that:
- Verifies JWT token
- Checks user role against required roles
- Attaches user information to `req.user`

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server (requires build first)
- `npm run type-check` - Type check without building

## Development

The project uses TypeScript with strict mode enabled. All code is type-safe and follows a clean architecture pattern:

- **Models** - Database access layer
- **Services** - Business logic (no req/res dependencies)
- **Controllers** - Request/response handling
- **Routes** - Endpoint definitions with middleware
- **Middleware** - Authentication and error handling
- **Validators** - Input validation using Zod

## License

ISC
