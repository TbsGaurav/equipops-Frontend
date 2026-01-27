import axios from 'axios';
const env = import.meta.env;

/****************************************************************************************************************
 *                                         Dashboard Category                                                    *
 ****************************************************************************************************************/

export const DashboardCategoryListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/DashboardCategory/list', { params });
        return response.data;
    } catch (error) {
        console.error('DashboardCategoryListApi error', error);
        throw error;
    }
};

export const DashboardCategoryByIdApi = async (id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/DashboardCategory/get-by-id', { params: { id } });
        return response.data;
    } catch (error) {
        console.error('DashboardCategoryByIdApi error', error);
        throw error;
    }
};

export const DashboardCategoryUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/DashboardCategory/create-update', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('DashboardCategoryUpsertApi error', error);
        throw error;
    }
};

export const DashboardCategoryDeleteApi = async (dashboardCategoryId) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/DashboardCategory/delete', null, {
            params: { dashboardCategoryId }
        });
        return response.data;
    } catch (error) {
        console.error('DashboardCategoryDeleteApi error', error);
        throw error;
    }
};
