const Trip = require('../models/Trip');
const { ChecklistItemSchema, UserChecklistSchema } = require('../models/Checklist');  
const checklist = require('../models/Checklist');  


// Helper function to transform AI response to flat checklist format
const transformAiResponseToChecklist = (aiResponse) => {
    const items = [];

    // --- Packing List ---
    // Check if aiResponse and recommendations exist before accessing packingList
    if (aiResponse && aiResponse.recommendations && Array.isArray(aiResponse.recommendations.packingList)) {
        aiResponse.recommendations.packingList.forEach(item => {
            items.push({ item, checked: false, type: 'packing' });
        });
    } else {
        console.warn("AI Response is missing or malformed 'recommendations.packingList'.");
        // Optionally, you might add a default item or handle this missing data.
    }

    // --- Places to Visit (assuming they are in aiResponse.recommendations.placesToVisit) ---
    if (aiResponse && aiResponse.recommendations && Array.isArray(aiResponse.recommendations.placesToVisit)) {
        aiResponse.recommendations.placesToVisit.forEach(place => {
            items.push({ item: place.name || place, checked: false, type: 'place' }); // Handle if place is just a string or an object
        });
    } else {
        console.warn("AI Response is missing or malformed 'recommendations.placesToVisit'.");
    }

    // --- Hotels (assuming they are in aiResponse.hotelOptions) ---
    if (aiResponse && Array.isArray(aiResponse.hotelOptions)) {
        aiResponse.hotelOptions.forEach(hotel => {
            items.push({
                item: hotel.name || hotel.hotelName || hotel, // Try different property names or just the object if it's a string
                checked: false,
                type: 'hotel',
                bookingAction: `Book ${hotel.name || hotel.hotelName || hotel}`
            });
        });
    } else {
        console.warn("AI Response is missing or malformed 'hotelOptions'.");
    }

    // --- Itinerary / Activities ---
    if (aiResponse && Array.isArray(aiResponse.itinerary)) {
        aiResponse.itinerary.forEach(day => {
            if (Array.isArray(day.activities)) {
                day.activities.forEach(activity => {
                    items.push({
                        item: activity.name || activity.activity || activity,
                        checked: false,
                        type: 'activity',
                        time: activity.time,
                        location: activity.location,
                        description: activity.description,
                        day: day.day,
                        date: day.date ? new Date(day.date) : undefined // Convert date string to Date object
                    });
                });
            }
        });
    } else {
        console.warn("AI Response is missing or malformed 'itinerary'.");
    }

    // --- Restaurants (assuming they are in aiResponse.recommendations.restaurants) ---
    // You might have restaurants within recommendations or separately
    if (aiResponse && aiResponse.recommendations && Array.isArray(aiResponse.recommendations.restaurants)) {
        aiResponse.recommendations.restaurants.forEach(restaurant => {
            items.push({
                item: restaurant.name || restaurant,
                checked: false,
                type: 'restaurant',
                bookingAction: `Search & Book ${restaurant.name || restaurant}`
            });
        });
    } else {
        console.warn("AI Response is missing or malformed 'recommendations.restaurants'.");
    }


    // Return the structured checklist items
    return { items };
};

// @desc    Generate initial user checklist from AI response
// @route   POST /api/trips/:tripId/checklist/generate
// @access  Private
const generateUserChecklist = async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user.id; // Assuming user is available from auth middleware

    try {
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found.' });
        }

        // Ensure the user owns the trip
        if (trip.user.toString() !== userId) {
            return res.status(401).json({ success: false, message: 'Not authorized to access this trip.' });
        }

        // --- START OF NEW/MODIFIED LOGIC ---
        // Check if a checklist already exists and has items
        if (trip.userChecklist && trip.userChecklist.items && trip.userChecklist.items.length > 0) {
            console.log('Checklist already exists for this trip. Returning existing checklist.');
            return res.status(200).json({
                success: true,
                message: 'Checklist already exists and modifications are preserved.',
                data: trip.userChecklist // Return the existing checklist
            });
        }
        // --- END OF NEW/MODIFIED LOGIC ---

        if (!trip.aiResponse) {
            return res.status(400).json({ success: false, message: 'No AI response available for this trip to generate checklist.' });
        }

        // Transform AI response into checklist format
        const checklistData = transformAiResponseToChecklist(trip.aiResponse);

        // *** THE CRITICAL PART: SAVING TO THE DATABASE ***
        // Ensure userChecklist is initialized if it's null/undefined
        if (!trip.userChecklist) {
            trip.userChecklist = {};
        }

        trip.userChecklist.items = checklistData.items;
        trip.userChecklist.lastModifiedAt = new Date();

        await trip.save(); // <--- THIS LINE IS KEY FOR PERSISTENCE

        res.status(200).json({
            success: true,
            data: trip.userChecklist, // Send back the saved checklist
            message: 'Checklist generated and saved successfully.'
        });

    } catch (error) {
        console.error('Error generating or saving checklist:', error);
        res.status(500).json({ success: false, message: 'Failed to generate or save checklist.' });
    }
};

// @desc    Get user's checklist for a trip
// @route   GET /api/trips/:tripId/checklist
// @access  Private
const getUserChecklist = async (req, res) => {
    const { tripId } = req.params;
    try {
        // Ensure user owns the trip when fetching the checklist
        const trip = await Trip.findById(tripId).select('user userChecklist'); // Select user to check ownership

        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }

        // Check if user owns the trip
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this checklist.' });
        }

        res.status(200).json({ success: true, data: trip.userChecklist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a specific checklist item (e.g., toggle checked)
// @route   PUT /api/trips/:tripId/checklist/items/:itemId
// @access  Private
const updateChecklistItem = async (req, res) => {
    const { tripId, itemId } = req.params;
    const { checked, item, time, location, description } = req.body; // What you allow to update
    const userId = req.user.id;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }
        // Check user ownership
        if (trip.user.toString() !== userId) {
            return res.status(401).json({ success: false, message: 'Not authorized to update this checklist.' });
        }

        if (!trip.userChecklist || !trip.userChecklist.items) {
            return res.status(404).json({ success: false, message: 'Checklist not found for this trip.' });
        }

        const itemToUpdate = trip.userChecklist.items.id(itemId); // Mongoose subdocument .id()
        if (!itemToUpdate) {
            return res.status(404).json({ success: false, message: 'Checklist item not found.' });
        }

        // Apply updates only if the property is present in the request body
        if (typeof checked === 'boolean') itemToUpdate.checked = checked;
        if (item !== undefined) itemToUpdate.item = item; // Allow item to be empty string if intended
        if (time !== undefined) itemToUpdate.time = time;
        if (location !== undefined) itemToUpdate.location = location;
        if (description !== undefined) itemToUpdate.description = description;

        trip.userChecklist.lastModifiedAt = new Date();
        await trip.save();

        res.status(200).json({ success: true, data: itemToUpdate });
    } catch (error) {
        console.error('Error updating checklist item:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add a new custom checklist item
// @route   POST /api/trips/:tripId/checklist/items
// @access  Private
const addChecklistItem = async (req, res) => {
    const { tripId } = req.params;
    const newItemData = req.body; // Should contain { item: '...', type: 'custom', checked: false, ... }
    const userId = req.user.id;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }
        // Check user ownership
        if (trip.user.toString() !== userId) {
            return res.status(401).json({ success: false, message: 'Not authorized to add to this checklist.' });
        }

        if (!trip.userChecklist) {
            trip.userChecklist = { items: [], lastModifiedAt: new Date() }; // Initialize if not present
        }

        // Validate basic new item data
        if (!newItemData.item) {
            return res.status(400).json({ success: false, message: 'New checklist item text is required.' });
        }
        if (!newItemData.type) {
             // Default type if not provided, or ensure it's valid
            newItemData.type = 'custom';
        }

        const newItem = trip.userChecklist.items.create(newItemData); // Mongoose subdocument .create()
        trip.userChecklist.items.push(newItem);
        trip.userChecklist.lastModifiedAt = new Date();
        await trip.save();

        res.status(201).json({ success: true, data: newItem });
    } catch (error) {
        console.error('Error adding checklist item:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a specific checklist item
// @route   DELETE /api/trips/:tripId/checklist/items/:itemId
// @access  Private
const deleteChecklistItem = async (req, res) => {
    const { tripId, itemId } = req.params;
    const userId = req.user.id;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ success: false, message: 'Trip not found' });
        }
        // Check user ownership
        if (trip.user.toString() !== userId) {
            return res.status(401).json({ success: false, message: 'Not authorized to delete from this checklist.' });
        }

        if (!trip.userChecklist || !trip.userChecklist.items) {
            return res.status(404).json({ success: false, message: 'Checklist not found for this trip.' });
        }

        const itemExists = trip.userChecklist.items.some(item => item._id.toString() === itemId);
        if (!itemExists) {
            return res.status(404).json({ success: false, message: 'Checklist item not found.' });
        }

        trip.userChecklist.items.pull(itemId); // Mongoose subdocument .pull()
        trip.userChecklist.lastModifiedAt = new Date();
        await trip.save();

        res.status(200).json({ success: true, message: 'Item deleted successfully.' });
    } catch (error) {
        console.error('Error deleting checklist item:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
  generateUserChecklist,
  getUserChecklist,
  updateChecklistItem,
  addChecklistItem,
  deleteChecklistItem
};