import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Equipment Failure                                                      *
 ****************************************************************************************************************/

export const EquipmentFailureListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentFailure/EquipmentFailureList', { params });
        return response.data;
    } catch (error) {
        console.error('EquipmentFailureListApi error', error);
        throw error;
    }
};

export const EquipmentFailureByIdApi = async (failure_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentFailure/EquipmentFailureById', { params: { failure_id } });
        return response.data;
    } catch (error) {
        console.error('EquipmentFailureByIdApi error', error);
        throw error;
    }
};

export const EquipmentFailureUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/EquipmentFailure/EquipmentFailureCreateUpdate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('EquipmentFailureUpsertApi error', error);
        throw error;
    }
};

export const EquipmentFailureDeleteApi = async (failure_id) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/EquipmentFailure/EquipmentFailureDelete', null, {
            params: { failure_id }
        });
        return response.data;
    } catch (error) {
        console.error('EquipmentFailureDeleteApi error', error);
        throw error;
    }
};
