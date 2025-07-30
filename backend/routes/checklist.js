const express = require('express');
const auth = require('../middleware/auth');
const {
  generateUserChecklist,
  getUserChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem
} = require('../controllers/checklistController');

const router = express.Router();

// All routes are protected
router.use(auth);

// POST /api/trips/:tripId/checklist/generate
// Generates the initial checklist from AI response and saves it
router.post('/:tripId/checklist/generate', generateUserChecklist);

// GET /api/trips/:tripId/checklist
// Get the user's current checklist for a trip
router.get('/:tripId/checklist', getUserChecklist);

// POST /api/trips/:tripId/checklist/items
// Add a new custom checklist item
router.post('/:tripId/checklist/items', addChecklistItem);

// PUT /api/trips/:tripId/checklist/items/:itemId
// Update a specific checklist item (e.g., toggle checked status, edit text)
router.put('/:tripId/checklist/items/:itemId', updateChecklistItem);

// DELETE /api/trips/:tripId/checklist/items/:itemId
// Delete a specific checklist item
router.delete('/:tripId/checklist/items/:itemId', deleteChecklistItem);

module.exports = router;
