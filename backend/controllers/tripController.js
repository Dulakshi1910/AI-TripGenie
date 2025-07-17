const Trip = require('../models/Trip');
const aiService = require('../services/aiService');

// @desc    Create a new trip plan
// @route   POST /api/trips
// @access  Private
const createTrip = async (req, res) => {
  try {
    const {
      tripName,
      startPlace,
      destinationCountry,
      returnCountry,
      budget,
      currency,
      startDate,
      endDate,
      numberOfPeople,
      preferences,
      personalNeeds,
      status = 'draft' // Default to draft status
    } = req.body;

    // Validation
    if (!tripName || !startPlace || !destinationCountry || !returnCountry || 
        !budget || !startDate || !endDate || !numberOfPeople) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate status
    if (!['draft', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: draft, planning, confirmed, ongoing, completed, cancelled'
      });
    }

    // Validate dietary restrictions if provided
    if (preferences && preferences.dietaryRestrictions) {
      const validRestrictions = ['none', 'vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'lactose-free', 'nut-free', 'diabetic'];
      const invalidRestrictions = preferences.dietaryRestrictions.filter(r => !validRestrictions.includes(r));
      if (invalidRestrictions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid dietary restrictions: ${invalidRestrictions.join(', ')}. Valid options are: ${validRestrictions.join(', ')}`
        });
      }
    }

    // Validate activities if provided
    if (preferences && preferences.activities) {
      const validActivities = ['sightseeing', 'adventure', 'cultural', 'food', 'shopping', 'nightlife', 'relaxation', 'nature'];
      const invalidActivities = preferences.activities.filter(a => !validActivities.includes(a));
      if (invalidActivities.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid activities: ${invalidActivities.join(', ')}. Valid options are: ${validActivities.join(', ')}`
        });
      }
    }

    // Create trip object
    const tripData = {
      user: req.user.id,
      tripName,
      startPlace,
      destinationCountry,
      returnCountry,
      budget,
      currency: currency || 'USD',
      startDate,
      endDate,
      numberOfPeople,
      preferences: preferences || {},
      personalNeeds: personalNeeds || {},
      status
    };

    let aiResponse = null;
    
    // Only generate AI response if status is not draft
    if (status !== 'draft') {
      try {
        aiResponse = await aiService.generateTripPlan(tripData);
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        // Still save the trip even if AI fails
        aiResponse = null;
      }
    }
    
    // Create trip with or without AI response
    const trip = new Trip({
      ...tripData,
      aiResponse
    });

    await trip.save();

    res.status(201).json({
      success: true,
      message: `Trip ${status === 'draft' ? 'draft saved' : 'plan created'} successfully`,
      data: {
        trip
      }
    });
  } catch (error) {
    console.error('Create trip error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

// @desc    Get all trips for logged in user
// @route   GET /api/trips
// @access  Private
const getUserTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional status filter

    // Build filter object
    const filter = { user: req.user.id };
    if (status && ['draft', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username email');

    const total = await Trip.countDocuments(filter);

    res.json({
      success: true,
      count: trips.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: {
        trips
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
const getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'username email');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user owns the trip or if trip is public
    if (trip.user._id.toString() !== req.user.id && !trip.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        trip
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private
const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'username email');

    res.json({
      success: true,
      message: 'Trip updated successfully',
      data: {
        trip: updatedTrip
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

// @desc    Regenerate trip plan with AI
// @route   POST /api/trips/:id/regenerate
// @access  Private
const regenerateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate new AI response
    const aiResponse = await aiService.generateTripPlan(trip.toObject());
    
    // Update trip with new AI response
    trip.aiResponse = aiResponse;
    await trip.save();

    res.json({
      success: true,
      message: 'Trip plan regenerated successfully',
      data: {
        trip
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

// @desc    Activate a draft trip
// @route   POST /api/trips/:id/activate
// @access  Private
const activateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check if user owns the trip
    if (trip.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate AI response if not already generated
    if (!trip.aiResponse) {
      const aiResponse = await aiService.generateTripPlan(trip.toObject());
      trip.aiResponse = aiResponse;
    }

    // Update status to planning instead of active
    trip.status = 'planning';
    await trip.save();

    res.json({
      success: true,
      message: 'Trip activated successfully',
      data: {
        trip
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? {} : error.message
    });
  }
};

module.exports = {
  createTrip,
  getUserTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  regenerateTrip,
  activateTrip
};
