import ApiService from '@/utils/services/ApiService';

export const MasterDropdownListApi = async () => {
    return await ApiService.get('/setting/MasterDropdown/list', null, { authorization: true });
};
