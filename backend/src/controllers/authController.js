const User = require('../models/User');
const generateToken = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signUp = async (req, res) => {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ message: 'Please include all fields' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
            fullName
        });

        if (user) {
            res.status(201).json({
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    createdAt: user.createdAt
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/signin
// @access  Public
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    createdAt: user.createdAt
                },
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        createdAt: req.user.createdAt
    };
    res.status(200).json(user);
};

module.exports = {
    signUp,
    signIn,
    getMe
};
