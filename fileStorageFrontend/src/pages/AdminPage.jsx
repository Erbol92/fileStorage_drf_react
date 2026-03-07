import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { adminActions } from "../slices/adminSlice";
import { UserView } from "../components/AdminPage/userView";
import { AsideUserInfo } from "../components/AdminPage/AsideUserInfo";

export const AdminPage = () => {
    const dispatch = useDispatch();
    const {users, loading, error } = useSelector(state=>state.admin)
    const [activeUser, setActive] = useState(null)

    useEffect(()=>{
        dispatch(adminActions.usersRequest())
    },[dispatch])

    useEffect(() => {
        if (activeUser && users.length > 0) {
            const updatedUser = users.find(u => u.id === activeUser.id);
            setActive(updatedUser);
        }
    }, [users]);

    if (loading) return <p>Загрузка...</p>
    return (
        <div className="d-flex">
            <div className="d-flex flex-column p-3">
                {users.map(user=>(
                    <UserView key={user.id} user={user} active={activeUser?.id===user.id} onActivate={() => setActive(user)}/>
                ))}
            </div>
            <AsideUserInfo activeUser={activeUser}/>
        </div>
    )
}