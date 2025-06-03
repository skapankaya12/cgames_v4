import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useNavigate } from 'react-router-dom';

export default function HrLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // On success, Firebase stores the session automatically
      navigate('/hr');
    } catch (err: any) {
      setError(`Login failed: ${err.message}`);
    }
  };

  return (
    <div className="hr-login-container">
      <h1>HR Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Work Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div className="error">{error}</div>}

        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/hr/register">Register here</a>
      </p>
    </div>
  );
} 