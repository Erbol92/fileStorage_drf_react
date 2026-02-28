import { useState } from "react";
import { useDispatch } from "react-redux";
import { authActions } from "../../slices/authSlice";

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const handleLogin = (e)=>{
        e.preventDefault();
        
        const data = {
            username,
            password
        }
        dispatch(authActions.loginRequest(data))
    }

    return (
        <form className="form-signin" onSubmit={handleLogin}> 
            <h1 className="h3 mb-3 fw-normal">Пожалуйста, войдите</h1> <div className="form-floating"> 
            <input value={username} onChange={(e)=>setUsername(e.target.value)} required type="text" className="form-control" id="floatingInput" placeholder="name@example.com"/> 
            <label htmlFor="floatingInput">логин</label> </div> 
            <div className="form-floating"> 
                <input value={password} onChange={(e)=>setPassword(e.target.value)} required type="password" className="form-control" id="floatingPassword" placeholder="Password"/> 
                <label htmlFor="floatingPassword">пароль</label> 
            </div> 
            <button className="border btn btn-outline-success w-100 py-2 justify-content-center" type="submit">Войти</button>
        </form> 
    )
}