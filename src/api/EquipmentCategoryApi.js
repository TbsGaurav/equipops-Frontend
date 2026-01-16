import ApiService from '@/utils/services/ApiService';

export const EquipmentCategoryListApi = async (data) => {
    return await ApiService.get('/EquipmentCategory/EquipmentCategoryList', data, { authorization: false });
};

export const EquipmentCategoryDeleteApi = async (data) => {
    return await ApiService.post('/EquipmentCategory/EquipmentCategoryDelete', data, { authorization: false });
};

export const EquipmentCategoryByIdApi = async (category_id) => {
    return ApiService.get('/EquipmentCategory/EquipmentCategoryById', { category_id }, { authorization: false });
};

export const EquipmentCategoryUpsertApi = async (data) => {
    return await ApiService.post('/EquipmentCategory/EquipmentCategoryCreateUpdate', data, { authorization: false });
};
