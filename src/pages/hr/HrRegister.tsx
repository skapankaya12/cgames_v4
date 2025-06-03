import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useNavigate } from 'react-router-dom';

export default function HrRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    try {
      // 1) Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid = user.uid;

      // 2) Derive companyId from email domain (you can adjust logic if needed)
      const companyId = email.split('@')[1];

      // 3) Save HR user record to Firestore at /hrUsers/{uid}
      await setDoc(doc(db, 'hrUsers', uid), {
        email,
        companyId,
        createdAt: new Date().toISOString()
      });

      // 4) Firebase auto-signs in; redirect to /hr dashboard
      navigate('/hr');
    } catch (err: any) {
      setError(`Registration failed: ${err.message}`);
    }
  };

  return (
    <div className="hr-register-container">
      <h1>HR Registration</h1>
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

        <label>Confirm Password</label>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {error && <div className="error">{error}</div>}

        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/hr/login">Login here</a>
      </p>
    </div>
  );
} 