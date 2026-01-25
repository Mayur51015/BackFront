const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Create uploads directory
const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

// WebSocket Logic
io.on('connection', (socket) => {
    console.log('User Connected to Relay Hub:', socket.id);
    socket.on('disconnect', () => console.log('User Disconnected from Hub'));
});

// App.set for access in routes
app.set('io', io);

// Routes
const attendanceRoutes = require('./routes/attendance.routes');
const authRoutes = require('./routes/auth.routes');
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date(),
        message: 'Smart Attendance System API is healthy'
    });
});

app.get('/', (req, res) => {
    res.send('Smart Attendance System API (WebSocket Edition) is running...');
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
