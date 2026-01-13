import ApiService from '@/utils/services/ApiService';

export const CandidateListApi = async (data) => {
    return await ApiService.get('/org/Candidate/list', data, { authorization: true });
};

export const CandidateUpsertApi = async (data) => {
    return await ApiService.post('/org/candidate/create-update', data, {
        authorization: false,
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
