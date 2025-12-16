import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { auth } from '../config/firebaseConfig';
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    User as FirebaseUser
} from 'firebase/auth';
import { UserProfile, UserRole } from '../types';
import { firebaseService } from '../services/firebase';
import { useNotification } from './NotificationContext';
import { useI18n } from '../hooks/useI18n';

interface AuthContextType {
    currentUser: UserProfile | null;
    loading: boolean;
    allUserProfiles: UserProfile[];
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    updateCurrentUserInfo: (firstName: string, lastName: string) => Promise<void>;
    fetchAllUsers: () => Promise<UserProfile[]>;
    updateUserRole: (uid: string, role: UserRole) => Promise<void>;
    toggleUserAccountStatus: (uid: string, currentStatus?: 'active' | 'disabled') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);
    const { addNotification } = useNotification();
    const { t } = useI18n();

    const fetchAllUsers = useCallback(async (): Promise<UserProfile[]> => {
        try {
            const users = await firebaseService.getAllUsers();
            setAllUserProfiles(users);
            return users;
        } catch (error) {
            console.error("Failed to fetch users:", error);
            // Don't show error notification for permission denied (e.g. if role update hasn't propagated yet)
            // just return empty list
            return [];
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
            if (user) {
                const userProfile = await firebaseService.getUserProfile(user.uid);
                if (userProfile && userProfile.status !== 'disabled') {
                    setCurrentUser(userProfile);
                } else {
                    if (userProfile?.status === 'disabled') {
                        addNotification(t('account_disabled_message'), 'error');
                    }
                    setCurrentUser(null);
                    signOut(auth);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [addNotification, t]);

    useEffect(() => {
        // Fetch users if MD or SO (SO needs it to link shooters to accounts)
        if (currentUser?.role === UserRole.MD || currentUser?.role === UserRole.SO) {
            fetchAllUsers();
        }
    }, [currentUser, fetchAllUsers]);

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseService.createUserProfile(userCredential.user.uid, email, firstName, lastName);
    };

    const logIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logOut = () => {
        return signOut(auth);
    };

    const updateCurrentUserInfo = async (firstName: string, lastName: string) => {
        if (!currentUser) return;
        await firebaseService.updateUserProfile(currentUser.uid, { firstName, lastName });
        setCurrentUser(prev => prev ? { ...prev, firstName, lastName } : null);
    };

    const updateUserRole = async (uid: string, role: UserRole) => {
        if (currentUser?.role !== UserRole.MD) return;
        await firebaseService.updateUserProfile(uid, { role });
        setAllUserProfiles(prev => prev.map(u => u.uid === uid ? { ...u, role } : u));
    };

    const toggleUserAccountStatus = async (uid: string, currentStatus: 'active' | 'disabled' = 'active') => {
        if (currentUser?.role !== UserRole.MD) return;
        const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
        await firebaseService.updateUserProfile(uid, { status: newStatus });
        setAllUserProfiles(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
    };

    const value = {
        currentUser,
        loading,
        allUserProfiles,
        signUp,
        logIn,
        logOut,
        updateCurrentUserInfo,
        fetchAllUsers,
        updateUserRole,
        toggleUserAccountStatus
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};