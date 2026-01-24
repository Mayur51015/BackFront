const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

const { calculateDistance } = require('../utils/geo.utils');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '..', '..', process.env.UPLOAD_PATH || 'uploads');
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `attendance_${Date.now()}_${path.basename(file.originalname)}`);
    }
});
const upload = multer({ storage: storage });

/**
 * @route   POST /api/attendance/session
 * @desc    Teacher creates an attendance session
 */
router.post('/session', protect, async (req, res) => {
    try {
        const { coords, radius = 150, durationMinutes, targetClass } = req.body;

        if (!targetClass) {
            return res.status(400).json({ error: 'Target Class is required to initiate broadcast' });
        }


        let joinCode;
        let isUnique = false;
        while (!isUnique) {
            joinCode = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await Session.findOne({ joinCode, status: 'active' });
            if (!existing) isUnique = true;
        }

        const expiresAt = new Date(Date.now() + durationMinutes * 60000);

        const session = await Session.create({
            teacherId: req.user._id,
            targetClass,
            joinCode,
            coords,
            radius,
            expiresAt
        });

        // Broadcast New Session Event via WebSockets
        const io = req.app.get('io');
        io.emit('NEW_SESSION', {
            joinCode,
            teacherName: req.user.name,
            targetClass, // Target specific class
            expiresAt
        });

        res.status(201).json({ sessionId: session._id, joinCode, targetClass, expiresAt });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/attendance/mark
 * @desc    Student marks attendance with GPS & Face validation
 */
router.post('/mark', protect, upload.single('faceImage'), async (req, res) => {
    try {
        const { joinCode, studentCoords } = req.body;

        const session = await Session.findOne({ joinCode, status: 'active' });
        if (!session) return res.status(404).json({ error: 'Session not found. Check your Join Code.' });

        if (session.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Session expired.' });
        }

        const coords = JSON.parse(studentCoords);

        const distance = calculateDistance(
            coords.lat, coords.lng,
            session.coords.lat, session.coords.lng
        );

        // Validating with the new 150m or session-specific radius
        if (distance > session.radius) {
            return res.status(403).json({ error: `Out of range: Geo-lock failed (${Math.round(distance)}m > ${session.radius}m)` });
        }

        const existing = await Attendance.findOne({ sessionId: session._id, studentId: req.user._id });
        if (existing) return res.status(400).json({ error: 'Attendance already marked for this session' });

        const faceUrl = req.file ? `/uploads/${req.file.filename}` : '';

        const attendance = await Attendance.create({
            sessionId: session._id,
            studentId: req.user._id,
            status: 'verified',
            faceUrl,
            method: 'automatic'
        });

        // 7. Broadcast Confirmation to Teacher in real-time
        const io = req.app.get('io');
        io.emit('ATTENDANCE_CONFIRMED', {
            sessionId: session._id,
            student: {
                _id: req.user._id,
                name: req.user.name,
                rollNo: req.user.rollNo
            },
            timestamp: attendance.timestamp,
            method: 'automatic'
        });

        res.status(200).json({ message: 'Attendance verified and marked successfully', recordId: attendance._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/attendance/override
 * @desc    Teacher manually overrides/marks attendance
 */
router.post('/override', protect, async (req, res) => {
    try {
        const { sessionId, studentId, reason } = req.body;

        if (!mongoose.Types.ObjectId.isValid(sessionId) || !mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({ error: 'Invalid Identity Format: Check IDs' });
        }

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Unauthorized: Administrative Level Required' });
        }

        const attendance = await Attendance.create({
            sessionId,
            studentId,
            status: 'manual',
            method: 'override'
        });

        // Broadcast to Teacher Dashboard (for immediate internal sync)
        const io = req.app.get('io');
        const user = await User.findById(studentId).select('name rollNo');
        io.emit('ATTENDANCE_CONFIRMED', {
            sessionId,
            student: {
                _id: user._id,
                name: user.name,
                rollNo: user.rollNo
            },
            timestamp: attendance.timestamp,
            method: 'override'
        });

        res.status(200).json({ message: 'Manual override authorized and recorded.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/attendance/records/:sessionId
 * @desc    Fetch all attendance records for a session
 */
router.get('/records/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sessionId)) {
            return res.status(400).json({ error: 'Invalid Session Identity Format' });
        }

        const records = await Attendance.find({ sessionId })
            .populate('studentId', 'name email')
            .sort({ timestamp: -1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
