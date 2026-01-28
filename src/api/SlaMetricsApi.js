import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                                SLA METRICS                                                   *
 ****************************************************************************************************************/

// LIST (pagination + filters)
export const SlaMetricsListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/SlaMetrics/list', { params });
        return response.data;
    } catch (error) {
        console.error('SLA list error', error);
        throw error;
    }
};

// GET BY ID
export const SlaMetricsByIdApi = async (id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/SlaMetrics/get-by-id', { params: { id } });
        return response.data;
    } catch (error) {
        console.error('SLA get by id error', error);
        throw error;
    }
};

// CREATE / UPDATE
export const SlaMetricsUpsertApi = async (payload) => {
    return await axios.post(env.VITE_TEMP_API_URL + '/SlaMetrics/create-update', payload, {
        headers: { 'Content-Type': 'application/json' }
    });
};

// DELETE
export const SlaMetricsDeleteApi = async (slaId) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/SlaMetrics/delete', null, { params: { slaId } });
        return response.data;
    } catch (error) {
        console.error('SLA delete error', error);
        throw error;
    }
};

// DASHBOARD SUMMARY (cards)
export const SlaDashboardSummaryApi = async (params) => {
    return await axios.get(env.VITE_TEMP_API_URL + '/SlaMetrics/dashboard-summary', { params });
};

// DROPDOWN
export const SlaMetricsDropdownApi = async (organizationId) => {
    return await axios.get(env.VITE_TEMP_API_URL + '/SlaMetrics/dropdown', { params: { organizationId } });
};
