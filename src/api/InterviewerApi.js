import ApiService from '@/utils/services/ApiService';

export const InterviewerVoiceListApi = async () => {
    return await ApiService.get('/interview/Interviewer/voices', null, { authorization: true });
};

// InterviewerApi.js

export const InterviewerListApi = async (organizationId) => {
    return ApiService.get('/interview/Interviewer/list', organizationId ? { organizationId } : null, { authorization: true });
};

export const InterviewerByIdApi = async (data) => {
    return await ApiService.get('/interview/Interviewer/get-by-id/', data, { authorization: true });
};

export const InterviewerCreateApi = async (data) => {
    return await ApiService.post('/interview/interviewer/create', data, {
        authorization: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const InterviewerUpdateApi = async (data) => {
    return await ApiService.post('/interview/interviewer/update', data, {
        authorization: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const InterviewerDeleteApi = async (data) => {
    return await ApiService.post('/interview/Interviewer/delete', data, { authorization: true });
};
