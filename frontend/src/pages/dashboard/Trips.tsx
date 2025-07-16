import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { tripApi } from '../../services/tripApi';
import type { Trip } from '../../services/tripApi';

const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchTrips();
  }, [currentPage, statusFilter]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tripApi.getUserTrips(currentPage, 10, statusFilter) as {
        success: boolean;
        data: { trips: Trip[] };
        pages: number;
      };
      
      if (response.success) {
        setTrips(response.data.trips);
        setTotalPages(response.pages);
      } else {
        setError('Failed to fetch trips');
      }
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError(err.response?.data?.message || 'Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      await tripApi.deleteTrip(tripId);
      setTrips(trips.filter(trip => trip._id !== tripId));
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      alert('Failed to delete trip');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'active':
        return 'bg-blue-500/20 text-blue-400';
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading trips...</p>
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
          <h1 className="text-3xl font-bold text-white">My Trips</h1>
          <Link 
            to="/dashboard/plan"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Add New Trip
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 border border-slate-700">
          <div className="flex flex-wrap gap-4 items-center">
            <label className="text-white font-medium">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
            {error}
            <button 
              onClick={fetchTrips}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Trips Grid */}
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">No trips found</h3>
            <p className="text-gray-400 mb-4">
              {statusFilter ? `No trips with status "${statusFilter}"` : 'You haven\'t created any trips yet'}
            </p>
            <Link 
              to="/dashboard/plan"
              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
                <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status || 'draft')}`}>
                      {trip.status || 'draft'}
                    </span>
                  </div>
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

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                        {trip.budget} {trip.currency}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        {trip.numberOfPeople} {trip.numberOfPeople === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link 
                      to={`/dashboard/trips/${trip._id}`}
                      className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg hover:bg-slate-600 transition-all text-center text-sm"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleDeleteTrip(trip._id)}
                      className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-all text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

export default Trips;
