import { useNavigate } from 'react-router-dom';
import './FooterContent.css';
import { RiArrowGoBackFill } from 'react-icons/ri';

export default function LegalityGoBack() {
    const navigate = useNavigate();

    return (
        <button 
            onClick={() => navigate('/')}
            className="legality-back-button"
        >
            <RiArrowGoBackFill size={23}/>
            <span style={{fontSize: "17px"}}>Go Back Home</span>
        </button>
    );
}
