import useLanguage from '@/hooks/useLanguage';
import { useTranslate } from '@/hooks/useTranslate';
import { SideList } from '@/utils/CommonList';
import { canView, cn } from '@/utils/Utils';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router';

const Sidebar = ({ open }) => {
    const location = useLocation();
    const { language } = useLanguage();
    const languageDirection = language?.dir || 'ltr';
    // Check if segment is part of the current path
    const isRouteActive = (value) => location.pathname.split('/').includes(value);

    // const topItems = SideList;
    // const bottomItems = SideList.slice(4);
    let permissions = useSelector((state) => state.user.permissions);
    permissions = Array.from(new Set([...permissions, 'EQUIPMENT_VIEW', 'DASHBOARD_CATEGORY_VIEW', 'SLA_METRICS_VIEW']));
    // temp fix for sidebar view
    permissions = [
        ...permissions,
        'EQUIPMENT_VIEW',
        'VENDOR_VIEW',
        'EQUIPMENTCATEGORY_VIEW',
        'EQUIPMENTFAILURE_VIEW',
        'EQUIPMENTSUBPART_VIEW',
        'AUDITLOG_VIEW',
        'PERMISSION_VIEW',
        'ROLE_VIEW',
        'DASHBOARDDATA_VIEW',
        'DASHBOARD_CATEGORY_VIEW'
    ];
    permissions = Array.from(
        new Set([
            ...permissions,
            'EQUIPMENT_VIEW',
            'VENDOR_VIEW',
            'EQUIPMENTCATEGORY_VIEW',
            'EQUIPMENTFAILURE_VIEW',
            'AUDITLOG_VIEW',
            'PERMISSION_VIEW',
            'ROLE_VIEW',
            'DASHBOARDDATA_VIEW',
            'DASHBOARD_CATEGORY_VIEW'
        ])
    );
    // temp fix for sidebar view

    const allowedMenus = SideList.filter((item) => canView(permissions, item.module));

    const { t } = useTranslate();

    return (
        <aside
            className={cn(
                'absolute md:relative h-full flex flex-col bg-gray-100 dark:bg-slate-900 dark:text-white w-60',
                'transition-transform duration-500 overflow-hidden z-20',
                open ? 'translate-x-0' : languageDirection === 'rtl' ? 'translate-x-full' : '-translate-x-full'
            )}
        >
            {/* Logo (unchanged) */}
            <p className="text-center py-3 text-2xl max-h-17 min-h-17 font-bold justify-items-center content-center">
                <img src="/company-logo.png" className="w-[70%]" />
            </p>

            {/* Menu Area */}
            <div className="flex-1 flex flex-col px-2 pb-3 text-nowrap text-sm font-semibold text-gray-800 dark:text-slate-100">
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto overflow-x-hidden">
                    <ul className="px-1 flex flex-col gap-0.5">
                        {allowedMenus.map((item, idx) => {
                            const active = isRouteActive(item.value);

                            return (
                                <NavLink
                                    key={idx}
                                    to={item.value}
                                    className={cn(
                                        'group relative flex items-center gap-3 rounded-lg px-2 py-1.5',
                                        'transition-all duration-200',
                                        active
                                            ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                                            : 'text-gray-700 hover:bg-white/80 hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800/70',
                                        'hover:translate-x-[2px]'
                                    )}
                                >
                                    {/* Active left accent bar + soft glow */}
                                    <span
                                        className={cn(
                                            'absolute left-0 top-1/2 -translate-y-1/2 h-7 w-[3px] rounded-r-full',
                                            'bg-gradient-to-b from-indigo-500 to-indigo-400 shadow-[0_0_8px_rgba(79,70,229,0.7)]',
                                            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                                        )}
                                    />

                                    {/* Icon chip */}
                                    <span
                                        className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-md',
                                            'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-100',
                                            'group-hover:bg-indigo-50 group-hover:text-indigo-700 dark:group-hover:bg-slate-600',
                                            active && 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm'
                                        )}
                                    >
                                        <item.Icon size={18} />
                                    </span>

                                    {/* Label */}
                                    <span className={cn('truncate', active && 'font-bold')}>{t(item.key)}</span>

                                    {/* Active dot on right */}
                                    {active && (
                                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(79,70,229,0.7)]" />
                                    )}
                                </NavLink>
                            );
                        })}
                    </ul>
                </div>

                {/* BOTTOM SECTION (More) pinned using flex */}
                {/* <div className="pt-3 mt-1 border-t border-gray-200 dark:border-slate-700">
                    <ul className="px-1 flex flex-col gap-0.5">
                        {bottomItems.map((item, idx) => {
                            const active = isRouteActive(item.value);
                            return (
                                <NavLink
                                    key={idx}
                                    to={item.value}
                                    className={cn(
                                        'group relative flex items-center gap-3 rounded-lg px-2 py-1.5',
                                        'transition-all duration-200',
                                        active
                                            ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                                            : 'text-gray-700 hover:bg-white/80 hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800/70',
                                        'hover:translate-x-[2px]'
                                    )}
                                >
                                 
                                    <span
                                        className={cn(
                                            'absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gray-400 dark:bg-slate-500',
                                            active ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                                        )}
                                    />

                                   
                                    <span
                                        className={cn(
                                            'flex h-8 w-8 items-center justify-center rounded-md',
                                            'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-100',
                                            'group-hover:bg-gray-200 dark:group-hover:bg-slate-600',
                                            active && 'bg-slate-900/90 text-indigo-300'
                                        )}
                                    >
                                        <item.Icon size={18} />
                                    </span>

                                    <span className={cn('truncate text-sm', active && 'font-bold')}>{item.title}</span>
                                </NavLink>
                            );
                        })}
                    </ul>
                </div> */}
            </div>
        </aside>
    );
};

Sidebar.propTypes = {
    open: PropTypes.bool.isRequired
};

export default Sidebar;
