# API Documentation: Smart Attendance System

The backend provides a RESTful API for common operations, supplemented by Socket.io for real-time events.

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`
- **Body**: `{ name, email, password, role, className, rollNo }`
- **Description**: Creates a new user profile. Roles are `teacher` or `student`.

### 2. Login User
`POST /api/auth/login`
- **Body**: `{ email, password }`
- **Returns**: `{ token, user: { id, name, role, ... } }`

---

## Attendance & Session Endpoints

### 3. Create Session (Teacher Only)
`POST /api/attendance/session`
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ targetClass, coords: { lat, lng }, radius, expiresAt }`
- **Description**: Generates a new unique `joinCode` and starts a session.

### 4. Join/Verify Session (Student Only)
`POST /api/attendance/mark`
- **Header**: `Authorization: Bearer <token>`
- **Body**: `{ joinCode, coords: { lat, lng }, faceImage (FormData) }`
- **Description**: Validates GPS distance and registers attendance for the student.

---

## Real-time Events (Socket.io)

### Client Emissions
- `connection`: Triggered on socket initialization.

### Server Emissions
- `attendance-update`: Emitted to the teacher whenever a student successfully marks attendance.
- `session-ended`: Emitted to students when the teacher terminates the session.
