
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
    <div className="oauth-callback">
      <h2>Processing your login...</h2>
      <p>Please wait while we complete the authentication process.</p>
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        {/* <p>Current URL: {window.location.href}</p> */}
        {/* <p>Debug: Check browser console for detailed logs</p> */}
      </div>
    </div>
  );
};

export default Callback;

