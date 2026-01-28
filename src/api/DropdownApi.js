import ApiService from '@/utils/services/ApiService';
import axios from 'axios';

const env = import.meta.env;
export const Organization1DropdownApi = async () => {
    return await ApiService.get('/OrganizationController1/organization/dropdown', {}, { authorization: false });
};

export const EquipmentDropdownApi = async () => {
    return await ApiService.get('/Equipment/Dropdown', {}, { authorization: false });
};

export const EquipmentSubpartDropdownApi = async () => {
    return await ApiService.get('/EquipmentSubpart/equipmentSubpart/Dropdown', {}, { authorization: false });
};
export const Organization1DropdownApi1 = async () => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/OrganizationController1/organization/dropdown', {
            authorization: false
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Organization list', error);
        throw error;
    }
};
export const EquipmentDropdownApi1 = async () => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Equipment/Dropdown', {
            authorization: false
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Equipment  list', error);
        throw error;
    }
};
export const EquipmentSubpartDropdown = async () => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentSubpart/equipmentSubpart/Dropdown', {
            authorization: false
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching Equipment Subpart list', error);
        throw error;
    }
};
