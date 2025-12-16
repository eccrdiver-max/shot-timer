import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { Settings, UserRole } from '../types';
import UserManagementPanel from './UserManagementPanel';

const SettingsView: React.FC = () => {
    const { settings, updateSettings } = useAppContext();
    const { currentUser, updateCurrentUserInfo } = useAuth();
    const { t } = useI18n();
    const [localSettings, setLocalSettings] = useState<Settings>(settings);
    const [firstName, setFirstName] = useState(currentUser?.firstName || '');
    const [lastName, setLastName] = useState(currentUser?.lastName || '');
    const [isProfileSaving, setIsProfileSaving] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);
    
    useEffect(() => {
        if(currentUser) {
            setFirstName(currentUser.firstName || '');
            setLastName(currentUser.lastName || '');
        }
    }, [currentUser]);

    const handleSettingsChange = (field: keyof Settings, value: any) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSaveSettings = () => {
        updateSettings(localSettings);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileSaving(true);
        await updateCurrentUserInfo(firstName, lastName);
        setIsProfileSaving(false);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-yellow-400">{t('nav_settings')}</h1>

            {/* Profile Settings */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-yellow-400 mb-4">{t('profile_settings')}</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">{t('login_email')}</label>
                            <input id="email" type="email" value={currentUser?.email || ''} readOnly className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-gray-400 text-sm rounded-lg cursor-not-allowed" />
                        </div>
                         <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300">{t('role_label')}</label>
                            <input id="role" type="text" value={currentUser?.role || ''} readOnly className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-gray-400 text-sm rounded-lg cursor-not-allowed" />
                        </div>
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">{t('first_name')}</label>
                            <input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">{t('last_name')}</label>
                            <input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg" />
                        </div>
                    </div>
                     <div className="flex justify-end">
                        <button type="submit" disabled={isProfileSaving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-800">
                            {isProfileSaving ? t('saving_button') : t('save_changes')}
                        </button>
                    </div>
                </form>
            </div>

            {/* App Settings */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-yellow-400 mb-4">{t('app_settings')}</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="micSensitivity" className="block text-sm font-medium text-gray-300">{t('mic_sensitivity')}: {localSettings.micSensitivity}%</label>
                        <input id="micSensitivity" type="range" min="1" max="100" value={localSettings.micSensitivity} onChange={e => handleSettingsChange('micSensitivity', parseInt(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-2" />
                        <p className="text-xs text-gray-500 mt-1">{t('mic_sensitivity_desc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label htmlFor="randomStartMin" className="block text-sm font-medium text-gray-300">{t('random_start_min')}</label>
                            <input id="randomStartMin" type="number" step="0.1" value={localSettings.randomStartMin} onChange={e => handleSettingsChange('randomStartMin', parseFloat(e.target.value))} className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg" />
                        </div>
                        <div>
                            <label htmlFor="randomStartMax" className="block text-sm font-medium text-gray-300">{t('random_start_max')}</label>
                            <input id="randomStartMax" type="number" step="0.1" value={localSettings.randomStartMax} onChange={e => handleSettingsChange('randomStartMax', parseFloat(e.target.value))} className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg" />
                        </div>
                         <div>
                            <label htmlFor="autoStopDelay" className="block text-sm font-medium text-gray-300">{t('auto_stop_delay')}</label>
                            <input id="autoStopDelay" type="number" step="0.1" value={localSettings.autoStopDelay} onChange={e => handleSettingsChange('autoStopDelay', parseFloat(e.target.value))} className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg" />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-300">{t('language')}</label>
                        <select id="language" value={localSettings.language} onChange={e => handleSettingsChange('language', e.target.value)} className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg">
                            <option value="it">Italiano</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <button onClick={handleSaveSettings} className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg">
                            {t('save_app_settings')}
                        </button>
                    </div>
                </div>
            </div>
            
            {currentUser?.role === UserRole.MD && <UserManagementPanel />}
        </div>
    );
};

export default SettingsView;
