import './Confirm.css'

export const Confirm = ({text, foo, showConfirm}) => {

    const handleConfirm = () => {
        foo() 
        showConfirm(false)
    }

    const handleCancel = () => {
        showConfirm(false) // Просто закрываем модальное окно
    }
    return (

        <div className="confirm bg-light border rounded-5 p-3">
            <div className="confirm-inner">
                <h3>подтвердите</h3>
                <p>{text}</p>
                <div className="d-flex">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={handleConfirm}>подтвердить</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleCancel}>отмена</button>
                </div>
            </div>
        </div>
    )
}