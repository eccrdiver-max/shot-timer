import React, { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import ClassifierForm from './classifier/ClassifierForm';
import ClassifierHistoryList from './classifier/ClassifierHistoryList';

const ClassifierView: React.FC = () => {
    const { t } = useI18n();
    const [isAdding, setIsAdding] = useState(false);

    return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-yellow-400">{t('nav_classifier')}</h1>
                {!isAdding && (
                     <button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">{t('add_new_attempt')}</button>
                )}
            </div>

            {isAdding ? (
                <ClassifierForm onCancel={() => setIsAdding(false)} />
            ) : (
                <ClassifierHistoryList />
            )}
        </div>
    );
};

export default ClassifierView;
