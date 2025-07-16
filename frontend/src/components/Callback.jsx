import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      console.error('OAuth Error:', error);
      navigate('/login?error=auth_failed');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="oauth-callback">
      <h2>Processing your login...</h2>
      <p>Please wait while we complete the authentication process.</p>
    </div>
  );
}

export default Callback;

