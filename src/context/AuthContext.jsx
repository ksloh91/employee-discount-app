import { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { app, db } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        const profile = snap.exists() ? snap.data() : {};

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...profile, // should include role, merchantId, etc.
        });
      } catch (e) {
        console.error('Failed to load user profile', e);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [auth]);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth).then(() => setUser(null));
  };

  /**
   * Register a new employee only if they have a pending invitation.
   * Creates Firebase Auth user, Firestore user profile (role: employee), and marks invitation accepted.
   */
  const registerWithInvitation = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const invRef = collection(db, 'invitations');
    const q = query(
      invRef,
      where('email', '==', normalizedEmail),
      where('status', '==', 'pending'),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      const err = new Error('No invitation found for this email. Ask your employer to send you an invitation.');
      err.code = 'no-invitation';
      throw err;
    }
    const invDoc = snap.docs[0];
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const { uid } = credential.user;
    await setDoc(doc(db, 'users', uid), {
      role: 'employee',
      email: credential.user.email,
      displayName: credential.user.email || normalizedEmail,
    });
    await updateDoc(doc(db, 'invitations', invDoc.id), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: uid,
    });
    return credential;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerWithInvitation }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
