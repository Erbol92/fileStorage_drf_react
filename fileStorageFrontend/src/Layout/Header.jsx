import { ROUTES } from "../routes/routes"
import { NavLink, useNavigate } from "react-router"
import { authActions } from "../slices/authSlice"
import './Header.css'
import { useDispatch, useSelector } from "react-redux"

export const Header = () => {
    const dispatch = useDispatch();
    const {access, username, isAuth, isStaff} = useSelector(state=>state.auth)
    const navigate = useNavigate();
    const handleLogout = () => {
        dispatch(authActions.logoutRequest(access));
        navigate(ROUTES.HOME)
    };
    return (
        isAuth && 
        <header className="bg-light rounded-4 p-3">
            <ul className="p-0 m-0">
                <li><NavLink 
                className={({ isActive }) => isActive ? "active":""} 
                to={ROUTES.HOME}>Главная</NavLink>
                </li>
                <li><NavLink 
                className={({ isActive }) => isActive ? "active":""} 
                to={ROUTES.DASHBOARD}>Дашборд</NavLink>
                </li>
                {isStaff &&
                <li><NavLink 
                className={({ isActive }) => isActive ? "active":""} 
                to={ROUTES.USER_ADMIN}>Панель администратора</NavLink>
                </li>
                }
            </ul>
            {username && (
            <div>
                <div 
                className="avatar p-3 rounded-start-pill fw-bold bg-primary" 
                >
                    {username} <br /> {isStaff ? "администратор":"пользователь"} 
                </div>
                <div onClick={handleLogout} className="avatar btn btn-danger p-3 rounded-end-pill fw-bold">
                    Выйти
                </div>
            </div>
            )
            }
        </header>
    )
}