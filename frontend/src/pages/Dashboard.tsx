import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Your Dashboard</h1>
            <p className="text-gray-300 text-lg">Welcome back! Ready to plan your next adventure?</p>
          </div>
          
          <div className="dashboard-content">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
              <p className="text-white text-lg mb-4">Welcome to your travel dashboard!</p>
              <p className="text-gray-300">Start planning your next trip with AI-powered recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

