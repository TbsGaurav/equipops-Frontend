import ApiService from '@/utils/services/ApiService';
/****************************************************************************************************************
 * i-Start Job Template API functions
 ****************************************************************************************************************/

export const JobTemplateListApi = async (data) => {
    return await ApiService.get('/org/JobPost/jobTemplate/list', data, { authorization: true });
};
export const JobTemplateByIdApi = async (data) => {
    return await ApiService.get('/org/JobPost/jobTemplate/get-by-id', data, { authorization: true });
};
export const JobTemplateUpsertApi = async (data) => {
    return await ApiService.post('/org/JobPost/jobTemplate/create-update', data, { authorization: true });
};
export const JobTemplateDeleteApi = async (data) => {
    return await ApiService.post('/org/JobPost/jobTemplate/delete', data, { authorization: true });
};
export const EmploymentTypeListApi = async (data) => {
    return await ApiService.get('/org/JobPost/jobTemplate/employment-type-list', data, { authorization: true });
};
/****************************************************************************************************************
 * i-End Job Template API functions
 ****************************************************************************************************************/
