import { useEffect, useState } from 'react';
import { FiSettings, FiCpu } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';

import GeneralSetting from './GeneralSetting';
import AIModelsSetting from './AIModelsSetting';
import { OrganizationSettingListApi } from '@/api/OrganizationApi';
import { isSuperAdmin } from '@/utils/Utils';

export default function SettingsIndex() {
    const [activeTab, setActiveTab] = useState('General');
    const [settingData, setSettingData] = useState(null);
    const [encKey, setEncKey] = useState(null);

    const isSA = isSuperAdmin();

    const tabs = [
        {
            name: 'General',
            description: 'Basic workspace preferences',
            icon: FiSettings,
            component: GeneralSetting
        },
        // {
        //     name: 'Notification',
        //     description: 'Email & in-app alerts',
        //     icon: FiBell,
        //     component: NotificationSetting
        // },
        // {
        //     name: 'Security',
        //     description: 'Password & access control',
        //     icon: FiShield,
        //     component: SecuritySetting
        // },
        {
            name: 'AI Models',
            description: 'Select and configure AI models',
            icon: FiCpu,
            component: AIModelsSetting
        }
    ];

    const activeTabObj = tabs.find((t) => t.name === activeTab) || tabs[0];
    const ActiveTabComponent = activeTabObj.component; // ⬅️ component reference

    const { data, isLoading } = useQuery({
        queryKey: ['Organization-Setting-List'],
        queryFn: OrganizationSettingListApi,
        select: (res) => {
            const dataObj = {};
            const secret = res.headers && (res.headers['x-encryption-secret'] || res.headers['X-Encryption-Secret']);
            const data = res.data.data;
            data.map((setting) => {
                dataObj[setting.key] = { id: setting.id, key: setting.key, value: setting.value };
            });
            return { secret, data: dataObj };
        }
    });

    useEffect(() => {
        if (data) {
            setSettingData(data.data);
            setEncKey(data.secret);
        }
    }, [data]);

    if (isSA) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-4xl mb-3">🚧</div>
                <h2 className="text-xl font-semibold text-gray-800">Coming Soon</h2>
                <p className="text-sm text-gray-500 mt-2 max-w-md">Organization settings are not available for Super Admin yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white fl-card flex flex-col md:flex-row border border-gray-200 rounded-2xl p-4 md:p-6 gap-4 md:gap-6 shadow-sm">
            {/* LEFT SIDE — VERTICAL TABS */}
            <div className="w-full md:w-64 md:border-r border-gray-200 md:pr-4 pb-3 md:pb-0">
                <h2 className="text-base md:text-lg font-semibold text-gray-900">Workspace settings</h2>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 mb-3 md:mb-4">
                    Manage your preferences, notifications, security, and AI models.
                </p>

                <div className="flex flex-col gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.name;

                        return (
                            <button
                                key={tab.name}
                                onClick={() => {
                                    if (!isLoading) {
                                        setActiveTab(tab.name);
                                    }
                                }}
                                className={[
                                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs md:text-sm transition-all border w-full text-left',
                                    isActive
                                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-transparent hover:border-indigo-300 hover:bg-indigo-50'
                                ].join(' ')}
                            >
                                <span
                                    className={[
                                        'inline-flex h-7 w-7 items-center justify-center rounded-full border text-[14px] flex-shrink-0',
                                        isActive
                                            ? 'border-white/40 bg-white/10 text-white'
                                            : 'border-indigo-100 bg-white text-indigo-500 group-hover:border-indigo-300'
                                    ].join(' ')}
                                >
                                    <Icon />
                                </span>

                                <div className="flex flex-col">
                                    <span className="font-medium leading-none">{tab.name}</span>
                                    <span
                                        className={`mt-0.5 text-[10px] ${
                                            isActive ? 'text-indigo-100' : 'text-gray-400 group-hover:text-indigo-400'
                                        }`}
                                    >
                                        {tab.description}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT SIDE — CONTENT AREA */}
            <div className="flex-1 md:pl-4 pt-2 md:pt-0 min-w-0">
                {isLoading && <p className="text-xs text-gray-500">Loading settings...</p>}

                {!isLoading && (
                    <ActiveTabComponent settingData={settingData} encKey={encKey} setSettingData={setSettingData} activeTab={activeTab} />
                )}
            </div>
        </div>
    );
}
