import ApiService from '@/utils/services/ApiService';

// src/api/orgDashboard.js
export const getOrgDashboardReportApi = async (data) => {
    return await ApiService.get('/org/Dashboard/dashboard-report', data, { authorization: true });
};

export const getJobTypeStatsApi = async (date) => await ApiService.get('/org/Dashboard/jobtype-stats', date, { authorization: true });

export const getWorkModeStatsApi = async (date) => await ApiService.get('/org/Dashboard/workmode-stats', date, { authorization: true });

export const getApplicationsTrendApi = async (params) =>
    await ApiService.get('/org/Dashboard/applications-trend', params, { authorization: true });

export const getDepartmentStatsApi = async (params) =>
    await ApiService.get('/org/Dashboard/department-stats', params, { authorization: true });

//superAdminDashboard
export const getSuperAdminDashboardReportApi = async (data) => {
    return await ApiService.get('/org/Dashboard/organization-summary', data, { authorization: true });
};
