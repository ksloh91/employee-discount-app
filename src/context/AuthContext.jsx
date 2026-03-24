import { createContext, useContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
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

  // Employee sign-up is gated by pending invitations.
  const registerWithInvitation = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const invitationQuery = query(
      collection(db, 'invitations'),
      where('email', '==', normalizedEmail),
      where('status', '==', 'pending'),
      limit(1),
    );
    const invitationSnap = await getDocs(invitationQuery);
    if (invitationSnap.empty) {
      const err = new Error(
        'No invitation found for this email. Ask your employer to send you an invitation.',
      );
      err.code = 'no-invitation';
      throw err;
    }

    const invitationDoc = invitationSnap.docs[0];
    const credential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    await setDoc(doc(db, 'users', credential.user.uid), {
      role: 'employee',
      email: credential.user.email || normalizedEmail,
      displayName: credential.user.email || normalizedEmail,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, 'invitations', invitationDoc.id), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: credential.user.uid,
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, registerWithInvitation }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
