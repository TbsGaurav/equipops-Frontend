import ApiService from '@/utils/services/ApiService';

export const Organization1DropdownApi = async () => {
    return await ApiService.get('/OrganizationController1/organization/dropdown', {}, { authorization: false });
};

export const EquipmentDropdownApi = async () => {
    return await ApiService.get('/Equipment/Dropdown', {}, { authorization: false });
};

export const EquipmentSubpartDropdownApi = async () => {
    return await ApiService.get('/EquipmentSubpart/equipmentSubpart/Dropdown', {}, { authorization: false });
};
