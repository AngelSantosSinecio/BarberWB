# BarberApp Backend

Backend REST API para BarberApp construido con Node.js, Express y MariaDB.

## Requisitos

- Node.js LTS recomendado: 22 o 24
- MariaDB 12.2
- Base de datos: `barberapp_db`

## Instalacion

```powershell
cd backend
npm install
```

## Variables de entorno

Copia `backend/.env.example` a `backend/.env` y ajusta valores:

```env
PORT=3000
CLIENT_URL=http://localhost:4200
JWT_SECRET=change_this_secret_in_production
JWT_EXPIRES_IN=8h

DB_HOST=localhost
DB_PORT=3306
DB_USER=barberapp_user
DB_PASSWORD=your_database_password
DB_NAME=barberapp_db

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM="BarberApp <your_email@gmail.com>"
```

Si no configuras SMTP, la API no enviara el correo real y mostrara el enlace de confirmacion en la consola del backend para pruebas locales.

## Scripts

```powershell
npm run dev
npm start
npm run db:test
npm run smtp:test -- correo@destino.com
```

## Cambios de base de datos

Para habilitar la confirmacion de citas por correo, ejecuta en MariaDB:

```sql
SOURCE backend/database/2026-05-28-appointment-email-confirmation.sql;
```

Para habilitar la verificacion de correo en usuarios cliente, ejecuta:

```sql
SOURCE backend/database/2026-05-29-user-email-verification.sql;
```

## Autenticacion

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@barber.com",
  "password": "123456"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "name": "Administrador",
      "email": "admin@barber.com",
      "role": "admin"
    }
  }
}
```

Usa el token en rutas protegidas:

```http
Authorization: Bearer jwt-token
```

## Endpoints principales

### Auth

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/verify-email`

### Services

- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services` requiere `admin`
- `PUT /api/services/:id` requiere `admin`
- `DELETE /api/services/:id` requiere `admin`

### Barbers

- `GET /api/barbers`
- `GET /api/barbers/:id`
- `POST /api/barbers` requiere `admin`
- `PUT /api/barbers/:id` requiere `admin`
- `DELETE /api/barbers/:id` requiere `admin`

### Appointments

- `GET /api/appointments` requiere token
- `GET /api/appointments/:id` requiere token
- `POST /api/appointments` requiere token
- `POST /api/appointments/confirm-email` publico, confirma o cancela una cita usando token de correo
- `PATCH /api/appointments/:id/status` requiere `admin` o `barbero`

### Activity Logs

- `GET /api/activity-logs` requiere `admin`
- `POST /api/activity-logs` requiere token
- `GET /api/activity-logs/:id` requiere `admin`

## Codigos HTTP usados

- `200 OK`: consulta o actualizacion correcta
- `201 Created`: recurso creado
- `400 Bad Request`: datos invalidos
- `401 Unauthorized`: token ausente o invalido
- `403 Forbidden`: rol sin permisos
- `404 Not Found`: recurso inexistente
- `409 Conflict`: conflicto de datos, por ejemplo horario ocupado
- `500 Internal Server Error`: error no controlado

## Seguridad incluida

- JWT con expiracion
- Hash de contrasenas con bcrypt
- Validacion con Zod
- Helmet
- Rate limit
- CORS por variable de entorno
- Middlewares centralizados de errores

## Notas de disponibilidad

La creacion de citas valida solapes por duracion del servicio. Por ejemplo, si un barbero tiene una cita de 60 minutos a las 10:00, otra cita a las 10:30 sera rechazada con `409 Conflict`.
