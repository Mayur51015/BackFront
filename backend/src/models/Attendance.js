const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['verified', 'manual'], default: 'verified' },
    method: { type: String, enum: ['automatic', 'override'], default: 'automatic' },
    faceUrl: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
