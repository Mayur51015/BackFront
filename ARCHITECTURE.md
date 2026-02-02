# Technical Architecture: Smart Attendance System

This document outlines the core architectural decisions and system design for the Smart Attendance System. For a non-technical explanation of the principles, see [CONCEPTS.md](file:///c:/Users/mayur/OneDrive/Desktop/attendance_system/CONCEPTS.md).

## 1. System Overview
The system follows a modern **Client-Server-Database** architecture with a real-time event hub.

### Components:
- **Client (Frontend)**: React 19 SPA. Handles biometric capture via `react-webcam` and GPS via `navigator.geolocation`.
- **Relay Hub (Backend)**: Node.js/Express server. Uses `socket.io` for real-time event propagation and `multer` for biometric data handling.
- **Database**: MongoDB (Mongoose) for persistence.

## 2. Data Models (Mongoose)
The system relies on three primary schemas:
- **User**: Stores identity, credentials (hashed), role, and class affiliation.
- **Session**: Defines a geo-fenced attendance window created by a teacher. Includes `coords`, `radius`, and `joinCode`.
- **Attendance**: Records successful verification events, linking a `studentId` to a `sessionId` with a `faceUrl` audit trail.

## 3. Real-time Synchronization (Socket.io)
- **Event Flow**: 
  1. Student emits `mark` request via REST.
  2. Server validates GPS and Face.
  3. Server saves to DB and broadcasts `attendance-update` via Socket.io to the specific teacher's socket ID.
- **Reliability**: Uses standard WebSockets with a fallback to long-polling if necessary.

## 4. Geo-fencing Implementation
Calculating the great-circle distance in `backend/src/utils/geo.utils.js`:

```javascript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) * 
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
};
```

## 5. Security & Verification Chain
1. **JWT Auth**: Ensures the user is who they say they are.
2. **Class Check**: Validates if the student belongs to the `targetClass` of the session.
3. **Geo-fence Check**: Haversine distance must be `< session.radius`.
4. **Biometric Capture**: A photo is mandatory for the record.
