import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Role                                                                  *
 ****************************************************************************************************************/

export const RoleListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Role/roleList', { params });
        return response.data;
    } catch (error) {
        console.error('RoleListApi error', error);
        throw error;
    }
};

export const RoleByIdApi = async (role_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Role/roleById', { params: { role_id } });
        return response.data;
    } catch (error) {
        console.error('RoleByIdApi error', error);
        throw error;
    }
};

export const RoleUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/Role/roleCreateUpdate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('RoleUpsertApi error', error);
        throw error;
    }
};

export const RoleDeleteApi = async (role_id) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/Role/roleDelete', null, { params: { role_id } });
        return response.data;
    } catch (error) {
        console.error('RoleDeleteApi error', error);
        throw error;
    }
};
