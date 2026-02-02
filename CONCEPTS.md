# Core Concepts: Smart Attendance System

This document explains the fundamental principles and concepts that drive the Smart Attendance System, focusing on efficiency, security, and modern design.

## 1. Green Coding (Sustainability)
Green Coding is the practice of writing code that minimizes the energy consumption of the software. In this project, we implement several "Green" strategies:

- **Single-Fetch GPS**: Mobile GPS chips are power-hungry. We fetch the student's location once and cache it, rather than continuous polling, saving up to 90% of GPS-related battery drain.
- **Tree-Shaking & Lazy Loading**: Only the code necessary for the current view (Teacher vs Student) is loaded. This reduces data transmission and CPU cycles for parsing unnecessary JavaScript.
- **Resource Efficiency**: Use of modern CSS effects (Glassmorphism) instead of high-resolution images reduces the carbon footprint associated with data center storage and bandwidth.

## 2. Geo-fencing (Haversine Formula)
Geo-fencing creates a virtual boundary around a physical location (e.g., a classroom).

- **The Math**: We use the **Haversine Formula** to calculate the distance between the student and the teacher's session center. Unlike simple Euclidean math, Haversine accounts for the Earth's curvature, ensuring accuracy even at small scales.
- **Security**: Verification happens on the **backend**. The client sends coordinates, but the server calculates the final distance against the session's radius, preventing users from "faking" a success status in the browser.

## 3. Real-time Synchronization (Socket.io Relay)
Instead of the client checking for updates every few seconds (polling), we use a persistent WebSocket connection.

- **Relay Hub**: The server acts as a central hub. When a student marks attendance, the event is "relayed" instantly to the teacher's dashboard.
- **Efficiency**: Open WebSockets are significantly more energy-efficient than repeated HTTP requests for real-time data.

## 4. Bio-Identity (Biometrics)
To prevent "buddy marking" (where one student marks for another), we use **Live Face Capture**.

- **Visual Audit**: Every attendance mark is accompanied by a timestamped photo. This provides a non-repudiable record of presence.
- **Privacy-First**: Images are stored securely and intended for audit purposes by authorized faculty only.

## 5. Modern UI Design (Glassmorphism)
The project utilizes a **Glassmorphic Design System** to provide a premium feel without sacrificing performance.

- **Principles**: Transparency, multi-layered approach, and soft background blurs.
- **Performance**: Achieved purely via CSS (`backdrop-filter: blur()`), avoiding the need for heavy graphic assets.
