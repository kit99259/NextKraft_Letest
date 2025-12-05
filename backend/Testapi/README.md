# Test API Scripts

This folder contains test scripts for the Nextkraft Smart Parking System backend API.

## Available Scripts

### 1. `create-admin.ts`
Creates an admin user with:
- Username: `admin`
- Password: `admin`
- Role: `admin`
- Full Name: `System Administrator`

**Usage:**
```bash
cd backend
npx tsx Testapi/create-admin.ts
```

**Note:** If the admin user already exists, the script will inform you.

---

### 2. `test-admin-login.ts`
Tests the login functionality for the admin user and displays the JWT token.

**Usage:**
```bash
cd backend
npx tsx Testapi/test-admin-login.ts
```

**Output:**
- User details
- JWT token for testing protected endpoints

---

## Admin User Credentials

- **Username:** `admin`
- **Password:** `admin`
- **Role:** `admin`

## Testing the API

### 1. Login Endpoint
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin"
}
```

### 2. Protected Endpoints (Require JWT Token)

Add the token to the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

**Admin Dashboard:**
```bash
GET http://localhost:3000/api/admin/dashboard
Authorization: Bearer <token>
```

---

## Notes

- All test scripts load environment variables from the parent `.env` file
- Make sure your `.env` file is configured before running these scripts
- These scripts are for testing purposes only and can be safely deleted later

