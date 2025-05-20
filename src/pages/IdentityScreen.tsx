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
    <div className="container">
      <div className="identity-screen">
        <h1>Hoş Geldiniz</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">Adınız</label>
            <input
              id="firstName"
              type="text"
              value={user.firstName}
              onChange={(e) => setUser({ ...user, firstName: e.target.value })}
              placeholder="Adınızı giriniz"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Soyadınız</label>
            <input
              id="lastName"
              type="text"
              value={user.lastName}
              onChange={(e) => setUser({ ...user, lastName: e.target.value })}
              placeholder="Soyadınızı giriniz"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button
            type="submit"
            className="submit-button"
            disabled={!user.firstName.trim() || !user.lastName.trim()}
          >
            Başla
          </button>
        </form>
      </div>
    </div>
  );
};

export default IdentityScreen; 