import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ClassifierAttempt } from '../types';
import { db } from '../services/db';

interface ClassifierContextType {
    attempts: ClassifierAttempt[];
    addAttempt: (attemptData: Omit<ClassifierAttempt, 'id' | 'date'>) => Promise<void>;
    deleteAttempt: (id: string) => Promise<void>;
}

const ClassifierContext = createContext<ClassifierContextType | undefined>(undefined);

export const ClassifierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [attempts, setAttempts] = useState<ClassifierAttempt[]>([]);

    useEffect(() => {
        const loadAttempts = async () => {
            const storedAttempts = await db.classifierAttempts.toArray();
            setAttempts(storedAttempts.sort((a,b) => b.date - a.date));
        };
        loadAttempts();
    }, []);

    const addAttempt = useCallback(async (attemptData: Omit<ClassifierAttempt, 'id' | 'date'>) => {
        const newAttempt: ClassifierAttempt = {
            ...attemptData,
            id: crypto.randomUUID(),
            date: Date.now(),
        };
        await db.classifierAttempts.add(newAttempt);
        setAttempts(prev => [newAttempt, ...prev].sort((a,b) => b.date - a.date));
    }, []);

    const deleteAttempt = useCallback(async (id: string) => {
        await db.classifierAttempts.delete(id);
        setAttempts(prev => prev.filter(a => a.id !== id));
    }, []);

    const value = {
        attempts,
        addAttempt,
        deleteAttempt,
    };

    return <ClassifierContext.Provider value={value}>{children}</ClassifierContext.Provider>;
};

export const useClassifier = () => {
    const context = useContext(ClassifierContext);
    if (!context) {
        throw new Error('useClassifier must be used within a ClassifierProvider');
    }
    return context;
};
