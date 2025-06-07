import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isGame2 = location.pathname.startsWith('/game2');
  const isGame1 = location.pathname === '/' || location.pathname.startsWith('/test') || location.pathname.startsWith('/results');

  const handleGameNavigation = (gameNumber: number) => {
    if (gameNumber === 1) {
      navigate('/');
    } else if (gameNumber === 2) {
      navigate('/game2');
    }
  };

  return (
    <header className="game-header">
      <div className="header-content">
        <div className="logo">
          <h1>Yeni ismimiz ve logomuz buraya gelcek. </h1>
        </div>
        <nav className="game-navigation">
          <button 
            className={`nav-button ${isGame1 ? 'active' : ''}`}
            onClick={() => handleGameNavigation(1)}
          >
            Game 1
          </button>
          <button 
            className={`nav-button ${isGame2 ? 'active' : ''}`}
            onClick={() => handleGameNavigation(2)}
          >
            Game 2
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header; 