import ApiService from '@/utils/services/ApiService';

export const VendorListApi = async (data) => {
    return await ApiService.get('/Vendor/vendorList', data, { authorization: false });
};

export const VendorDeleteApi = async (data) => {
    return await ApiService.post('/Vendor/vendorDelete', data, { authorization: false });
};

export const VendorByIdApi = async (vendor_id) => {
    return ApiService.get('/Vendor/vendorById', { vendor_id }, { authorization: false });
};

export const VendorUpsertApi = async (data) => {
    return await ApiService.post('/Vendor/vendorCreateUpdate', data, { authorization: false });
};
