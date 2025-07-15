require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const { scheduleTokenCleanup } = require('./utils/tokenCleanup');

// Check for required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create or update your .env file with these variables');
  process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());
app.use("/",(req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Try to initialize Passport if available
try {
  const passport = require('passport');
  require('./config/passport');
  app.use(passport.initialize());
  console.log('Passport initialized successfully');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.warn('Passport module not found. Google OAuth will not be available.');
    console.warn('Run "npm install passport passport-google-oauth20" to enable Google login.');
  } else {
    console.error('Error initializing passport:', error);
  }
}

// Connect to database
connectDB();

// Schedule token cleanup
scheduleTokenCleanup();

// Routes
app.use('/api/auth', require('./routes/auth'));

// Define port
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
