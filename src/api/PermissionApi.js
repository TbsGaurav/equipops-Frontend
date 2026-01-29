import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Permission                                                            *
 ****************************************************************************************************************/

export const PermissionListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Permission/permissionList', { params });
        return response.data;
    } catch (error) {
        console.error('PermissionListApi error', error);
        throw error;
    }
};

export const PermissionByIdApi = async (permission_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Permission/permissionById', { params: { permission_id } });
        return response.data;
    } catch (error) {
        console.error('PermissionByIdApi error', error);
        throw error;
    }
};

export const PermissionUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/Permission/permissionCreateUpdate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('PermissionUpsertApi error', error);
        throw error;
    }
};

export const PermissionDeleteApi = async (permission_id) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/Permission/permissionDelete', null, { params: { permission_id } });
        return response.data;
    } catch (error) {
        console.error('PermissionDeleteApi error', error);
        throw error;
    }
};
