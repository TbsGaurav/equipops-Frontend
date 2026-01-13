import ApiService from '@/utils/services/ApiService';

export const InterviewTypeListApi = async (data) => {
    return await ApiService.get('/interview/InterviewType/list', data, { authorization: true });
};
export const InterviewTypeByIdApi = async (data) => {
    return await ApiService.get('/interview/InterviewType/get-by-id', data, { authorization: true });
};

export const InterviewTypeUpsertApi = async (data) => {
    return await ApiService.post('/interview/InterviewType/create-update', data, { authorization: true });
};

export const InterviewTypeDeleteApi = async (data) => {
    return await ApiService.post('/interview/InterviewType/delete', data, { authorization: true });
};

export const GenerateInterviewObjectiveApi = async (data) => {
    return await ApiService.post('/interview/InterviewType/get-job-objective', data, { authorization: true });
};
