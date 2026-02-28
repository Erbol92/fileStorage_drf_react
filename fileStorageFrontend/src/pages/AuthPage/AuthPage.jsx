import { useDispatch, useSelector } from "react-redux"
import { authActions } from "../../slices/authSlice";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { ROUTES } from "../../routes/routes";
import { Login } from "./Login";
import { Register } from "./Register";
import './AuthPage.css'
import { InfoAlert } from "../../components/InfoAlert";

export const AuthPage = () => {
    const dispatch = useDispatch();
    const {loading, error, isAuth, access, errorAccess} = useSelector(state=>state.auth)
    const [showAlert, setShowAlert] = useState(false);
    const [isActive, setIsActive] = useState('login');
    useEffect(()=>{
        if (access) {
            dispatch(authActions.checkAuthRequest(access))
        }
        },[dispatch])


    useEffect(()=>{
        if (errorAccess) {
            setShowAlert(true);
            
            // Автоматически скрываем через 5 секунд
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    },[errorAccess])

    console.log(showAlert,errorAccess)
    if (isAuth) {
        return <Navigate to={ROUTES.DASHBOARD} replace />; 
    }
    
    const switchActive = (active) => {
        setIsActive(active);
    }
    
    return (
        <>
        <div className="btn-group">
            <button
            onClick={()=>switchActive('login')}
            className={`btn btn-outline-primary ${isActive==='login' ? "active" : ""}`}
            >
            вход
            </button>
            <button
            onClick={()=>switchActive('register')}
            className={`btn btn-outline-primary ${isActive==='register' ? "active" : ""}`}
            >
            регистрация
            </button>
        </div>
        { isActive==='login' ? <Login/> : <Register/> }
        {showAlert && errorAccess && (
            <InfoAlert 
                message="" 
                error={errorAccess}
            />
        )}
        </>
    )
}