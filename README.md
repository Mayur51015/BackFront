# 🛡️ Smart Attendance System with Bio-Identity & Geo-fencing

A production-ready, energy-efficient attendance tracking system designed for academic and real-world deployment.

## 🚀 Key Features
- **Geo-fenced Verification**: Server-side GPS validation using the **Haversine Formula**.
- **Bio-Identity**: Live face capture requirement for attendance marking.
- **Real-time Synchronization**: Instant attendance updates via **Socket.io** Relay Hub.
- **Teacher Override**: Manual attendance marking with mandatory audit logging.
- **Green Coding**: Optimized for low energy consumption and minimal network calls.
- **Glassmorphic UI**: Ultra-modern design with smooth transitions and blur effects.

---

## 🛠️ Tech Stack
- **Frontend**: React 19 (Vite), Tailwind CSS 4, Axios, Lucide Icons, React-Webcam, Socket.io-client.
- **Backend**: Node.js, Express 5, Mongoose, Socket.io, Multer, JWT.
- **Database**: MongoDB (Local or Atlas).

---

## 🏗️ Technical Architecture & Design Choices

Detailed architectural decisions are documented in [ARCHITECTURE.md](file:///c:/Users/mayur/OneDrive/Desktop/attendance_system/ARCHITECTURE.md).

### 1. Haversine Formula (GPS Verification)
Precise meter-level accuracy for classroom-scale geo-fencing by accounting for Earth's curvature.

### 2. Green Coding Principles
- **Lazy Loading**: Major modules are loaded only when needed.
- **Single GPS Fetch**: Minimizes battery-draining polling.
- **Socket.io**: Reduces overhead for real-time status updates.

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a MongoDB Atlas URI)

### 2. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   UPLOAD_PATH=uploads
   ```
4. `npm start`

### 3. Frontend Setup
1. `cd frontend`
2. `npm install`
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. `npm run dev`

---

## 📁 Folder Structure
```text
├── backend/
│   ├── src/
│   │   ├── config/      # Database connection
│   │   ├── middleware/  # Auth & File processing
│   │   ├── models/      # Mongoose Schemas
│   │   ├── routes/      # REST API Endpoints
│   │   ├── utils/       # Haversine & Geo logic
│   │   └── server.js    # Entry point & Hub
├── frontend/
│   ├── src/
│   │   ├── components/  # Shared components
│   │   ├── contexts/    # State providers
│   │   ├── pages/       # Portal views
│   │   └── services/    # API abstraction
└── README.md
```

## 📄 Additional Documentation
- [Core Concepts & Green Coding](file:///c:/Users/mayur/OneDrive/Desktop/attendance_system/CONCEPTS.md)
- [Architecture Details](file:///c:/Users/mayur/OneDrive/Desktop/attendance_system/ARCHITECTURE.md)
- [API Reference](file:///c:/Users/mayur/OneDrive/Desktop/attendance_system/API_DOCS.md)
