const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetClass: { type: String, required: true },
    joinCode: { type: String, required: true, unique: true },

    coords: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    radius: { type: Number, default: 50 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
