import ApiService from '@/utils/services/ApiService';

export const OrganizationListApi = async (data) => {
    return await ApiService.get('/org/Organization/list', data, { authorization: true });
};

export const OrganizationByIdApi = async (data) => {
    return await ApiService.get('/org/Organization/get-by-id', data, { authorization: true });
};

export const OrganizationUpsertApi = async (data) => {
    return await ApiService.post('/org/Organization/create-update', data, { authorization: true });
};

export const OrganizationDeleteApi = async (data) => {
    return await ApiService.post('/org/Organization/delete', data, { authorization: true });
};

export const OrganizationProfileByIdApi = async (id) => {
    return await ApiService.get('/org/Organization/profile', id, { authorization: true });
};

export const UpdateProfileApi = (formData) => {
    return ApiService.post('/org/Organization/update-profile', formData, {
        authorization: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/****************************************************************************************************************
 *                                            Organization Settings                                             *
 ****************************************************************************************************************/
export const OrganizationSettingListApi = async () => {
    const res = await ApiService.get('/org/OrganizationSetting/list', null, { authorization: true }, 'full');
    res.headers['x-encryption-secret'];
    return { headers: res.headers, data: res.data };
};

export const OrganizationSettingUpsertApi = async (data) => {
    return await ApiService.post('/org/OrganizationSetting/create-update', data, { authorization: true });
};

export const OrganizationRetellLLMGenerateApi = async (data) => {
    return await ApiService.post('/org/OrganizationSetting/generate-retell-llm', data, { authorization: true });
};

/****************************************************************************************************************
 *                                            Organization For SuperAdmin                                       *
 ****************************************************************************************************************/

export const OrganizationsForSuperAdminApi = async (data) => {
    return await ApiService.get('/org/Organization/all-org-list', data, {
        authorization: true
    });
};

export const GetOrganizationForSuperAdminApi = async (data) => {
    return await ApiService.get('/org/Organization/all-org-users-by-id', data, {
        authorization: true
    });
};

export const UpdateOrganizationStatusApi = ({ organizationId, action }) => {
    return ApiService.post('/org/Organization/update-organization-status', null, {
        authorization: true,
        params: {
            organizationId,
            action
        }
    });
};

export const getOrgListByStatusApi = async (commonParams) => {
    return ApiService.get('/org/Organization/org-list-by-status', commonParams, { authorization: true });
};

/****************************************************************************************************************
 *                                            Industry Department                                             *
 ****************************************************************************************************************/

export const IndustryDepartmentsListApi = async (data) => {
    return await ApiService.get('/org/Organization/get-industry-deparment', data, { authorization: true });
};
