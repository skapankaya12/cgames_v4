import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IdentityScreen.css';

interface User {
  firstName: string;
  lastName: string;
}

const IdentityScreen = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ firstName: '', lastName: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.firstName.trim() || !user.lastName.trim()) {
      setError('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }
    sessionStorage.setItem('user', JSON.stringify(user));
    navigate('/test');
  };

  return (
    <div className="container space-background">
      <div className="welcome-card">
        <div className="welcome-content">
          <h1 className="welcome-title">🛸 Hoş Geldiniz, Kaptan!</h1>
          
          <div className="welcome-text">
            <p>Galaksiler arası teslimat kaptanısın.</p>
            <p>Görevin, yüksek riskli bir enerji çekirdeğini Nova Terminali'ne zamanında, hasarsız ve doğru kişiye ulaştırmak.</p>
            <p>Yol boyunca vereceğin kararlar, liderlik tarzını ve reflekslerini ortaya çıkaracak. Hazır mısın?</p>
            <p>Teslimat başlıyor.</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                id="firstName"
                type="text"
                value={user.firstName}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                placeholder="İsim"
                required
              />
            </div>
            <div className="form-group">
              <input
                id="lastName"
                type="text"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                placeholder="Soyisim"
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button
              type="submit"
              className="start-button"
              disabled={!user.firstName.trim() || !user.lastName.trim()}
            >
              BAŞLA ▶
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IdentityScreen; 