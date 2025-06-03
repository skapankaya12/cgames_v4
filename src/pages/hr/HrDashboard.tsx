import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  getDocs,
  query,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useNavigate } from 'react-router-dom';
import type { Candidate } from '../../types/hr';

export default function HrDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/hr/login');
        return;
      }
      try {
        // Load this HR user's Firestore doc to get companyId
        const hrDocRef = doc(db, 'hrUsers', user.uid);
        const hrDocSnap = await getDoc(hrDocRef);
        
        if (!hrDocSnap.exists()) {
          await signOut(auth);
          navigate('/hr/login');
          return;
        }
        
        const hrData = hrDocSnap.data();
        const userCompanyId = hrData.companyId as string;
        setCompanyId(userCompanyId);

        // Fetch all candidates under /companies/{companyId}/candidates
        const q = query(collection(db, `companies/${userCompanyId}/candidates`));
        const snapshot = await getDocs(q);
        const list: Candidate[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Candidate, 'id'>),
        }));
        setCandidates(list);
      } catch (err: any) {
        setError(`Failed to load candidates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const handleInvite = async () => {
    setInviteError(null);
    setInviteLoading(true);
    try {
      const user = auth.currentUser;
      if (!user || !companyId) throw new Error('Not authenticated or no company ID');

      // Create new candidate doc
      const newDocRef = doc(collection(db, `companies/${companyId}/candidates`));
      await setDoc(newDocRef, {
        email: newEmail,
        status: 'Invited',
        dateInvited: new Date().toISOString(),
      });

      setCandidates((prev) => [
        ...prev,
        {
          id: newDocRef.id,
          email: newEmail,
          status: 'Invited',
          dateInvited: new Date().toISOString(),
        },
      ]);
      setNewEmail('');
    } catch (err: any) {
      setInviteError(`Failed to invite: ${err.message}`);
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) return <div>Loading candidates…</div>;
  if (error)
    return (
      <div>
        <div>{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );

  return (
    <div className="hr-dashboard-container">
      <h1>HR Dashboard</h1>
      <button
        onClick={async () => {
          await signOut(auth);
          navigate('/hr/login');
        }}
      >
        Logout
      </button>

      <div className="invite-form">
        <label>Candidate Email</label>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <button onClick={handleInvite} disabled={inviteLoading}>
          {inviteLoading ? 'Inviting…' : 'Send Invite'}
        </button>
        {inviteError && <div className="error">{inviteError}</div>}
      </div>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th>Date Invited</th>
            <th>Date Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => (
            <tr key={c.id}>
              <td>{c.email}</td>
              <td>{c.status}</td>
              <td>{new Date(c.dateInvited).toLocaleDateString()}</td>
              <td>
                {c.dateCompleted
                  ? new Date(c.dateCompleted).toLocaleDateString()
                  : '—'}
              </td>
              <td>
                {c.status === 'Completed' ? (
                  <button onClick={() => {/* Load and show candidate results modal */}}>
                    View Results
                  </button>
                ) : (
                  <button disabled>View Results</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 