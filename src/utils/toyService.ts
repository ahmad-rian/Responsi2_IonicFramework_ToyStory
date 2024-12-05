
import { auth, db } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export interface Toy {
  id?: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const firestoreService = {
  getToyRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return collection(db, 'users', uid, 'toys');
  },

  async getToys(): Promise<Toy[]> {
    const ref = this.getToyRef();
    const q = query(ref, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Toy),
    }));
  },

  async addToy(toy: Omit<Toy, 'id' | 'createdAt' | 'updatedAt'>) {
    const ref = this.getToyRef();
    await addDoc(ref, {
      ...toy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async updateToy(id: string, toy: Partial<Omit<Toy, 'id'>>) {
    const ref = doc(this.getToyRef(), id);
    await updateDoc(ref, {
      ...toy,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteToy(id: string) {
    const ref = doc(this.getToyRef(), id);
    await deleteDoc(ref);
  },

  async updateStatus(id: string, status: boolean) {
    const ref = doc(this.getToyRef(), id);
    await updateDoc(ref, {
      status,
      updatedAt: Timestamp.now(),
    });
  },
};