import {
    LuLayoutDashboard,
    //LuBriefcase,
    LuBuilding2,
    LuUsers,
    LuUserCog,
    LuSettings,
    LuLanguages,
    //LuCrown,
    //LuMailPlus,
    LuPanelLeft,
    LuListChecks,
    LuLayers,
    LuTriangleAlert,
    LuPuzzle,
    LuHistory,
    LuKey
} from 'react-icons/lu';
import { FiLayers } from 'react-icons/fi';

export const CardBgColors = [
    'bg-teal-200/50',
    'bg-yellow-200/50',
    'bg-violet-200/50',
    'bg-pink-200/50',
    'bg-purple-200/50',
    'bg-rose-200/50'
];

export const InterviewersList = [
    { id: 1, first_name: 'Alice', last_name: 'Johnson', avatar: '/female_avatar.png' },
    { id: 2, first_name: 'Charlie', last_name: 'Brown', avatar: '/male_avatar3.png' },
    { id: 3, first_name: 'Diana', last_name: 'Prince', avatar: '/female_avatar2.png' },
    { id: 4, first_name: 'Bob', last_name: 'Smith', avatar: '/male_avatar.png' },
    { id: 5, first_name: 'Fiona', last_name: 'Gallagher', avatar: '/female_avatar3.png' }
];

export const QuestionLevels = [
    { key: 'low', label: 'Low', value: 1, classes: 'text-gray-700 bg-gray-100' },
    { key: 'medium', label: 'Medium', value: 2, classes: 'text-gray-800 bg-gray-200' },
    { key: 'high', label: 'High', value: 3, classes: 'text-black bg-gray-300' }
];

export const SideList = [
    { title: 'Dashboard', key: 'dashboard', value: 'dashboard', Icon: LuLayoutDashboard, module: 'DASHBOARD' },
    //{ title: 'Jobs', key: 'jobs', value: 'job', Icon: LuBriefcase, module: 'JOBS' },
    //{ title: 'Interviewers', key: 'interviewers', value: 'interviewers', Icon: LuUsers, module: 'INTERVIEWERS' },
    { title: 'Organization', key: 'organization', value: 'organization', Icon: LuBuilding2, module: 'ORGANIZATION' },
    { title: 'User Management', key: 'user_management', value: 'user-management', Icon: LuUserCog, module: 'USERMANAGEMENT' },
    { title: 'Candidate', key: 'candidate', value: 'candidate', Icon: LuUserCog, module: 'CANDIDATE' },
    { title: 'Language', key: 'language', value: 'language', Icon: LuLanguages, module: 'LANGUAGE' },
    { title: 'Setting', key: 'setting', value: 'setting', Icon: LuSettings, module: 'SETTING' },
    //{ title: 'Subscription', key: 'subscription', value: 'subscription', Icon: LuCrown, module: 'SUBSCRIPTION' },
    //{ title: 'EmailTemplate', key: 'email_template', value: 'email-template', Icon: LuMailPlus, module: 'EMAILTEMPLATE' },
    { title: 'MenuType', key: 'menu_type', value: 'menu-type', Icon: LuPanelLeft },
    { title: 'MenuPermission', key: 'menu_permission', value: 'menu-permission', Icon: LuListChecks },
    { title: 'Equipment', key: 'EQUIPMENT', value: 'equipment', Icon: LuListChecks, module: 'EQUIPMENT' },
    { title: 'Dashboard Category', key: 'DASHBOARD CATEGORY', value: 'dashboard-category', Icon: FiLayers, module: 'DASHBOARD_CATEGORY' },
    { title: 'SLA Metrics', key: 'SLA METRICS', value: 'sla-metrics', Icon: FiLayers, module: 'SLA_METRICS' },
    //{ title: 'Equipment', key: 'equipment', value: 'equipment', Icon: LuListChecks, module: 'EQUIPMENT' },
    { title: 'Equipment Category', key: 'Equipment Category', value: 'equipmentcategory', Icon: LuLayers, module: 'EQUIPMENTCATEGORY' },
    { title: 'Equipment Failure', key: 'Equipment Failure', value: 'equipmentfailure', Icon: LuTriangleAlert, module: 'EQUIPMENTFAILURE' },
    { title: 'Equipment Subpart', key: 'Equipment Subpart', value: 'equipmentsubpart', Icon: LuPuzzle, module: 'EQUIPMENTSUBPART' },
    { title: 'Vendor', key: 'Vendor', value: 'vendor', Icon: LuUsers, module: 'VENDOR' },
    { title: 'Audit Log', key: 'Audit Log', value: 'auditlog', Icon: LuHistory, module: 'AUDITLOG' },
    { title: 'Permission', key: 'Permission', value: 'permission', Icon: LuKey, module: 'PERMISSION' },
    { title: 'Role', key: 'Role', value: 'role', Icon: LuUserCog, module: 'ROLE' },
    { title: 'Role', key: 'Role', value: 'role', Icon: LuUserCog, module: 'ROLE' },
    { title: 'Dashboard Data', key: 'Dashboard Data', value: 'dashboarddata', Icon: LuLayoutDashboard, module: 'DASHBOARDDATA' },
    { title: 'Equipment', key: 'EQUIPMENT', value: 'equipment', Icon: LuListChecks, module: 'EQUIPMENT' },
    { title: 'Dashboard Category', key: 'DASHBOARD CATEGORY', value: 'dashboard-category', Icon: FiLayers, module: 'DASHBOARD_CATEGORY' }

    // { key: 'subscription', value: 'subscription', Icon: LuCrown }
    // { key: 'profile', value: 'profile', Icon: LuUser },
    // { key: 'logout', value: 'logout', Icon: LuLogOut }
];
