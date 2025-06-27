require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Middleware
app.use("/",(req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

// Connect to database
connectDB();

// Define port
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
