import React from 'react';
import { useModal } from '../context/ModalContext';
import { useI18n } from '../hooks/useI18n';

const ConfirmModal: React.FC = () => {
    const { isOpen, title, body, onConfirm, hideConfirmation } = useModal();
    const { t } = useI18n();

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm();
        hideConfirmation();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm shadow-xl">
                <h2 className="text-2xl font-bold text-yellow-400 mb-4">{title}</h2>
                <div className="text-gray-300 mb-6">
                    {body}
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={hideConfirmation} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        {t('cancel_button')}
                    </button>
                    <button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        {t('confirm_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;