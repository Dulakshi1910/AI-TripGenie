import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/login');
  };

  return (
    <div className="home-page">
      <h1>Welcome to TripGenie</h1>
      <p>Your AI-powered travel companion</p>

      <div className="home-actions">
        <Button variant="secondary" size="medium" onClick={handleStart}>
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Home;
