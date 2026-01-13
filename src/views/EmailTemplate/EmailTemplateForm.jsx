'use client';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { RotatingLines } from 'react-loader-spinner';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EmailTemplateByIdApi, EmailTemplateUpsertApi } from '@/api/SettingApi';
import { FiCheck, FiPlus } from 'react-icons/fi';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Toast from '@/utils/toast';

const EmailTemplateForm = ({ EmailTemplateId, onCancel, onClose }) => {
    const queryClient = useQueryClient();

    const ValidationSchema = yup.object({
        id: yup.mixed().nullable(),
        type: yup.string().trim().required('Type is required'),
        subject: yup.string().trim().required('Subject is required'),
        text: yup.string().trim().required('Text is required')
    });
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            id: EmailTemplateId || null,
            type: '',
            subject: '',
            text: ''
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { data, isFetching } = useQuery({
        queryKey: ['emailTemplate-by-id', EmailTemplateId],
        queryFn: () => EmailTemplateByIdApi({ id: EmailTemplateId }),
        enabled: !!EmailTemplateId,
        select: (res) => res.data
    });

    useEffect(() => {
        if (!data) return;

        reset({
            id: data.id ?? null,
            type: data.type ?? '',
            subject: data.subject ?? '',
            text: data.text ?? ''
        });
    }, [data, reset]);

    const mutation = useMutation({
        mutationFn: (data) => EmailTemplateUpsertApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['emailTemplates'], exact: false });
            Toast.success(EmailTemplateId ? 'Email template updated successfully' : 'Email template created successfully');

            onClose();
        },

        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save email template';

            Toast.error(errorMessage);
        }
    });
    const loading = mutation.isPending;

    const submitHandler = async (formData) => {
        const payload = {
            id: EmailTemplateId ?? null,
            type: formData.type.trim(),
            subject: formData.subject.trim(),
            text: formData.text
        };
        mutation.mutate(payload);
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center py-10">
                <RotatingLines
                    visible={true}
                    height="1.2em"
                    width="1.2em"
                    color="currentColor"
                    strokeWidth="5"
                    animationDuration="0.75"
                    ariaLabel="rotating-lines-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                />
                <span className="ml-3 text-gray-600 text-sm">Loading EmailTemplate data...</span>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="flex items-center justify-center gap-2 text-2xl md:text-3xl font-semibold text-slate-900">
                        {EmailTemplateId ? (
                            <>
                                <FiCheck className="text-indigo-500" />
                                Update Email Template
                            </>
                        ) : (
                            <>
                                <FiPlus className="text-indigo-500" />
                                Create Email Template
                            </>
                        )}
                    </h1>
                </div>

                {/* Card */}
                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 lg:p-8 flex flex-col gap-6"
                >
                    {/* Type */}
                    <div className="space-y-1.5 max-w-md">
                        <label className="text-xs font-medium text-slate-700">
                            Template Type <span className="text-red-500">*</span>
                        </label>

                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <InputField
                                    {...field}
                                    placeholder="e.g. WelcomeEmail"
                                    className="bg-slate-50/60 h-11 rounded-lg"
                                    error={!!errors.type}
                                />
                            )}
                        />

                        {errors.type && <p className="text-[11px] text-red-500">{errors.type.message}</p>}
                    </div>

                    {/* Subject */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-700">
                            Email subject <span className="text-red-500">*</span>
                        </label>

                        <Controller
                            name="subject"
                            control={control}
                            render={({ field }) => (
                                <InputField
                                    {...field}
                                    placeholder="Enter email subject"
                                    className="bg-slate-50/60 h-11 rounded-lg"
                                    error={!!errors.subject}
                                />
                            )}
                        />

                        {errors.subject && <p className="text-[11px] text-red-500">{errors.subject.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-700">Email Body</label>

                        <div
                            className="
                                rounded-xl border border-slate-300 bg-white overflow-hidden

                                [&_.ql-container]:border-0
                                [&_.ql-editor]:border-0

                                [&_.ql-toolbar]:border-0
                                [&_.ql-toolbar]:border-b
                                [&_.ql-toolbar]:border-slate-200

                                [&_.ql-editor]:min-h-[320px]
                                [&_.ql-editor]:px-4
                                [&_.ql-editor]:py-3
                                [&_.ql-editor]:text-sm
                                [&_.ql-editor]:leading-relaxed
                                "
                        >
                            <Controller
                                name="text"
                                control={control}
                                render={({ field }) => (
                                    <ReactQuill
                                        theme="snow"
                                        value={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder="Write your email content here… Use {Name}, {Email}"
                                    />
                                )}
                            />
                        </div>
                    </div>
                    <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-600">
                        <p className="font-semibold text-slate-700 mb-1">Note:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>
                                <code className="font-mono text-indigo-600">[User_Name]</code> – Login user first & last name
                            </li>
                            <li>
                                <code className="font-mono text-indigo-600">[Subscription_Expire_Date]</code> – Subscription expiry date
                            </li>
                            <li>
                                <code className="font-mono text-indigo-600">[Organization_Name]</code> – User organization name
                            </li>
                        </ul>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 ">
                        <Button type="button" variant="outlined" onClick={onCancel} disabled={loading} className="px-5">
                            Cancel
                        </Button>

                        <Button type="submit" variant="contained" color="primary" loading={loading} className="px-6">
                            {EmailTemplateId ? 'Save changes' : 'Create template'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
EmailTemplateForm.propTypes = {
    EmailTemplateId: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default EmailTemplateForm;
