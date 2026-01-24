const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/auth.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, role, rollNo, className } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'Identity already exists in database' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            rollNo,
            className
        });

        if (user) {
            res.status(201).json({
                uid: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNo: user.rollNo,
                className: user.className,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                uid: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rollNo: user.rollNo,
                className: user.className,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ error: 'Invalid Identity or Passkey' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/auth/user/:uid
 * @desc    Get user profile (legacy support for fetching role)
 */
router.get('/user/:uid', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.uid).select('-password');
        if (user) {
            res.json({
                name: user.name,
                email: user.email,
                role: user.role,
                rollNo: user.rollNo,
                className: user.className
            });
        } else {
            res.status(404).json({ error: 'Identity not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   GET /api/auth/students/:className
 * @desc    Fetch all students in a specific class
 */
router.get('/students/:className', protect, async (req, res) => {
    try {
        const students = await User.find({
            className: req.params.className,
            role: 'student'
        }).select('name rollNo _id');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
