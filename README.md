# 🛡️ Smart Attendance System with Bio-Identity & Geo-fencing

A production-ready, energy-efficient attendance tracking system designed for academic and real-world deployment.

## 🚀 Key Features
- **Geo-fenced Verification**: Server-side GPS validation using the **Haversine Formula**.
- **Bio-Identity**: Live face capture requirement for attendance marking.
- **Teacher Override**: Manual attendance marking with mandatory audit logging.
- **Green Coding**: Optimized for low energy consumption and minimal network calls.
- **Glassmorphic UI**: Ultra-modern design with smooth transitions and blur effects.

---

## 🛠️ Tech Stack
- **Frontend**: React 18 (Vite), Tailwind CSS, Axios, Lucide Icons, React-Webcam.
- **Backend**: Node.js, Express, Multer (File Handling).
- **Database/Auth**: Firebase Firestore, Firebase Authentication, Firebase Storage.

---

## 🏗️ Technical Architecture & Design Choices

### 1. Haversine Formula (GPS Verification)
**Why?** Euclidean distance (straight line on a flat plane) is inaccurate for spherical surfaces like Earth. Haversine accounts for Earth's curvature, providing precise meter-level accuracy for classroom-scale geo-fencing.
- **Time Complexity**: O(1)
- **Trade-off**: Slightly higher computational cost than simplified distance formulas, but essential for security.

### 2. Green Coding Principles
Implemented throughout the stack to reduce the system's carbon footprint:
- **Lazy Loading**: Major modules (Teacher/Student dashboards) are loaded only when needed, reducing initial energy consumed in data transfer and browser parsing.
- **Single GPS Fetch**: GPS sensors are battery-intensive. The system fetches location once and caches it for the session instead of continuous polling.
- **Firestore Batching**: Reduces the number of network round-trips.

### 3. Security & Anti-Spoofing
- **Server-side Validation**: Coordinates are never trusted from the client alone; the distance calculation happens on the secure server.
- **Audit Logs**: Every manual intervention by a teacher is logged with a timestamp and reason, preventing undocumented changes to academic records.
- **Face Capture**: Forces presence via biometric visual record.

---

## 📚 Viva / Interview Preparation

| Question | Answer / Analogy |
| :--- | :--- |
| **Why use Firebase?** | Analogy: Like renting a fully serviced apartment (Firebase) instead of building a house from scratch (Self-hosted server). It provides built-in Auth, DB, and Scaling. |
| **What is a "Middleman" in your API?** | These are Express Middlewares (like `multer` or `auth`). Analogy: A security guard checking IDs at the door before letting someone into the VIP area. |
| **How do you handle expired sessions?** | Each session has an `expiresAt` timestamp in Firestore. The server rejects any `mark` request where `Date.now() > expiresAt`. |
| **Alternative to Face Capture?** | BLE Beacons or Fingerprint scanners. Trade-off: Require specialized hardware, whereas Face Capture works on any smartphone. |

---

## ⚙️ Setup Instructions

### 1. Firebase Setup
1. Create a project in [Firebase Console](https://console.firebase.google.com/).
2. Enable Firestore, Auth, and Storage.
3. Generate a **Service Account Key** (Project Settings > Service Accounts).
4. Save it as `backend/serviceAccountKey.json`.

### 2. Backend
```bash
cd backend
npm install
# Ensure serviceAccountKey.json is present
node src/server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Folder Structure
```text
├── backend/
│   ├── src/
│   │   ├── routes/      # API definitions (Attendance, Auth)
│   │   ├── services/    # Firebase Admin initialization
│   │   └── utils/       # Haversine & Geo logic
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (FaceCapture)
│   │   ├── pages/       # Portal views (Teacher/Student)
│   │   └── index.css    # Glassmorphic Design System
└── README.md
```
