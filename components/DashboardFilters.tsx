import React, { useState, useEffect } from 'react';
import { Drill, Weapon } from '../types';
import { useI18n } from '../hooks/useI18n';

interface DashboardFiltersProps {
    drills: Drill[];
    weapons: Weapon[];
    onFilterChange: (filters: { drill: string; weapon: string }) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ drills, weapons, onFilterChange }) => {
    const { t } = useI18n();
    const [selectedDrill, setSelectedDrill] = useState('all');
    const [selectedWeapon, setSelectedWeapon] = useState('all');

    useEffect(() => {
        onFilterChange({ drill: selectedDrill, weapon: selectedWeapon });
    }, [selectedDrill, selectedWeapon, onFilterChange]);

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">{t('dashboard_filters_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="drillFilter" className="block text-sm font-medium text-gray-300">{t('filter_by_drill')}</label>
                    <select
                        id="drillFilter"
                        value={selectedDrill}
                        onChange={e => setSelectedDrill(e.target.value)}
                        className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg"
                    >
                        <option value="all">{t('all_drills')}</option>
                        {drills.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="weaponFilter" className="block text-sm font-medium text-gray-300">{t('filter_by_weapon')}</label>
                    <select
                        id="weaponFilter"
                        value={selectedWeapon}
                        onChange={e => setSelectedWeapon(e.target.value)}
                        className="mt-1 block w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg"
                    >
                        <option value="all">{t('all_weapons')}</option>
                        {weapons.map(w => <option key={w.id} value={w.id}>{`${w.manufacturer} ${w.model}`}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default DashboardFilters;
