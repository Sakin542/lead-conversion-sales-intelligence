# Predictive Lead Scoring CRM - Backend API

Laravel backend foundation for the Predictive Lead Scoring & CRM Sales Pipeline project.

## Requirements

- **PHP Version**: 8.2+
- **Laravel Version**: 11.x / 12.x
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

Run default migrations inside the application container:

```bash
docker compose exec app php artisan migrate
```

### 3. Run Automated Tests

Execute the PHPUnit feature test suite inside the container:

```bash
docker compose exec app php artisan test
```

## API Endpoints

### Health Check

- **URL**: `http://localhost:8000/api/health`
- **Method**: `GET`
- **Response**:
```json
{
    "success": true,
    "message": "Predictive CRM API is running",
    "version": "1.0.0"
}
```

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
