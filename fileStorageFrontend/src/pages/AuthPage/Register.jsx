import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerActions } from "../../slices/registerSlice";
import { InfoAlert } from "../../components/InfoAlert";

export const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword_2] = useState('');
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const {loading, error, message } = useSelector(state=>state.reg)
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        if (message || error) {
            setShowAlert(true);
            // Автоматически скрываем через 5 секунд
            const timer = setTimeout(() => {
                setShowAlert(false);
            }, 5000);
            
            return () => {
                dispatch(registerActions.clearErrMess())
                clearTimeout(timer);
            }
        }
    }, [message, error]);

    const handleRegister = (e) => {
        e.preventDefault();
        
        if (password !== password2) {
            alert("Пароли не совпадают");
            return;
        }

        const data = {
            username,
            email,
            password,
            password2
        };
        dispatch(registerActions.registerRequest(data));
    };


    return (
        <>
        <form className="form-signin" onSubmit={handleRegister}> 
            <h1 className="h3 mb-3 fw-normal">Пожалуйста, зарегистрируйтесь</h1> 
            <div className="form-floating"> 
                <input value={username} onChange={(e)=>setUsername(e.target.value)} required type="text" className="form-control" id="floatingInput" placeholder="name"/> 
                <label htmlFor="floatingInput">логин</label> 
            </div>
            
            <div className="form-floating"> 
                <input value={email} onChange={(e)=>setEmail(e.target.value)} required type="email" className="form-control" id="emailInput" placeholder="name@example.com"/> 
                <label htmlFor="emailInput">эл. почта</label> 
            </div> 

            <div className="form-floating"> 
                <input value={password} onChange={(e)=>setPassword(e.target.value)} required type="password" className="form-control" id="floatingPassword" placeholder="Password"/> 
                <label htmlFor="floatingPassword">пароль</label> 
            </div>
            <div className="form-floating"> 
                <input value={password2} onChange={(e)=>setPassword_2(e.target.value)} required type="password" className="form-control" id="floatingPassword_2" placeholder="Password"/> 
                <label htmlFor="floatingPassword_2">подтвердите пароль</label> 
            </div> 
            <button className="border btn btn-outline-success w-100 py-2 justify-content-center" type="submit">Зарегистрироваться</button>
        </form> 
        {showAlert && (message || error) && (
            <InfoAlert 
                message={message} 
                error={error}
            />
        )}
        </>
        
    )
}