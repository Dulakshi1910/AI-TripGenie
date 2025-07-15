const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

// Drop existing indexes and create new ones
async function setupIndexes() {
  try {
    const collection = mongoose.connection.collection('blacklistedtokens');
    
    // Drop existing indexes
    await collection.dropIndexes();
    console.log('Dropped existing indexes');

    // Create new indexes
    await collection.createIndex({ token: 1 }, { unique: true });
    await collection.createIndex(
      { createdAt: 1 },
      { expireAfterSeconds: 30 }
    );
    console.log('Created new indexes including TTL');
  } catch (err) {
    console.error('Error setting up indexes:', err);
  }
}

// Run setup after connection is established
mongoose.connection.once('connected', () => {
  setupIndexes();
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
