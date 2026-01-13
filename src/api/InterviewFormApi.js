import ApiService from '@/utils/services/ApiService';

export const InterviewFormUpsertApi = async (data) => {
    return await ApiService.post('/interview/InterviewForm/interview_FormCreate', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const InterviewFormByIdApi = async (formId) => {
    if (!formId) return null;

    return await ApiService.get(`/interview/InterviewForm/interview_FormById`, { id: formId }, { authorization: true });
};

export const JobApplicationFormLayout = async (data) => {
    return await ApiService.get(`/interview/interviewform/interview_FormByInterviewFormId`, data, { authorization: false });
};
