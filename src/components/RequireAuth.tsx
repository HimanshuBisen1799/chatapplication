
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectCurrentToken } from '../features/auth/authSlice';

interface RequireAuthProps {
  children: JSX.Element;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const token = useAppSelector(selectCurrentToken);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [token, navigate, location]);

  if (!token) return null;

  return children;
};

export default RequireAuth;
