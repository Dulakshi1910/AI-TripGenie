import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { tripApi } from '../../services/tripApi';
import type { Trip } from '../../services/tripApi';

const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTripDetails();
    }
  }, [id]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripApi.getTrip(id!) as {
        success: boolean;
        data: { trip: Trip };
      };
      
      if (response.success) {
        setTrip(response.data.trip);
      } else {
        setError('Failed to fetch trip details');
      }
    } catch (err: any) {
      console.error('Error fetching trip details:', err);
      setError(err.response?.data?.message || 'Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateTrip = async () => {
    if (!trip || !id) return;
    
    try {
      setLoading(true);
      await tripApi.regenerateTrip(id);
      await fetchTripDetails(); // Refresh the trip details
    } catch (err: any) {
      console.error('Error regenerating trip:', err);
      alert('Failed to regenerate trip plan');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!trip || !id) return;
    
    try {
      setIsUpdatingStatus(true);
      const response = await tripApi.updateTrip(id, { status: newStatus });
      
      if (response.success) {
        setTrip(prev => prev ? { ...prev, status: newStatus } : null);
      } else {
        alert('Failed to update trip status');
      }
    } catch (err: any) {
      console.error('Error updating trip status:', err);
      alert('Failed to update trip status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleActivateTrip = async () => {
    if (!trip || !id) return;
    
    try {
      setLoading(true);
      await tripApi.activateTrip(id);
      await fetchTripDetails();
    } catch (err: any) {
      console.error('Error activating trip:', err);
      alert('Failed to activate trip');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCheckList = async () => {
    if (!trip || !id) return;
    
    try {
      setLoading(true);
      // TODO: Implement check list generation API call
      // await tripApi.generateCheckList(id);
      alert('Check list generation feature coming soon!');
    } catch (err: any) {
      console.error('Error generating check list:', err);
      alert('Failed to generate check list');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400';
      case 'ongoing':
        return 'bg-purple-500/20 text-purple-400';
      case 'planning':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading trip details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !trip) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-4">
            {error || 'Trip not found'}
          </div>
          <Link 
            to="/dashboard/trips"
            className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-all"
          >
            Back to Trips
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link 
              to="/dashboard/trips"
              className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Trips
            </Link>
            <h1 className="text-3xl font-bold text-white">{trip.tripName}</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Status Update Dropdown */}
            <div className="relative">
              <select
                value={trip.status || 'draft'}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={isUpdatingStatus}
                className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-all ${
                  getStatusColor(trip.status || 'draft')
                } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
              >
                <option value="draft">Draft</option>
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {isUpdatingStatus && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                </div>
              )}
            </div>

            {trip.aiResponse && (
              <button
                onClick={handleGenerateCheckList}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
              >
                Generate Check List
              </button>
            )}
          </div>
        </div>

        {/* Trip Overview */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{trip.destinationCountry}</div>
              <div className="text-sm text-gray-400">Destination</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{trip.budget} {trip.currency}</div>
              <div className="text-sm text-gray-400">Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{trip.numberOfPeople}</div>
              <div className="text-sm text-gray-400">People</div>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <span className="text-sm text-gray-400">Current Status: </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status || 'draft')}`}>
                {trip.status || 'draft'}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {trip.status === 'draft' && (
                <button
                  onClick={handleActivateTrip}
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? 'Activating Plan...' : 'Activate AI Plan'}
                </button>
              )}
              
              {trip.status === 'planning' && (
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  disabled={isUpdatingStatus}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-sm"
                >
                  Confirm Trip
                </button>
              )}
              
              {trip.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusUpdate('ongoing')}
                  disabled={isUpdatingStatus}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 text-sm"
                >
                  Start Trip
                </button>
              )}
              
              {trip.status === 'ongoing' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdatingStatus}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 text-sm"
                >
                  Complete Trip
                </button>
              )}
              
              {trip.status !== 'cancelled' && trip.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={isUpdatingStatus}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 text-sm"
                >
                  Cancel Trip
                </button>
              )}
            </div>
          </div>
        </div>

        {/* No AI Response */}
        {!trip.aiResponse && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-6 py-4 rounded-xl text-center">
            <h3 className="font-semibold mb-2">No AI plan generated yet</h3>
            <p className="text-sm mb-4">This trip is in draft mode. Generate an AI plan to see detailed recommendations.</p>
            <button
              onClick={handleActivateTrip}
              disabled={loading}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate AI Plan'}
            </button>
          </div>
        )}

        {/* AI Response Tabs */}
        {trip.aiResponse && (
          <>
            {/* Tab Navigation */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
              <div className="flex space-x-0 border-b border-slate-700 overflow-x-auto">
                { [
                  { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                  { id: 'itinerary', label: 'Itinerary', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { id: 'flights', label: 'Flights', icon: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' },
                  { id: 'hotels', label: 'Hotels', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                  { id: 'budget', label: 'Budget', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-white mb-2">Places to Visit</h4>
                            <ul className="space-y-1">
                              {trip.aiResponse.recommendations?.placesToVisit?.map((place, index) => (
                                <li key={index} className="text-gray-300 text-sm">• {place}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">Restaurants</h4>
                            <ul className="space-y-1">
                              {trip.aiResponse.recommendations?.restaurants?.map((restaurant, index) => (
                                <li key={index} className="text-gray-300 text-sm">• {restaurant}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Travel Tips</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-white mb-2">Local Tips</h4>
                            <ul className="space-y-1">
                              {trip.aiResponse.recommendations?.localTips?.map((tip, index) => (
                                <li key={index} className="text-gray-300 text-sm">• {tip}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">Packing List</h4>
                            <ul className="space-y-1">
                              {trip.aiResponse.recommendations?.packingList?.map((item, index) => (
                                <li key={index} className="text-gray-300 text-sm">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Itinerary Tab */}
                {activeTab === 'itinerary' && (
                  <div className="space-y-6">
                    {trip.aiResponse.itinerary?.map((day, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Day {day.day} - {formatDate(day.date)}
                        </h3>
                        <div className="space-y-4">
                          {day.activities?.map((activity, actIndex) => (
                            <div key={actIndex} className="flex items-start space-x-4">
                              <div className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                                {activity.time}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-white">{activity.activity}</h4>
                                <p className="text-gray-400 text-sm">{activity.location}</p>
                                <p className="text-gray-300 text-sm mt-1">{activity.description}</p>
                                {activity.estimatedCost > 0 && (
                                  <p className="text-green-400 text-sm mt-1">
                                    Est. Cost: {activity.estimatedCost} {trip.currency}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Flights Tab */}
                {activeTab === 'flights' && (
                  <div className="space-y-6">
                    {trip.aiResponse.flightOptions?.map((flight, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">{flight.airline}</h3>
                          <span className="text-green-400 font-semibold">{flight.price} {trip.currency}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-white mb-2">Departure</h4>
                            <p className="text-gray-300">{formatDate(flight.departure)}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">Arrival</h4>
                            <p className="text-gray-300">{formatDate(flight.arrival)}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">Duration</h4>
                            <p className="text-gray-300">{flight.duration}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-white mb-2">Stops</h4>
                            <p className="text-gray-300">{flight.stops} {flight.stops === 1 ? 'stop' : 'stops'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hotels Tab */}
                {activeTab === 'hotels' && (
                  <div className="space-y-6">
                    {trip.aiResponse.hotelOptions?.map((hotel, index) => (
                      <div key={index} className="bg-slate-700/50 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">{hotel.name}</h3>
                          <div className="text-right">
                            <p className="text-green-400 font-semibold">{hotel.pricePerNight} {trip.currency}/night</p>
                            <p className="text-yellow-400 text-sm">★ {hotel.rating}</p>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4">{hotel.location}</p>
                        <div>
                          <h4 className="font-medium text-white mb-2">Amenities</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.amenities?.map((amenity, amenityIndex) => (
                              <span key={amenityIndex} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full text-xs">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Budget Tab */}
                {activeTab === 'budget' && (
                  <div className="space-y-6">
                    <div className="bg-slate-700/50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-6">Budget Breakdown</h3>
                      <div className="space-y-4">
                        {trip.aiResponse.budgetBreakdown && Object.entries(trip.aiResponse.budgetBreakdown).map(([category, amount]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-gray-300 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="text-white font-semibold">{amount} {trip.currency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TripDetails;