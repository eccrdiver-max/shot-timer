import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../hooks/useI18n';
import { UserRole } from '../types';
import { useModal } from '../context/ModalContext';

const UserManagementPanel: React.FC = () => {
    const { allUserProfiles, fetchAllUsers, updateUserRole, currentUser, toggleUserAccountStatus } = useAuth();
    const { t } = useI18n();
    const { showConfirmation } = useModal();

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    const handleRoleChange = (uid: string, newRole: UserRole) => {
        updateUserRole(uid, newRole);
    };

    const handleToggleStatus = (uid: string, email: string | null, currentStatus?: 'active' | 'disabled') => {
        const isDisabling = currentStatus !== 'disabled';
        showConfirmation(
            isDisabling ? t('disable_user_title') : t('enable_user_title'),
            isDisabling ? t('disable_user_body', { email: email || 'user' }) : t('enable_user_body', { email: email || 'user' }),
            () => toggleUserAccountStatus(uid, currentStatus)
        );
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg mt-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">{t('user_management')}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-700 text-gray-300 uppercase">
                        <tr>
                            <th className="p-3">{t('user_label')}</th>
                            <th className="p-3">{t('role_label')}</th>
                            <th className="p-3">{t('actions_label')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {allUserProfiles.map(user => {
                            const isDisabled = user.status === 'disabled';
                            const hasName = user.firstName || user.lastName;
                            const displayName = hasName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user.email;

                            return (
                                <tr key={user.uid} className={isDisabled ? 'bg-red-900 bg-opacity-20' : ''}>
                                    <td className="p-3 font-medium">
                                        <div>
                                            <span>{displayName}</span>
                                            {isDisabled && <span className="ml-2 text-xs font-bold text-red-400 uppercase">({t('disabled')})</span>}
                                        </div>
                                        {hasName && (
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                                            disabled={user.uid === currentUser?.uid}
                                            className="bg-gray-600 border border-gray-500 text-white text-sm rounded-lg block w-full p-2 disabled:opacity-50"
                                        >
                                            {Object.values(UserRole).map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleToggleStatus(user.uid, user.email, user.status)}
                                            disabled={user.uid === currentUser?.uid}
                                            className={`font-bold py-1 px-3 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed ${
                                                isDisabled 
                                                ? 'bg-green-600 hover:bg-green-700 text-white' 
                                                : 'bg-red-600 hover:bg-red-700 text-white'
                                            }`}
                                        >
                                            {isDisabled ? t('enable_button') : t('disable_button')}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPanel;