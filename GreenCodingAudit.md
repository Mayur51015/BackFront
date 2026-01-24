# 🌱 Green Coding Audit: Smart Attendance System

This document outlines the energy-efficient design choices made in the project, explain the **What, Why, and How** of each optimization.

---

## 1. Single-Fetch GPS Strategy
- **What**: The browser fetches GPS coordinates only once per session instead of continuous tracking.
- **Why**: GPS hardware is one of the most energy-intensive components in a mobile device. Continuous polling causes significant battery drain.
- **How**: 
    ```javascript
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(pos => setCoords(...));
    }, []); // Empty dependency array ensures it runs only once
    ```
- **Energy Impact**: Reduces GPS chip active time from minutes (duration of session) to ~5 seconds.

## 2. Lazy Loading (Code Splitting)
- **What**: Breaking the application into small chunks and loading them only when requested.
- **Why**: Reduces the initial data payload (electricity used in transmission) and the CPU load required to parse JavaScript.
- **How**: 
    ```javascript
    const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
    ```
- **Energy Impact**: A student's device doesn't waste energy downloading and parsing the heavy Teacher/QR-code logic.

## 3. Minimal Network Payload (Glassmorphism vs Images)
- **What**: Using CSS-based design (Glassmorphism) instead of heavy background images or library-heavy components.
- **Why**: Every Kilobyte transferred over the internet contributes to a carbon footprint from data centers.
- **How**: Using CSS `backdrop-filter` and `rgba` gradients to create a premium look without image assets.
- **Energy Impact**: Reduced asset download size by ~80% compared to image-heavy landing pages.

## 4. Firestore Optimization (No Polling)
- **What**: Using manual refresh or real-time listeners (optional) instead of HTTP polling.
- **Why**: HTTP polling creates constant network wake-ups, preventing the device's radio from entering sleep mode.
- **How**: Replaced auto-refresh loops with a user-triggered "Sync" button in the Teacher Dashboard.
- **Energy Impact**: Drastically reduces network idle wake-ups on both client and server.

## 5. Efficient API (Stateless Design)
- **What**: Single POST request for attendance marking.
- **Why**: Reduces network round-trips. Each trip requires power for handshaking, encryption, and radio transmission.
- **How**: The `/mark` endpoint handles validation, Haversine calculation, and DB write in a single atomic flow.
- **Energy Impact**: Minimizes server-side CPU cycles and client-side radio active time.
