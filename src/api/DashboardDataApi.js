import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Dashboard Data                                                         *
 ****************************************************************************************************************/

export const DashboardAggregateApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/DashboardData/aggregate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('DashboardAggregateApi error', error);
        throw error;
    }
};

export const DashboardDataListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/DashboardData/dashboardList', { params });
        return response.data;
    } catch (error) {
        console.error('DashboardDataListApi error', error);
        throw error;
    }
};

export const DashboardRebuildApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/DashboardData/rebuild', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('DashboardRebuildApi error', error);
        throw error;
    }
};

export const DashboardKpiSummaryApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/DashboardData/KPISummary', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('DashboardKpiSummaryApi error', error);
        throw error;
    }
};
