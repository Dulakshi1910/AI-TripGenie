const express = require('express');
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

module.exports = router;