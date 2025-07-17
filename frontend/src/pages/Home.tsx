import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="home-page min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 animate-fade-up">
            Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">TripGenie</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 animate-fade-up animation-delay-200">
            Your AI-powered travel companion for unforgettable journeys
          </p>
        </div>

        <div className="home-actions animate-fade-up animation-delay-300">
          <Button 
            variant="primary" 
            size="large" 
            onClick={handleStart}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;

