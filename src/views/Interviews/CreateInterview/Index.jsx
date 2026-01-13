import { useState } from 'react';
import { FiClipboard, FiHelpCircle } from 'react-icons/fi';
import InterviewDetails from './InterviewDetails';
import InterviewQuestion from './InterviewQuestion';
import { useMutation, useQuery } from '@tanstack/react-query';
import { GenerateInterviewQuestionsApi, InterviewInitApi } from '@/api/InterviewApi';
import { decryptData } from '@/utils/CryptoService';
import { useTranslate } from '@/hooks/useTranslate';

const CreateInterview = () => {
    const [currPage, setCurrPage] = useState(1);
    const [formData, setFormData] = useState({});

    const { t } = useTranslate();

    const steps = [
        { id: 1, label: t('job_details'), icon: FiClipboard },
        { id: 2, label: t('questions'), icon: FiHelpCircle }
    ];

    const { data } = useQuery({
        queryKey: ['Interview-Init'],
        queryFn: () => InterviewInitApi(),
        select: (res) => {
            const secret = res.headers && (res.headers['x-encryption-secret'] || res.headers['X-Encryption-Secret']);
            const data = res.data.data;

            return { secret: decryptData(data?.generate_question_key, secret), data };
        }
    });

    const generateQue = useMutation({ mutationFn: GenerateInterviewQuestionsApi });

    const PageAction = (action, form_data = {}) => {
        if (action === 'next') {
            setFormData((prev) => ({ ...prev, ...form_data }));
            setCurrPage((prev) => prev + 1);
            if (form_data.action === 'generate') {
                generateQue.mutateAsync(
                    { secret: data.secret, objective: form_data.objective, no_of_question: form_data.no_question },
                    {
                        onSuccess: (res) => {
                            setFormData((prev) => ({ ...prev, ...form_data, generated_questions: res }));
                        }
                    }
                );
            }
        } else if (action === 'back') {
            setCurrPage((prev) => Math.max(1, prev - 1));
        }
    };

    return (
        <div
            className="flex-1 flex items-center justify-center rounded-xl
                        bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100
                        px-4 py-8"
        >
            <div className="w-full max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">{t('create_interview_btn')}</h1>
                    <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">{t('create_interview_header')}</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 lg:p-8">
                    {/* Stepper */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currPage >= step.id;

                                return (
                                    <div key={step.id} className="flex items-center w-full">
                                        <div
                                            className={[
                                                'flex items-center justify-center h-9 w-9 rounded-full text-sm font-semibold',
                                                isActive ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                                            ].join(' ')}
                                        >
                                            <Icon className="text-sm" />
                                        </div>

                                        <span
                                            className={['ml-3 text-sm font-medium', isActive ? 'text-indigo-600' : 'text-slate-400'].join(
                                                ' '
                                            )}
                                        >
                                            {step.label}
                                        </span>

                                        {index < steps.length - 1 && (
                                            <div
                                                className={[
                                                    'flex-1 h-[2px] mx-4',
                                                    currPage > step.id ? 'bg-indigo-600' : 'bg-slate-200'
                                                ].join(' ')}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="animate-fadeIn">
                        {currPage === 1 && <InterviewDetails PageAction={PageAction} data={data?.data || null} />}
                        {currPage === 2 && (
                            <InterviewQuestion PageAction={PageAction} formData={formData} isGenerating={generateQue.isPending} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateInterview;
