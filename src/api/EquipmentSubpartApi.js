import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Equipment Subpart                                                      *
 ****************************************************************************************************************/

export const EquipmentSubpartListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentSubpart/equipmentsubpartList', { params });
        return response.data;
    } catch (error) {
        console.error('EquipmentSubpartListApi error', error);
        throw error;
    }
};

export const EquipmentSubpartByIdApi = async (subpart_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentSubpart/equipmentsubpartById', { params: { subpart_id } });
        return response.data;
    } catch (error) {
        console.error('EquipmentSubpartByIdApi error', error);
        throw error;
    }
};

export const EquipmentSubpartUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/EquipmentSubpart/equipmentsubpartCreateUpdate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('EquipmentSubpartUpsertApi error', error);
        throw error;
    }
};

export const EquipmentSubpartDeleteApi = async (subpart_id) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/EquipmentSubpart/equipmentsubpartDelete', null, {
            params: { subpart_id }
        });
        return response.data;
    } catch (error) {
        console.error('EquipmentSubpartDeleteApi error', error);
        throw error;
    }
};
