const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');

const auth = async (req, res, next) => {

  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      console.log('No valid auth header found');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted
    const blacklistedToken = await BlacklistedToken.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has been invalidated' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    // Get user from database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('User found:', user.username);
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      console.log('Token expired');
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      console.log('Invalid token');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    res.status(401).json({ 
      success: false, 
      message: 'Token verification failed' 
    });
  }
};

module.exports = auth;

