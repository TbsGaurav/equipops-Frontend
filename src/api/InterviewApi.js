/****************************************************************************************************************
 *                                            Interview                                                         *
 ****************************************************************************************************************/
import ApiService from '@/utils/services/ApiService';
import OpenAI from 'openai';

export const InterviewListApi = async (data) => {
    return await ApiService.get('/interview/Interview/list', data, { authorization: true });
};

export const InterviewInitApi = async () => {
    const res = await ApiService.get('/interview/Interview/init', null, { authorization: true }, 'full');
    res.headers['x-encryption-secret'];
    return { headers: res.headers, data: res.data };
};

export const InterviewCreateApi = async (data) => {
    return await ApiService.post('/interview/Interview/create', data, {
        authorization: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const InterviewUpdateApi = async (data) => {
    return await ApiService.post('/interview/Interview/update', data, {
        authorization: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const GenerateInterviewQuestionsApi = async (data) => {
    const openai = new OpenAI({ apiKey: data.secret, dangerouslyAllowBrowser: true });

    const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            {
                role: 'system',
                content: `You are an expert question generator. You must return ONLY valid JSON. Do not include explanations or extra text.`
            },
            {
                role: 'user',
                content: `
                        Generate ${data.no_of_question} questions based on the following objective:
                        Objective: "${data.objective}"
                        Response format (strictly):
                        ["Question text here"]
                    `
            }
        ],
        temperature: 0.7
    });
    return JSON.parse(completion.choices[0].message.content);
};

export const InterviewByIdApi = async (data) => {
    return await ApiService.get('/interview/interview/get-by-id', data, { authorization: true });
};

/****************************************************************************************************************
 *                                           Interview  Questions                                               *
 ****************************************************************************************************************/
export const InterviewQuestionsCreateApi = async (data) => {
    return await ApiService.post('/interview/InterviewQue/interview_QueCreate', data, { authorization: true });
};

/****************************************************************************************************************
 *                                              Interview  Call                                                 *
 ****************************************************************************************************************/

export const InterviewTokenValidateApi = async (data) => {
    return await ApiService.post('/interview/interview/verify-token', data, { authorization: false });
};

export const InterviewCallRegisterApi = async (data) => {
    return await ApiService.post('/Interview/Interview/call-register', data, { authorization: false });
};

export const InterviewCallEndApi = async (data) => {
    return await ApiService.post('/interview/interview/end-call', data, { authorization: false });
};

export const CandidateInvitationApi = async (data) => {
    return await ApiService.post('/org/candidate/Candidate_Interview_Invitation', data, {
        authorization: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

/****************************************************************************************************************
 *                                              Job Analysis                                                 *
 ****************************************************************************************************************/

export const InterviewJobAnalysisApi = async ({ interviewId }) => {
    const res = await ApiService.get('/interview/JobAnalysis/job-analysis', { interviewId }, { authorization: true });
    return res;
};

export const getCandidateJobAnalysisApi = async (candidateId) => {
    const res = await ApiService.get('/interview/JobAnalysis/candidate-job-analysis', { candidateId }, { authorization: true });
    return res;
};
