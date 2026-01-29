import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Equipment Category                                                     *
 ****************************************************************************************************************/

export const EquipmentCategoryListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentCategory/EquipmentCategoryList', { params });
        return response.data;
    } catch (error) {
        console.error('EquipmentCategoryListApi error', error);
        throw error;
    }
};

export const EquipmentCategoryByIdApi = async (category_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentCategory/EquipmentCategoryById', { params: { category_id } });
        return response.data;
    } catch (error) {
        console.error('EquipmentCategoryByIdApi error', error);
        throw error;
    }
};

export const EquipmentCategoryUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/EquipmentCategory/EquipmentCategoryCreateUpdate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('EquipmentCategoryUpsertApi error', error);
        throw error;
    }
};

export const EquipmentCategoryDeleteApi = async (category_id) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/EquipmentCategory/EquipmentCategoryDelete', null, {
            params: { category_id }
        });
        return response.data;
    } catch (error) {
        console.error('EquipmentCategoryDeleteApi error', error);
        throw error;
    }
};
