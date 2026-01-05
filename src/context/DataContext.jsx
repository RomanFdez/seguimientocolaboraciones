import { createContext, useContext, useState, useEffect } from 'react';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const { currentUser, userRoles } = useAuth();
    const [collaborations, setCollaborations] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real-time listener for collaborations
    useEffect(() => {
        if (!currentUser) {
            setCollaborations([]);
            setLoading(false);
            return;
        }

        let q = collection(db, 'collaborations');

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const collabData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCollaborations(collabData);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser, userRoles]);

    // Real-time listener for users
    useEffect(() => {
        if (!currentUser) {
            setUsers([]);
            return;
        }

        const q = collection(db, 'users');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
        }, (error) => {
            console.error('Error listening to users:', error);
        });

        return unsubscribe;
    }, [currentUser]);

    // Collaboration CRUD operations
    const createCollaboration = async (collaborationData) => {
        try {
            const docRef = await addDoc(collection(db, 'collaborations'), {
                ...collaborationData,
                createdBy: currentUser.uid,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error creating collaboration:', error);
            return { success: false, error: error.message };
        }
    };

    const updateCollaboration = async (id, updates) => {
        try {
            await updateDoc(doc(db, 'collaborations', id), {
                ...updates,
                updatedAt: Timestamp.now(),
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating collaboration:', error);
            return { success: false, error: error.message };
        }
    };

    const deleteCollaboration = async (id) => {
        try {
            await deleteDoc(doc(db, 'collaborations', id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting collaboration:', error);
            return { success: false, error: error.message };
        }
    };

    const getCollaborationById = async (id) => {
        try {
            const docSnap = await getDoc(doc(db, 'collaborations', id));
            if (docSnap.exists()) {
                return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
            } else {
                return { success: false, error: 'Collaboration not found' };
            }
        } catch (error) {
            console.error('Error fetching collaboration:', error);
            return { success: false, error: error.message };
        }
    };

    // User CRUD operations (admin only)
    const createUser = async (uid, userData) => {
        try {
            await setDoc(doc(db, 'users', uid), {
                ...userData,
                createdAt: Timestamp.now(),
            });
            return { success: true };
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, error: error.message };
        }
    };

    const updateUser = async (uid, updates) => {
        try {
            await updateDoc(doc(db, 'users', uid), updates);
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        collaborations,
        users,
        loading,
        createCollaboration,
        updateCollaboration,
        deleteCollaboration,
        getCollaborationById,
        createUser,
        updateUser,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
