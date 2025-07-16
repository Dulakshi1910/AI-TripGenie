const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY is not defined in environment variables');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  }

  async generateTripPlan(tripData) {
    try {
      const prompt = this.buildTripPlanningPrompt(tripData);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate trip plan: ' + error.message);
    }
  }

  buildTripPlanningPrompt(tripData) {
    const {
      tripName,
      startPlace,
      destinationCountry,
      returnCountry,
      budget,
      currency,
      startDate,
      endDate,
      numberOfPeople,
      preferences,
      personalNeeds
    } = tripData;

    const duration = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    
    return `
You are a professional travel planner. Create a detailed trip plan with the following specifications:

**Trip Details:**
- Trip Name: ${tripName}
- From: ${startPlace}
- To: ${destinationCountry}
- Return to: ${returnCountry}
- Budget: ${budget} ${currency} (for ${numberOfPeople} people)
- Duration: ${duration} days
- Start Date: ${startDate}
- End Date: ${endDate}
- Number of People: ${numberOfPeople}

**Preferences:**
- Accommodation: ${preferences.accommodation || 'any'}
- Transportation: ${preferences.transportation || 'economy'}
- Activities: ${preferences.activities?.join(', ') || 'general sightseeing'}
- Dietary Restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'none'}
- Travel Style: ${preferences.travelStyle || 'comfort'}

**Personal Needs:**
- Accessibility: ${personalNeeds.accessibilityRequirements || 'None'}
- Medical Needs: ${personalNeeds.medicalNeeds || 'None'}
- Special Requests: ${personalNeeds.specialRequests || 'None'}

IMPORTANT: Respond ONLY with a valid JSON object. Do not include any text before or after the JSON.

{
  "flightOptions": [
    {
      "airline": "Example Airlines",
      "departure": "${startDate}T10:00:00Z",
      "arrival": "${startDate}T18:00:00Z",
      "returnDeparture": "${endDate}T14:00:00Z",
      "returnArrival": "${endDate}T22:00:00Z",
      "price": ${Math.floor(budget * 0.3)},
      "duration": "8h 30m",
      "stops": 1,
      "class": "${preferences.transportation || 'economy'}"
    }
  ],
  "hotelOptions": [
    {
      "name": "Example Hotel",
      "location": "City Center",
      "pricePerNight": ${Math.floor(budget * 0.15 / duration)},
      "rating": 4.2,
      "amenities": ["WiFi", "Pool", "Breakfast"],
      "totalCost": ${Math.floor(budget * 0.4)}
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "date": "${startDate}",
      "activities": [
        {
          "time": "09:00 AM",
          "activity": "Arrival and Check-in",
          "location": "Hotel",
          "estimatedCost": 0,
          "description": "Arrive and settle in"
        },
        {
          "time": "2:00 PM",
          "activity": "City Tour",
          "location": "Downtown",
          "estimatedCost": 50,
          "description": "Explore the main attractions"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "flights": ${Math.floor(budget * 0.35)},
    "accommodation": ${Math.floor(budget * 0.30)},
    "activities": ${Math.floor(budget * 0.20)},
    "food": ${Math.floor(budget * 0.10)},
    "transportation": ${Math.floor(budget * 0.03)},
    "miscellaneous": ${Math.floor(budget * 0.02)},
    "total": ${budget}
  },
  "recommendations": {
    "placesToVisit": ["Main Square", "Historic District", "Local Museum"],
    "restaurants": ["Local Cuisine Restaurant", "International Food Court"],
    "localTips": ["Try local specialties", "Use public transport", "Respect local customs"],
    "packingList": ["Comfortable shoes", "Weather-appropriate clothing", "Travel documents"],
    "weatherInfo": "Check current weather conditions for ${destinationCountry}",
    "visaRequirements": "Check visa requirements for ${destinationCountry}",
    "vaccinations": ["Consult healthcare provider"]
  }
}

Make sure all costs are realistic and within the ${budget} ${currency} budget for ${numberOfPeople} people.
`;
  }

  parseAIResponse(text) {
    try {
      // Remove any markdown formatting
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      
      // Find the JSON object
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const jsonString = jsonMatch[0];
      const parsed = JSON.parse(jsonString);
      
      // Validate and ensure required fields exist
      const validatedResponse = {
        flightOptions: parsed.flightOptions || [],
        hotelOptions: parsed.hotelOptions || [],
        itinerary: parsed.itinerary || [],
        budgetBreakdown: parsed.budgetBreakdown || {
          flights: 0,
          accommodation: 0,
          activities: 0,
          food: 0,
          transportation: 0,
          miscellaneous: 0,
          total: 0
        },
        recommendations: parsed.recommendations || {
          placesToVisit: [],
          restaurants: [],
          localTips: [],
          packingList: [],
          weatherInfo: '',
          visaRequirements: '',
          vaccinations: []
        }
      };
      
      return validatedResponse;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw AI response:', text);
      
      // Return a more structured fallback response
      return {
        flightOptions: [{
          airline: "Please regenerate plan",
          departure: new Date().toISOString(),
          arrival: new Date().toISOString(),
          price: 0,
          duration: "N/A",
          stops: 0
        }],
        hotelOptions: [{
          name: "Please regenerate plan",
          location: "N/A",
          pricePerNight: 0,
          rating: 0,
          amenities: []
        }],
        itinerary: [{
          day: 1,
          date: new Date().toISOString().split('T')[0],
          activities: [{
            time: "N/A",
            activity: "Please regenerate trip plan",
            location: "N/A",
            estimatedCost: 0,
            description: "AI response parsing failed"
          }]
        }],
        budgetBreakdown: {
          flights: 0,
          accommodation: 0,
          activities: 0,
          food: 0,
          transportation: 0,
          miscellaneous: 0,
          total: 0
        },
        recommendations: {
          placesToVisit: [],
          restaurants: [],
          localTips: ['Please regenerate the trip plan for detailed recommendations'],
          packingList: [],
          weatherInfo: 'Weather information not available',
          visaRequirements: 'Please check visa requirements',
          vaccinations: []
        }
      };
    }
  }
}

module.exports = new AIService();
