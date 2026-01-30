import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Dropdown APIs                                                          *
 ****************************************************************************************************************/
export const Organization1DropdownApi = async () => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/OrganizationController1/organization/dropdown');
        return response.data;
    } catch (error) {
        console.error('Organization1DropdownApi error', error);
        throw error;
    }
};

export const EquipmentDropdownApi = async () => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Equipment/Dropdown');
        return response.data;
    } catch (error) {
        console.error('EquipmentDropdownApi error', error);
        throw error;
    }
};

export const EquipmentSubpartDropdownApi = async () => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/EquipmentSubpart/equipmentSubpart/Dropdown');
        return response.data;
    } catch (error) {
        console.error('EquipmentSubpartDropdownApi error', error);
        throw error;
    }
};
