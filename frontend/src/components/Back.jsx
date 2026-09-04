import { useNavigate } from 'react-router-dom';

function Back() {
    const navigate = useNavigate();

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    };
    
    return (
        <button className="back_button" to="/" title="Назад" onClick={handleBack}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#f5f8ff" />
                <path d="M19 9L13 16L19 23" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    );
}

export default Back;