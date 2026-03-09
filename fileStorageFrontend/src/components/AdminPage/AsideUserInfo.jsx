import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { adminActions } from "../../slices/adminSlice";
import { Confirm } from "../Confirm/Confirm";

export const AsideUserInfo = ({activeUser}) => {
    const [changed, setChanged] = useState(false)
    const [isSuper, setIsSuper] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const dispatch = useDispatch()

    useEffect(() => {
        if (activeUser) {
            setIsSuper(Boolean(activeUser.is_superuser));
            setIsStaff(Boolean(activeUser.is_staff));
            setChanged(false);
        }
    }, [activeUser]);

    useEffect(() => {
        if (activeUser) {
            setChanged(isSuper !== Boolean(activeUser.is_superuser) || isStaff !== Boolean(activeUser.is_staff));
        }
    }, [isSuper, isStaff, activeUser]);

    const handleToggleSuper = async () => {
        const newValue = !isSuper;
        setIsSuper(newValue);
    };
    const handleToggleStaff = async () => {
        const newValue = !isStaff;
        setIsStaff(newValue);
    };

    const changePermission = () => {
        dispatch(adminActions.changePermissionRequest({
            userId: activeUser.id,
            isSuperUser: isSuper,
            isStaff: isStaff,
        }))
    }
    return (
        <>
        { activeUser && 
            <div className="text-start ms-3 p-3">
                <p><span className="fw-bold">Активная УЗ:</span> {activeUser.is_active ? "✓" : "✖"}</p>
                <p><span className="fw-bold">Эл. почта:</span> {activeUser.email ? activeUser.email : "✖"}</p>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="staff" checked={isStaff} onChange={handleToggleStaff}/>
                    <label className="form-check-label" htmlFor="staff">
                        Сотрудник
                    </label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="admin" checked={isSuper} onChange={handleToggleSuper}/>
                    <label className="form-check-label" htmlFor="admin">
                        Администратор
                    </label>
                </div>
                <div className="d-flex mt-2">
                    <button onClick={changePermission} className="btn btn-sm btn-outline-primary" disabled={!changed}>применить</button>
                    <button onClick={()=>setShowConfirm(true)} className="btn btn-sm btn-outline-danger">удалить</button> 
                </div>
            </div>
        }
        { showConfirm && <Confirm foo={()=>dispatch(adminActions.deleteUserRequest(activeUser.id))} text={`удалить пользователя ${activeUser.username}?`} showConfirm={setShowConfirm}/>}
        </>
    )
}