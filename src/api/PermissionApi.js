import ApiService from '@/utils/services/ApiService';

export const PermissionListApi = async (data) => {
    return await ApiService.get('/Permission/permissionList', data, { authorization: false });
};

export const PermissionDeleteApi = async (data) => {
    return await ApiService.post('/Permission/permissionDelete', data, { authorization: false });
};

export const PermissionByIdApi = async (permission_id) => {
    return ApiService.get('/Permission/permissionById', { permission_id }, { authorization: false });
};
export const PermissionUpsertApi = async (data) => {
    return await ApiService.post('/Permission/permissionCreateUpdate', data, { authorization: false });
};
