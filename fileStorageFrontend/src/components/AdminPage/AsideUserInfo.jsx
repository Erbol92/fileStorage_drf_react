import { useEffect, useState } from "react";

export const AsideUserInfo = ({activeUser}) => {
    const [changed, setChanged] = useState(false)
    const [isSuper, setIsSuper] = useState(null);

    useEffect(() => {
        if (activeUser) {
            setIsSuper(Boolean(activeUser.is_superuser));
            setChanged(false);
        }
    }, [activeUser]);

    useEffect(() => {
        if (activeUser) {
            setChanged(isSuper !== Boolean(activeUser.is_superuser));
        }
    }, [isSuper, activeUser]);

    const handleToggle = async () => {
        const newValue = !isSuper;
        setIsSuper(newValue);
  };

    const changePermission = () => {
        console.log(activeUser.id)
        console.log(changed)
    }
    return (
            <>
            { activeUser && 
            <div className="text-start ms-3 p-3">
                <p><span className="fw-bold">Активная УЗ:</span> {activeUser.is_active ? "✓" : "✖"}</p>
                <p><span className="fw-bold">Сотрудник:</span> {activeUser.is_staff ? "✓" : "✖"}</p>
                <p><span className="fw-bold">Эл. почта:</span> {activeUser.email ? activeUser.email : "✖"}</p>
                <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="admin" checked={isSuper} onChange={handleToggle}/>
                    <label className="form-check-label" htmlFor="admin">
                        Администратор
                    </label>
                </div>
            <button onClick={changePermission} className="btn btn-sm btn-outline-primary mt-2" disabled={!changed}>применить</button>
            </div>
            }
            </>
    )
}