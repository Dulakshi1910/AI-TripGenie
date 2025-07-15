const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
     console.log('Google callback received profile:', profile);
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        // User exists, return the user
        return done(null, user);
      }

      // Check if user exists with the same email
      const email = profile.emails[0].value;
      user = await User.findOne({ email });

      if (!profile.emails || !profile.emails.length) {
      return done(new Error('No email found in Google profile'), null);
      }

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.id;
        user.picture = profile.photos[0].value;
        await user.save();
        return done(null, user);
      }
    let username = profile.displayName.toLowerCase().replace(/\s+/g, '_');
      
    // Check if username exists, make it unique if needed
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      //adding random string
        username = `${username}_${Math.random().toString(36).substring(2, 7)}`;
    }

    // Create new user
      const newUser = new User({
        googleId: profile.id,
        username: username,
        email: email,
        picture: profile.photos[0].value
      });

      await newUser.save();
      return done(null, newUser);
    } catch (error) {
      console.error('Error in Google Strategy:', error);
      return done(error, null);
    }
  }
));

module.exports = passport;

