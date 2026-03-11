import './Loader.css'

export const Loader = () => (
    <div className='loader'>
        <button class="btn btn-primary" type="button" disabled>
            <span class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
            <span role="status">загрузка...</span>
        </button>
    </div>
)