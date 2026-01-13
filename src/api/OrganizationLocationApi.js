import ApiService from '@/utils/services/ApiService';

export const CountryListApi = async (data) => {
    return await ApiService.get('/org/OrganizationLocation/get-county-list', data, { authorization: true });
};

export const StateByCountryListApi = async (data) => {
    return await ApiService.get('/org/OrganizationLocation/get-states-by-country', data, { authorization: true });
};

export const CityByStateListApi = async (data) => {
    return await ApiService.get('/org/OrganizationLocation/get-cities-by_state', data, { authorization: true });
};
