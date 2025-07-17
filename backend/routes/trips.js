const express = require('express');
const auth = require('../middleware/auth');
const {
  createTrip,
  getUserTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  regenerateTrip,
  activateTrip
} = require('../controllers/tripController');

const router = express.Router();

// All routes are protected
router.use(auth);

// @route   POST /api/trips
// @desc    Create a new trip plan
// @access  Private
router.post('/', createTrip);

// @route   GET /api/trips
// @desc    Get all trips for logged in user
// @access  Private
router.get('/', getUserTrips);

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Private
router.get('/:id', getTrip);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private
router.put('/:id', updateTrip);

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private
router.delete('/:id', deleteTrip);

// @route   POST /api/trips/:id/regenerate
// @desc    Regenerate trip plan with AI
// @access  Private
router.post('/:id/regenerate', regenerateTrip);

// @route   POST /api/trips/:id/activate
// @desc    Activate a draft trip
// @access  Private
router.post('/:id/activate', activateTrip);

module.exports = router;
