import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { tripApi } from '../../services/tripApi';
import type { Trip, UserChecklist } from '../../services/tripApi'; 

// Define a type for a trip with checklist summary
interface TripWithChecklistSummary extends Trip {
  checklistSummary?: {
    totalItems: number;
    checkedItems: number;
  };
}

const ChecklistP: React.FC = () => {
  const [trips, setTrips] = useState<TripWithChecklistSummary[]>([]);
  const [allTrips, setAllTrips] = useState<TripWithChecklistSummary[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTripsAndChecklistSummaries();
  }, [currentPage]); // No status filter needed for checklist overview

  const fetchTripsAndChecklistSummaries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trips (using your existing getUserTrips API)
      const tripsResponse = await tripApi.getUserTrips(currentPage, 9) as {
        success: boolean;
        data: { trips: Trip[] };
        pages: number;
      };

      if (tripsResponse.success && tripsResponse.data?.trips) {
        const fetchedTrips = tripsResponse.data.trips;
        const tripsWithSummaries: TripWithChecklistSummary[] = [];

        // Fetch checklist summary for each trip
        for (const trip of fetchedTrips) {
          try {
            const checklistResponse = await tripApi.getUserChecklist(trip._id) as {
              success: boolean;
              data: UserChecklist;
            };

            if (checklistResponse.success && checklistResponse.data?.items) {
              const totalItems = checklistResponse.data.items.length;
              const checkedItems = checklistResponse.data.items.filter(item => item.checked).length;
              tripsWithSummaries.push({
                ...trip,
                checklistSummary: { totalItems, checkedItems }
              });
            } else {
              // If no checklist, or failed to fetch for a specific trip
              tripsWithSummaries.push({
                ...trip,
                checklistSummary: { totalItems: 0, checkedItems: 0 }
              });
            }
          } catch (checklistErr) {
            console.warn(`Could not fetch checklist for trip ${trip._id}:`, checklistErr);
            tripsWithSummaries.push({
              ...trip,
              checklistSummary: { totalItems: 0, checkedItems: 0 } // Default to empty if error
            });
          }
        }

        setAllTrips(tripsWithSummaries);
        setTrips(tripsWithSummaries); // Initialize filtered trips with all trips
        setTotalPages(tripsResponse.pages);
      } else {
        setError('Failed to fetch trips for checklist overview.');
      }
    } catch (err: any) {
      console.error('Error fetching trips or checklists:', err);
      setError(err.response?.data?.message || 'Failed to fetch checklist overview.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTrips = () => {
    setIsSearching(true);
    if (!searchTerm.trim()) {
      setTrips(allTrips); // Show all trips if search term is empty
    } else {
      const filteredTrips = allTrips.filter(trip =>
        trip.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTrips(filteredTrips);
    }
    setIsSearching(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setTrips(allTrips); // Reset to all trips
  };

  // Re-filter trips whenever allTrips or searchTerm changes
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredTrips = allTrips.filter(trip =>
        trip.tripName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setTrips(filteredTrips);
    } else {
      setTrips(allTrips);
    }
  }, [allTrips, searchTerm]); // Dependency array

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to group trips by status
  const groupTripsByStatus = (trips: TripWithChecklistSummary[]) => {
    const groups: { [key: string]: TripWithChecklistSummary[] } = {
      ongoing: [],
      planning: [],
      confirmed: [],
      completed: [],
      cancelled: [],
      draft: [],
      other: [],
    };
    trips.forEach(trip => {
      switch (trip.status) {
        case 'ongoing':
          groups.ongoing.push(trip);
          break;
        case 'planning':
        case 'confirmed':
          groups.planning.push(trip); // treat both as "to be started"
          break;
        case 'completed':
          groups.completed.push(trip);
          break;
        case 'cancelled':
          groups.cancelled.push(trip);
          break;
        case 'draft':
          groups.draft.push(trip);
          break;
        default:
          groups.other.push(trip);
      }
    });
    return groups;
  };

  // Add a filteredTrips variable based on statusFilter
  const filteredTrips = statusFilter === 'all'
    ? trips
    : trips.filter(trip => {
        if (statusFilter === 'planning') {
          return trip.status === 'planning' || trip.status === 'confirmed';
        }
        return trip.status === statusFilter;
      });

  // Group filtered trips by status for display
  const groupedTrips = groupTripsByStatus(filteredTrips);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading checklist overview...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Checklist Overview</h1>
          <Link
            to="/dashboard/plan" // Link to plan a new trip, which might then have a checklist
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Plan New Trip
          </Link>
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center space-x-4">
          <label htmlFor="statusFilter" className="text-white font-medium">
            Filter by Status:
          </label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All</option>
            <option value="ongoing">Continuing</option>
            <option value="planning">To Be Started</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Search Filter */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchTrips()}
                placeholder="Search trips for checklist..."
                className="bg-slate-700 text-white px-4 py-2 pr-10 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearchTrips}
              disabled={isSearching}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <span>{isSearching ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-xl">
            <div className="flex items-center justify-between">
              <span>Search results for: "{searchTerm}"</span>
              <button
                onClick={handleClearSearch}
                className="text-sm underline hover:no-underline"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
            {error}
            <button
              onClick={fetchTripsAndChecklistSummaries}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Checklist Cards Grid */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">No trips with checklists found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm ? `No trips found matching "${searchTerm}" for checklist.` :
                'Create a trip to start your travel checklist journey!'}
            </p>
          </div>
        ) : (
          <>
            {/* Ongoing Trips */}
            {groupedTrips.ongoing.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-2 mt-6">Continuing Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.ongoing.map((trip) => (
                    <div key={trip._id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
                      <div className="h-48 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center relative">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-white font-semibold text-lg mb-1">{trip.tripName}</h3>
                          <p className="text-gray-300 text-sm mb-2">{trip.destinationCountry}</p>
                          <div className="flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                        </div>

                        {/* Checklist Summary */}
                        {trip.checklistSummary ? (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm">Checklist Progress:</p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{
                                  width: `${trip.checklistSummary.totalItems > 0
                                    ? (trip.checklistSummary.checkedItems / trip.checklistSummary.totalItems) * 100
                                    : 0
                                  }%`
                                }}
                              ></div>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {trip.checklistSummary.checkedItems} of {trip.checklistSummary.totalItems} items completed
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 text-gray-500 text-sm">
                            No checklist data available.
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/trips/${trip._id}/checklist`}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-center text-sm"
                          >
                            View Checklist
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* To Be Started Trips (Planning & Confirmed) */}
            {groupedTrips.planning.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-2 mt-6">To Be Started Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.planning.map((trip) => (
                    <div key={trip._id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
                      <div className="h-48 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center relative">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-white font-semibold text-lg mb-1">{trip.tripName}</h3>
                          <p className="text-gray-300 text-sm mb-2">{trip.destinationCountry}</p>
                          <div className="flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                        </div>

                        {/* Checklist Summary */}
                        {trip.checklistSummary ? (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm">Checklist Progress:</p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{
                                  width: `${trip.checklistSummary.totalItems > 0
                                    ? (trip.checklistSummary.checkedItems / trip.checklistSummary.totalItems) * 100
                                    : 0
                                  }%`
                                }}
                              ></div>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {trip.checklistSummary.checkedItems} of {trip.checklistSummary.totalItems} items completed
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 text-gray-500 text-sm">
                            No checklist data available.
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/trips/${trip._id}/checklist`}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-center text-sm"
                          >
                            View Checklist
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Completed Trips */}
            {groupedTrips.completed.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-2 mt-6">Completed Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.completed.map((trip) => (
                    <div key={trip._id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
                      <div className="h-48 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center relative">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-white font-semibold text-lg mb-1">{trip.tripName}</h3>
                          <p className="text-gray-300 text-sm mb-2">{trip.destinationCountry}</p>
                          <div className="flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                        </div>

                        {/* Checklist Summary */}
                        {trip.checklistSummary ? (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm">Checklist Progress:</p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{
                                  width: `${trip.checklistSummary.totalItems > 0
                                    ? (trip.checklistSummary.checkedItems / trip.checklistSummary.totalItems) * 100
                                    : 0
                                  }%`
                                }}
                              ></div>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {trip.checklistSummary.checkedItems} of {trip.checklistSummary.totalItems} items completed
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 text-gray-500 text-sm">
                            No checklist data available.
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/trips/${trip._id}/checklist`}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-center text-sm"
                          >
                            View Checklist
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Cancelled Trips */}
            {groupedTrips.cancelled.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-2 mt-6">Cancelled Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.cancelled.map((trip) => (
                    <div key={trip._id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
                      <div className="h-48 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center relative">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-white font-semibold text-lg mb-1">{trip.tripName}</h3>
                          <p className="text-gray-300 text-sm mb-2">{trip.destinationCountry}</p>
                          <div className="flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                        </div>

                        {/* Checklist Summary */}
                        {trip.checklistSummary ? (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm">Checklist Progress:</p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{
                                  width: `${trip.checklistSummary.totalItems > 0
                                    ? (trip.checklistSummary.checkedItems / trip.checklistSummary.totalItems) * 100
                                    : 0
                                  }%`
                                }}
                              ></div>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {trip.checklistSummary.checkedItems} of {trip.checklistSummary.totalItems} items completed
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 text-gray-500 text-sm">
                            No checklist data available.
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/trips/${trip._id}/checklist`}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-center text-sm"
                          >
                            View Checklist
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Draft/Other Trips (optional) */}
            {groupedTrips.draft.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-white mb-2 mt-6">Draft Trips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groupedTrips.draft.map((trip) => (
                    <div key={trip._id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
                      <div className="h-48 bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center relative">
                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-white font-semibold text-lg mb-1">{trip.tripName}</h3>
                          <p className="text-gray-300 text-sm mb-2">{trip.destinationCountry}</p>
                          <div className="flex items-center text-gray-400 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </div>
                        </div>

                        {/* Checklist Summary */}
                        {trip.checklistSummary ? (
                          <div className="mb-4">
                            <p className="text-gray-400 text-sm">Checklist Progress:</p>
                            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1">
                              <div
                                className="bg-green-500 h-2.5 rounded-full"
                                style={{
                                  width: `${trip.checklistSummary.totalItems > 0
                                    ? (trip.checklistSummary.checkedItems / trip.checklistSummary.totalItems) * 100
                                    : 0
                                  }%`
                                }}
                              ></div>
                            </div>
                            <p className="text-gray-300 text-sm mt-1">
                              {trip.checklistSummary.checkedItems} of {trip.checklistSummary.totalItems} items completed
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4 text-gray-500 text-sm">
                            No checklist data available.
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/trips/${trip._id}/checklist`}
                            className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-center text-sm"
                          >
                            View Checklist
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 py-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg transition-all ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChecklistP;