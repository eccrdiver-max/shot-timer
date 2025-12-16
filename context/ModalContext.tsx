import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ModalState {
    isOpen: boolean;
    title: string;
    body: ReactNode;
    onConfirm: () => void;
}

interface ModalContextType extends ModalState {
    showConfirmation: (title: string, body: ReactNode, onConfirm: () => void) => void;
    hideConfirmation: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

const INITIAL_STATE: ModalState = {
    isOpen: false,
    title: '',
    body: '',
    onConfirm: () => {},
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [modalState, setModalState] = useState<ModalState>(INITIAL_STATE);

    const showConfirmation = useCallback((title: string, body: ReactNode, onConfirm: () => void) => {
        setModalState({ isOpen: true, title, body, onConfirm });
    }, []);

    const hideConfirmation = useCallback(() => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const value: ModalContextType = {
        ...modalState,
        showConfirmation,
        hideConfirmation,
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};