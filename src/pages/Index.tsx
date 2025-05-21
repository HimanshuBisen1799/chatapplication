
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectCurrentToken } from '../features/auth/authSlice';

const Index = () => {
  const navigate = useNavigate();
  const token = useAppSelector(selectCurrentToken);

  useEffect(() => {
    if (token) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  return null;
};

export default Index;
