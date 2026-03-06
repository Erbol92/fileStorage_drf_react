import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';


export const ProtectedRoute = ({ children }) => {
  const { isStaff } = useSelector(state => state.auth);

  if (!isStaff) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return children;
};