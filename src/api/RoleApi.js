import ApiService from '@/utils/services/ApiService';

export const RoleListApi = async (data) => {
    return await ApiService.get('/Role/roleList', data, { authorization: false });
};

export const RoleDeleteApi = async (data) => {
    return await ApiService.post('/Role/roleDelete', data, { authorization: false });
};

export const RoleByIdApi = async (role_id) => {
    return ApiService.get('/Role/roleById', { role_id }, { authorization: false });
};

export const RoleUpsertApi = async (data) => {
    return await ApiService.post('/Role/roleCreateUpdate', data, { authorization: false });
};
