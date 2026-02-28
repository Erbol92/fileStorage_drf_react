import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';


export const ProtectedRoute = ({ children }) => {
  const { isAuth } = useSelector(state => state.auth);

  console.log(isAuth)
  if (!isAuth) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  
  return children;
};