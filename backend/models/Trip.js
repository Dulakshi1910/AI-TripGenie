const mongoose = require('mongoose');
const { ChecklistItemSchema, UserChecklistSchema } = require('./Checklist');

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
    enum: [
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR',
      'KRW', 'BRL', 'MXN', 'RUB', 'ZAR', 'SGD', 'HKD', 'NZD', 'SEK',
      'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'TRY',
      'ILS', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'EGP', 'MAD',
      'NGN', 'GHS', 'KES', 'UGX', 'TZS', 'ZMW', 'BWP', 'MUR', 'SCR',
      'THB', 'MYR', 'IDR', 'PHP', 'VND', 'LAK', 'KHR', 'MMK', 'BDT',
      'PKR', 'LKR', 'NPR', 'BTN', 'MVR', 'AFN', 'IRR', 'IQD', 'SYP',
      'LBP', 'JOD', 'YER', 'GEL', 'AMD', 'AZN', 'KZT', 'KGS', 'TJS',
      'UZS', 'TMT', 'MNT', 'MDL', 'UAH', 'BYN', 'RSD', 'MKD', 'ALL',
      'BAM', 'EUR', 'ISK', 'FJD', 'TOP', 'WST', 'VUV', 'SBD', 'PGK',
      'NCX', 'XPF', 'CLP', 'PEN', 'COP', 'VES', 'GYD', 'SRD', 'UYU',
      'PYG', 'BOB', 'ARS', 'FKP', 'GGP', 'JEP', 'IMP', 'SHP', 'GIP'
    ]
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
    validator: function(value) {
      // Allow saving if the existing trip's start date is already in the past,
      // but prevent setting a new start date to the past.
      if (this.isModified('startDate') || this.isNew) { // Only validate if new or changed
        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
        return value.getTime() >= todayUtc.getTime();
      }
      return true; // Don't re-validate if not modified and already in the past
    },
    message: 'Start date must be in the future'
  }
},
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        // return value > this.startDate;
        return value.getTime() >= this.startDate.getTime();
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
      enum: ['none', 'vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'lactose-free', 'nut-free', 'diabetic']
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
    enum: ['draft', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  
  //Embed the UserChecklistSchema here
    userChecklist: {
        type: UserChecklistSchema,
        default: () => ({}) // Initialize with an empty object to ensure it's always present
    }
}, {
  timestamps: true
});

// Index for better query performance
tripSchema.index({ user: 1, createdAt: -1 });
tripSchema.index({ destinationCountry: 1 });
tripSchema.index({ startDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
