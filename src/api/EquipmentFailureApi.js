import ApiService from '@/utils/services/ApiService';

export const EquipmentFailureListApi = async (data) => {
    return await ApiService.get('/EquipmentFailure/EquipmentFailureList', data, { authorization: false });
};

export const EquipmentFailureDeleteApi = async (data) => {
    return await ApiService.post('/EquipmentFailure/EquipmentFailureDelete', data, { authorization: false });
};

export const EquipmentFailureByIdApi = async (failure_id) => {
    return ApiService.get('/EquipmentFailure/EquipmentFailureById', { failure_id }, { authorization: false });
};

export const EquipmentFailureUpsertApi = async (data) => {
    return await ApiService.post('/EquipmentFailure/EquipmentFailureCreateUpdate', data, { authorization: false });
};
