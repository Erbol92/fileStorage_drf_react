import { useDispatch, useSelector } from "react-redux"
import { authActions } from "../../slices/authSlice";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { ROUTES } from "../../routes/routes";
import { Login } from "./Login";
import { Register } from "./Register";
import './AuthPage.css'
import { Loader } from "../../components/Loader/Loader";

export const AuthPage = () => {
    const dispatch = useDispatch();
    const {loading, isAuth, access} = useSelector(state=>state.auth)
    const {loading: regLoading} = useSelector(state=>state.reg)
    
    const [isActive, setIsActive] = useState('login');
    useEffect(()=>{
        if (access) {
            dispatch(authActions.checkAuthRequest(access))
        }
        },[dispatch])

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
        
        {loading || regLoading && <Loader/>}
        </>
    )
}