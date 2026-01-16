import ApiService from '@/utils/services/ApiService';

export const EquipmentSubpartListApi = async (data) => {
    return await ApiService.get('/EquipmentSubpart/equipmentsubpartList', data, { authorization: false });
};

export const EquipmentSubpartDeleteApi = async (data) => {
    return await ApiService.post('/EquipmentSubpart/equipmentsubpartDelete', data, { authorization: false });
};

export const EquipmentSubpartByIdApi = async (subpart_id) => {
    return ApiService.get('/EquipmentSubpart/equipmentsubpartById', { subpart_id }, { authorization: false });
};

export const EquipmentSubpartUpsertApi = async (data) => {
    return await ApiService.post('/EquipmentSubpart/equipmentsubpartCreateUpdate', data, { authorization: false });
};
