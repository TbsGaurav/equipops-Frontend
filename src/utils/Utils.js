import store from '@/store';
import clsx from 'clsx';
import { useSelector } from 'react-redux';
import { twMerge } from 'tailwind-merge';

export function cn(...input) {
    return twMerge(clsx(input));
}

export function getThemeMode() {
    const theme = localStorage.getItem('theme');
    return theme ?? 'light';
}

export function detectIsMobile() {
    if (typeof window === 'undefined') return false;

    const ua = navigator.userAgent;
    const uaTest = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const widthTest = window.innerWidth <= 768;

    return uaTest || widthTest;
}

/* =======================
    LANGUAGE HELPERS
   ======================= */

export const getLanguage = () => {
    const lang = localStorage.getItem('language');

    if (!lang || lang === 'undefined' || lang === 'null') {
        return null;
    }

    try {
        return JSON.parse(lang);
    } catch (error) {
        console.error('Invalid language in localStorage:', error);
        return null;
    }
};

export const setLanguage = (lang) => {
    localStorage.setItem('language', JSON.stringify(lang));

    document.documentElement.dir = lang.dir || 'ltr';
    document.documentElement.lang = lang.code;
};

export const getLanguageId = () => {
    return localStorage.getItem('languageId');
};

export const setLanguageId = (id) => {
    localStorage.setItem('languageId', id);
};

/**
 * Check VIEW permission by module
 * ex: canView(perms, "DASHBOARD")
 */
export const canView = (permissions = [], module) => {
    return permissions.includes(`${module}_VIEW`);
};

/**
 * CRUD helpers
 */
export const canCreate = (permissions, module) => permissions.includes(`${module}_CREATE`);

export const canUpdate = (permissions, module) => permissions.includes(`${module}_UPDATE`);

export const canDelete = (permissions, module) => permissions.includes(`${module}_DELETE`);

export const canOrgUserView = (permissions, module) => permissions.includes(`${module}_USER_VIEW`);

export const canListenVoice = (permissions, module) => permissions.includes(`${module}_VOICE`);

export const isSuperAdmin = () => {
    const state = store.getState();
    const user = state?.user?.user;
    return user?.roleName === 'Super Admin';
};
export const isOrgnizationAdmin = () => {
    const state = store.getState();
    const user = state?.user?.user;
    return user?.roleName === 'Organization Admin';
};
export const useUserRole = () => {
    return useSelector((state) => state?.user?.user?.roleName);
};
export const formatDateForApi = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
};
// constants
export const ORG_STATUS = {
    ALL: 0,
    ACTIVE: 1,
    INACTIVE: 2,
    DELETED: 3,
    NEW: 4
};
