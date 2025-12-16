import React from 'react';
import { useClassifier } from '../../context/ClassifierContext';
import { useModal } from '../../context/ModalContext';
import { useI18n } from '../../hooks/useI18n';
import { ClassifierAttempt, IDPAClassification } from '../../types';
import { availableClassifiers } from '../../utils/classifier';

const getClassificationColor = (classification: IDPAClassification) => {
    switch(classification) {
        case IDPAClassification.MASTER: return 'text-red-500';
        case IDPAClassification.EXPERT: return 'text-orange-400';
        case IDPAClassification.SHARPSHOOTER: return 'text-yellow-400';
        case IDPAClassification.MARKSMAN: return 'text-green-400';
        case IDPAClassification.NOVICE: return 'text-blue-400';
        default: return 'text-gray-400';
    }
};

const ClassifierHistoryList: React.FC = () => {
    const { attempts, deleteAttempt } = useClassifier();
    const { showConfirmation } = useModal();
    const { t } = useI18n();

    const getClassifierName = (id: string) => {
        const classifier = availableClassifiers.find(c => c.id === id);
        return classifier ? t(classifier.nameKey) : id;
    };

    const handleDelete = (attempt: ClassifierAttempt) => {
        showConfirmation(
            t('delete_attempt_title'),
            t('delete_attempt_body', { shooterName: attempt.shooterName, date: new Date(attempt.date).toLocaleDateString() }),
            () => deleteAttempt(attempt.id)
        );
    };

    if (attempts.length === 0) {
        return (
            <div className="text-center bg-gray-800 rounded-lg p-8">
                <p className="text-gray-400">{t('no_classifier_attempts_found')}</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
            {attempts.map(attempt => (
                <div key={attempt.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg">{attempt.shooterName}</p>
                        <p className="text-sm text-gray-400">{new Date(attempt.date).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{t('classifier_label')}: {getClassifierName(attempt.classifierId)}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-xl font-bold ${getClassificationColor(attempt.classification)}`}>{attempt.classification}</p>
                        <p className="font-mono text-gray-300">{attempt.totalTime.toFixed(2)}s</p>
                    </div>
                     <button 
                        onClick={() => handleDelete(attempt)} 
                        className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                    >
                        {t('delete_button')}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ClassifierHistoryList;