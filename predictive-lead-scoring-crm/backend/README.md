# Predictive Lead Scoring CRM - Backend API

Laravel backend foundation for the Predictive Lead Scoring & CRM Sales Pipeline project.

## Requirements

- **PHP Version**: 8.2+
- **Laravel Version**: 12.x
- **Docker**: Docker Desktop with Docker Compose

## Quick Start with Docker

### 1. Start Containers

From the `predictive-lead-scoring-crm` root directory, run:

```bash
docker compose up -d
```

This will launch:
- **App container (`predictive-crm-app`)**: PHP / Laravel API running on `http://localhost:8000`
- **MySQL container (`predictive-crm-mysql`)**: MySQL 8.0 running on port `3307` (mapped to internal `3306`)

### 2. Run Database Migrations

Run default migrations (including Sanctum tokens table) inside the application container:

```bash
docker compose exec app php artisan migrate
```

### 3. Run Automated Tests

Execute the full feature & unit test suite inside the container:

```bash
docker compose exec app php artisan test
```

---

## Authentication API (Laravel Sanctum)

All authentication endpoints use JSON format. Protected endpoints require a valid Sanctum bearer token in the `Authorization` header:

```http
Authorization: Bearer <token>
```

### Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health check |
| `POST` | `/api/auth/register` | Public | Register new user & return access token |
| `POST` | `/api/auth/login` | Public | Authenticate user & return access token |
| `POST` | `/api/auth/logout` | Protected | Revoke current user access token |
| `GET` | `/api/auth/user` | Protected | Fetch current authenticated user details |
| `GET` | `/api/protected` | Protected | Test endpoint for authentication verification |

---

### Request & Response Specifications

#### 1. Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```
- **Success Response (201 Created)**:
```json
{
    "success": true,
    "message": "Registration successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2026-09-01T23:00:00.000000Z",
        "updated_at": "2026-09-01T23:00:00.000000Z"
    },
    "token": "1|sanctum_access_token_here..."
}
```

#### 2. Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```
- **Success Response (200 OK)**:
```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    },
    "token": "2|sanctum_access_token_here..."
}
```
- **Error Response (401 Unauthorized)**:
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

#### 3. Logout User
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Header**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
    "success": true,
    "message": "Logout successful"
}
```

#### 4. Current User Profile
- **URL**: `/api/auth/user`
- **Method**: `GET`
- **Header**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
    "success": true,
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
    }
}
```

#### 5. Protected Test Route
- **URL**: `/api/protected`
- **Method**: `GET`
- **Header**: `Authorization: Bearer <token>`
- **Success Response (200 OK)**:
```json
{
    "success": true,
    "message": "You are authenticated"
}
```

---

## Useful Docker Commands

```bash
# View container logs
docker compose logs -f app

# Enter Laravel container shell
docker compose exec app bash

# Run Artisan commands
docker compose exec app php artisan <command>

# Stop containers
docker compose down
```
