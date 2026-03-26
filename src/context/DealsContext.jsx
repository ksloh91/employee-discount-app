import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from "../lib/firebase";
import { DealsContext } from "./DealsContextInternal";

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'deals'), orderBy('createdAt', 'desc')));
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDeals(items);
      } catch (e) {
        console.error('Failed to load deals', e);
        setError('Failed to load deals');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const addDeal = (deal) => {
    const payload = { ...deal, createdAt: serverTimestamp() };
    return addDoc(collection(db, 'deals'), payload).then((ref) => {
      // Optimistic local value; Firestore will store server timestamp.
      const next = { id: ref.id, ...deal, createdAt: new Date().toISOString() };
      setDeals((current) => [...current, next]);
      return next;
    });
  };

  const updateDeal = (updatedDeal) => {
    const { id: updatedId, ...rest } = updatedDeal;
    const ref = doc(db, "deals", updatedId);
    return updateDoc(ref, rest).then(() => {
      setDeals((current) =>
        current.map((deal) => (deal.id === updatedDeal.id ? { ...deal, ...updatedDeal } : deal)),
      );
    });
  };

  const deleteDeal = (id) => {
    const ref = doc(db, 'deals', id);
    return deleteDoc(ref).then(() => {
      setDeals((current) => current.filter((deal) => deal.id !== id));
    });
  };

  return (
    <DealsContext.Provider value={{ deals, loading, error, addDeal, updateDeal, deleteDeal }}>
      {children}
    </DealsContext.Provider>
  );
}

// `useDeals` hook lives in `src/context/useDeals.js` to keep this file
// React-Refresh compliant.

