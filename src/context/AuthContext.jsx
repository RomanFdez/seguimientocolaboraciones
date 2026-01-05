import { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updatePassword
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRoles, setUserRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const roles = userData.roles || (userData.role ? [userData.role] : []);
                        setCurrentUser({ ...user, ...userData, roles });
                        setUserRoles(roles);
                    } else {
                        setCurrentUser(user);
                        setUserRoles([]);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setCurrentUser(user);
                    setUserRoles([]);
                }
            } else {
                setCurrentUser(null);
                setUserRoles([]);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: result.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const isAdmin = () => userRoles.includes('admin');
    const isAnalista = () => userRoles.includes('analista');
    const isSeguimiento = () => userRoles.includes('seguimiento');

    const changePassword = async (newPassword) => {
        try {
            if (!auth.currentUser) throw new Error('No hay usuario autenticado');
            await updatePassword(auth.currentUser, newPassword);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        currentUser,
        userRoles,
        login,
        logout,
        isAdmin,
        isAnalista,
        isSeguimiento,
        changePassword,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
