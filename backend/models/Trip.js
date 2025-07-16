const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tripName: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true,
    maxlength: [100, 'Trip name cannot exceed 100 characters']
  },
  startPlace: {
    type: String,
    required: [true, 'Start place is required'],
    trim: true
  },
  destinationCountry: {
    type: String,
    required: [true, 'Destination country is required'],
    trim: true
  },
  returnCountry: {
    type: String,
    required: [true, 'Return country is required'],
    trim: true
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'Start date must be in the future'
    }
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  numberOfPeople: {
    type: Number,
    required: [true, 'Number of people is required'],
    min: [1, 'Number of people must be at least 1'],
    max: [50, 'Number of people cannot exceed 50']
  },
  preferences: {
    accommodation: {
      type: String,
      enum: ['budget', 'mid-range', 'luxury', 'any'],
      default: 'any'
    },
    transportation: {
      type: String,
      enum: ['economy', 'business', 'first-class', 'any'],
      default: 'economy'
    },
    activities: [{
      type: String,
      enum: ['sightseeing', 'adventure', 'cultural', 'food', 'shopping', 'nightlife', 'relaxation', 'nature']
    }],
    dietaryRestrictions: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'none']
    }],
    travelStyle: {
      type: String,
      enum: ['backpacker', 'comfort', 'luxury', 'family', 'romantic', 'business'],
      default: 'comfort'
    }
  },
  personalNeeds: {
    accessibilityRequirements: {
      type: String,
      trim: true
    },
    medicalNeeds: {
      type: String,
      trim: true
    },
    specialRequests: {
      type: String,
      trim: true
    }
  },
  aiResponse: {
    flightOptions: [{
      airline: String,
      departure: Date,
      arrival: Date,
      price: Number,
      duration: String,
      stops: Number
    }],
    hotelOptions: [{
      name: String,
      location: String,
      pricePerNight: Number,
      rating: Number,
      amenities: [String]
    }],
    itinerary: [{
      day: Number,
      date: Date,
      activities: [{
        time: String,
        activity: String,
        location: String,
        estimatedCost: Number,
        description: String
      }]
    }],
    budgetBreakdown: {
      flights: Number,
      accommodation: Number,
      activities: Number,
      food: Number,
      transportation: Number,
      miscellaneous: Number,
      total: Number
    },
    recommendations: {
      placesToVisit: [String],
      restaurants: [String],
      localTips: [String],
      packingList: [String],
      weatherInfo: String,
      visaRequirements: String,
      vaccinations: [String]
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'planning'
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ destinationCountry: 1 });
tripSchema.index({ startDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
