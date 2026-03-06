import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { adminActions } from "../slices/adminSlice";
import { UserView } from "../components/AdminPage/userView";
import { AsideUserInfo } from "../components/AdminPage/AsideUserInfo";

export const AdminPage = () => {
    const dispatch = useDispatch();
    const {users, loading, error } = useSelector(state=>state.admin)
    const [activeUser, setActive] = useState(null)

    console.log(users, loading, error )
    useEffect(()=>{
        dispatch(adminActions.usersRequest())
    },[dispatch])

    if (loading) return <p>Загрузка...</p>
    return (
        <div className="d-flex">
            <div className="d-flex flex-column p-3">
                {users.map(user=>(
                    <UserView user={user} active={activeUser?.id===user.id} onActivate={() => setActive(user)}/>
                ))}
            </div>
            <AsideUserInfo activeUser={activeUser}/>
        </div>
    )
}