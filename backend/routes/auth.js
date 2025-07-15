const express = require('express');
const { googleAuthCallback } = require('../controllers/authController');
const auth = require('../middleware/auth');
const {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  logoutUser
} = require('../controllers/authController');

const router = express.Router();

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Get current user (protected route)
router.get('/user', auth, getCurrentUser);

// Update profile (protected route)
router.put('/profile', auth, updateProfile);

// Change password (protected route)
router.put('/change-password', auth, changePassword);

// Logout user (protected route)
router.post('/logout', auth, logoutUser);

// Try to add Google OAuth routes if passport is available

const passport = require('passport');

// Google OAuth routes
router.get('/google',passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleAuthCallback
);

module.exports = router;