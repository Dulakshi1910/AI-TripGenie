import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Callback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Extract token from URL query params
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');
    
    if (error) {
      console.error('OAuth Error detected:', error);
      navigate('/login?error=auth_failed');
      return;
    }

    if (token) {
      // Save token and trigger login process
      login(token);
        
      // Redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 5000); // optional delay
    } else {
      navigate('/login');
    }
  }, [location, navigate, login]);

  return (
    <div className="oauth-callback min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
      <div className="relative z-10 text-center max-w-md mx-auto px-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Processing your login...</h2>
          <p className="text-gray-300">Please wait while we complete the authentication process.</p>
        </div>
      </div>
    </div>
  );
};

export default Callback;

