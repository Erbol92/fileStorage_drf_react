

export const UserView = ({user, active, onActivate}) => {
    const clickHandler = () => {
        onActivate()
    }

    return (
        <div>
            <button 
            className={`btn btn-outline-primary ${active ? "active" : ""}`}
            onClick={clickHandler}
            >
            {user.username}
            </button>    
        </div>
    )
}