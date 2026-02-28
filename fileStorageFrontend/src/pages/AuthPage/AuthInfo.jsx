import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authActions } from '../../slices/authSlice';
import { useDispatch } from 'react-redux';
import { ROUTES } from '../../routes/routes';

export const AuthInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [error, setError] = useState(null)

    useEffect(() => {
    // Получаем параметры из URL
    const params = new URLSearchParams(location.search);
    const access = params.get('access');
    const username = params.get('username');
    const is_staff = params.get('is_staff');
    const errorMess = params.get('error');
    if (access) {
        const data = {
            access,
            username,
            is_staff,
        }
      dispatch(authActions.loginSuccess(data))
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD);
      }, 3000);
    }
    if (errorMess) {
        setError(errorMess)
        setTimeout(() => {
            navigate(ROUTES.HOME);
        }, 3000);
    }
  }, [dispatch, location]);
  if (error) 
    return (
        <div>
            <h1>Произошла ошибка</h1>
            <p>{error}</p>
        </div>
    )
    return (
    <div>
      <h1>Email подтвержден!</h1>
      <p>Ваш аккаунт успешно создан. Через 3 секунды вы будете перенаправлены...</p>
    </div>
  );
}