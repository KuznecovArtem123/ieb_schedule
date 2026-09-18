import { useNavigate } from 'react-router-dom';
import {ArrowLeft} from '@gravity-ui/icons';

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
        <button className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full border-0 bg-white text-link shadow-float" title="Назад" onClick={handleBack}>
            <ArrowLeft></ArrowLeft>
        </button>
    );
}

export default Back;