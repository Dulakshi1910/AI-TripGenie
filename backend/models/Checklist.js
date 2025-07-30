const mongoose = require('mongoose');

// Define the schema for a single checklist item
const ChecklistItemSchema = new mongoose.Schema({
    item: { type: String, required: true },
    checked: { type: Boolean, default: false },
    type: { type: String, enum: ['packing', 'place', 'restaurant', 'hotel', 'activity', 'other', 'custom'], required: true },
    bookingAction: String,
    time: String,
    location: String,
    description: String,
    day: Number,
    date: Date,
}, { _id: true });

// Define the schema for the user's overall checklist (if it's a subdocument of Trip)
const UserChecklistSchema = new mongoose.Schema({
    items: [ChecklistItemSchema],
    lastModifiedAt: { type: Date, default: Date.now },
}, { _id: false }); // Do not create a separate _id for the checklist itself if it's embedded

module.exports = {ChecklistItemSchema, UserChecklistSchema };             