import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const DealsContext = createContext(null);

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'deals'));
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
    return addDoc(collection(db, 'deals'), deal).then((ref) => {
      const next = { id: ref.id, ...deal };
      setDeals((current) => [...current, next]);
      return next;
    });
  };

  const updateDeal = (updatedDeal) => {
    const ref = doc(db, 'deals', updatedDeal.id);
    const { id, ...rest } = updatedDeal;
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

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error('useDeals must be used within DealsProvider');
  return ctx;
}

