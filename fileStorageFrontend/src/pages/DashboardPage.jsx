// pages/DashboardPage.js
import { useDispatch, useSelector } from 'react-redux';
import { authActions } from '../slices/authSlice';
import { useNavigate } from 'react-router';
import { ROUTES } from '../routes/routes';
import { useEffect } from 'react';
import { FileManager } from '../components/FileManager';

export const DashboardPage = () => {
  
  const {  isAuth, error, username, isStaff, loading } = useSelector(state => state.auth);
  const navigate = useNavigate()
  

  useEffect(() => {
    if (!isAuth && !loading) {
      // Показываем сообщение 1.5с, затем переходим
      const t = setTimeout(() => navigate(ROUTES.HOME, { replace: true }), 1500);
      return () => clearTimeout(t);
    }
    }, [isAuth,loading, navigate]);
  
  if (!isAuth && !loading) {
    return (
      <>
        <p>Нужна авторизация — перенаправление...</p>
      </>
    );
  }
  return (
    <div>
      <h1>Главная страница</h1>
      <p>Добро пожаловать в приложение!</p>
      <FileManager/>
    </div>
  );
};