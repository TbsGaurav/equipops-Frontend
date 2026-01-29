import axios from 'axios';

const env = import.meta.env;

/****************************************************************************************************************
 *                                         Vendor                                                                *
 ****************************************************************************************************************/

export const VendorListApi = async (params) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Vendor/vendorList', { params });
        return response.data;
    } catch (error) {
        console.error('VendorListApi error', error);
        throw error;
    }
};

export const VendorByIdApi = async (vendor_id) => {
    try {
        const response = await axios.get(env.VITE_TEMP_API_URL + '/Vendor/vendorById', { params: { vendor_id } });
        return response.data;
    } catch (error) {
        console.error('VendorByIdApi error', error);
        throw error;
    }
};

export const VendorUpsertApi = async (payload) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/Vendor/vendorCreateUpdate', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('VendorUpsertApi error', error);
        throw error;
    }
};

export const VendorDeleteApi = async (vendor_id) => {
    try {
        const response = await axios.post(env.VITE_TEMP_API_URL + '/Vendor/vendorDelete', null, { params: { vendor_id } });
        return response.data;
    } catch (error) {
        console.error('VendorDeleteApi error', error);
        throw error;
    }
};
