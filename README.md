# NextKraft Node.js Project

A Node.js application with MySQL database integration.

## Project Structure

```
NextKraft_Letest/
├── src/
│   ├── config/          # Configuration files (database, app config)
│   ├── constants/       # Application constants
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # Type definitions
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validators
│   └── app.js           # Main application file
├── Documentation/       # Project documentation
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore file
├── package.json         # Node.js dependencies
└── README.md           # This file
```

## Prerequisites

- Node.js (>=14.0.0)
- npm (>=6.0.0)
- MySQL (>=5.7 or >=8.0)

## Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd NextKraft_Letest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nextkraft_db
   ```

4. **Create MySQL database**
   ```sql
   CREATE DATABASE nextkraft_db;
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
This will start the server with nodemon for auto-reloading.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### API Root
- `GET /api` - API information

## Database Configuration

The database connection is configured in `src/config/database.js` using a connection pool for better performance. The configuration uses environment variables from `.env` file.

## Dependencies

### Main Dependencies
- **express** - Web framework
- **mysql2** - MySQL database driver
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Security middleware
- **morgan** - HTTP request logger
- **express-validator** - Request validation
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

### Development Dependencies
- **nodemon** - Auto-reload for development

## Project Structure Details

- **config/** - Configuration files for database and application settings
- **controllers/** - Handle HTTP requests and responses
- **middleware/** - Custom middleware functions (auth, error handling, etc.)
- **models/** - Database models and schema definitions
- **routes/** - API route definitions
- **services/** - Business logic layer
- **utils/** - Helper functions and utilities
- **validators/** - Request validation schemas
- **constants/** - Application-wide constants
- **types/** - Type definitions and interfaces

## Development Guidelines

1. **Adding a new route:**
   - Create route file in `src/routes/`
   - Create controller in `src/controllers/`
   - Add route to `src/routes/index.js`

2. **Adding a new model:**
   - Create model file in `src/models/`
   - Use the database query helper from `src/config/database.js`

3. **Adding middleware:**
   - Create middleware file in `src/middleware/`
   - Export and use in routes or app.js

## Environment Variables

See `.env.example` for all available environment variables.

## License

ISC

