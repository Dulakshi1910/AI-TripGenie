import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Trips: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">My Trips</h1>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all">
            Add New Trip
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: 1, destination: 'Tokyo, Japan', date: '2024-01-15', image: '/api/placeholder/300/200', status: 'Completed' },
            { id: 2, destination: 'Paris, France', date: '2024-02-10', image: '/api/placeholder/300/200', status: 'Upcoming' },
            { id: 3, destination: 'New York, USA', date: '2024-03-05', image: '/api/placeholder/300/200', status: 'Planning' }
          ].map((trip) => (
            <div key={trip.id} className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all">
              <div className="h-48 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold">{trip.destination}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    trip.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                    trip.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{trip.date}</p>
                <button className="w-full bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trips;
