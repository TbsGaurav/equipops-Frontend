import ApiService from '@/utils/services/ApiService';

export const UserListApi = async (data) => {
    return await ApiService.get('/org/User/list', data, { authorization: true });
};

export const UserDeleteApi = async (data) => {
    return await ApiService.post('/org/User/delete', data, { authorization: true });
};

export const UserByIdApi = async (data) => {
    return await ApiService.get('/org/User/getById', data, { authorization: true });
};

export const UserUpsertApi = async (data) => {
    return await ApiService.post('/org/User/createUpdate', data, { authorization: true });
};
