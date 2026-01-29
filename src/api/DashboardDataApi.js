import ApiService from '@/utils/services/ApiService';

export const DashboardAggregateApi = async (payload) => {
    return ApiService.post('/DashboardData/aggregate', payload, { authorization: false });
};

export const DashboardDataListApi = async (params) => {
    return ApiService.get('/DashboardData/dashboardList', params, { authorization: false });
};

export const DashboardRebuildApi = async (payload) => {
    return ApiService.post('/DashboardData/rebuild', payload, { authorization: false });
};

export const DashboardKpiSummaryApi = async (payload) => {
    return ApiService.post('/DashboardData/KPISummary', payload, { authorization: false });
};
