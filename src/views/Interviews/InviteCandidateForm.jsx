import { useTranslate } from '@/hooks/useTranslate';
import InputField from '@/utils/components/ui/InputField';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PropTypes from 'prop-types';
import { useMutation } from '@tanstack/react-query';
import { CandidateInvitationApi } from '@/api/InterviewApi';
import { useRef } from 'react';
import { WiCloudUp } from 'react-icons/wi';
import { MdClose } from 'react-icons/md';
import Button from '@/utils/components/ui/Button';
import toast from 'react-hot-toast';

// Only allow PDF now
const allowedTypes = ['application/pdf'];

// Yup validation schema
const getValidationSchema = () =>
    yup.object().shape({
        candidate_name: yup.string().required('Candidate name is required.'),
        candidate_email: yup.string().email('Invalid email address.').required('Candidate email is required.'),
        resume: yup.mixed().nullable().required('Resume is required.')
        // .test('fileType', 'Only PDF files are allowed.', (value) => {
        //     if (!value || !value.length) return false; // no file
        //     const file = value[0]; // first file
        //     return file.type === 'application/pdf'; // check type
        // })
    });

const InviteCandidateForm = ({ interviewId, onClose }) => {
    const { t } = useTranslate();
    const imageInputRef = useRef();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(getValidationSchema()),
        defaultValues: { interviewId, candidate_name: '', candidate_email: '', resume: null },
        mode: 'onSubmit'
    });

    const watchResume = watch('resume');

    const handleFileDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file) return;

        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PDF files are allowed.');
        } else {
            setValue('resume', e.dataTransfer.files, { shouldValidate: true });
        }
    };

    const handleFileRemove = () => {
        setValue('resume', null, { shouldValidate: true });
    };

    const mutation = useMutation({
        mutationFn: CandidateInvitationApi,
        onSuccess: () => {
            toast.success('Invitation sent successfully.');
            onClose();
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to send invitation.');
        }
    });

    const submitFC = (data) => {
        const formData = new FormData();
        formData.append('InterviewId', data.interviewId);
        formData.append('Name', data.candidate_name);
        formData.append('Email', data.candidate_email);
        formData.append('Resume', data.resume[0]);

        mutation.mutateAsync(formData);
    };

    const getFileIcon = (fileType) => {
        if (fileType.includes('image')) return <WiCloudUp className="text-blue-500" size={24} />;
        if (fileType.includes('pdf')) return <span className="text-red-500">📄</span>;
        return <span className="text-gray-500">📄</span>;
    };
    return (
        <form onSubmit={handleSubmit(submitFC)} className="flex flex-col gap-4 text-black">
            <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-900">
                <p className="font-medium">{t('send_interview_link_to_candidate')}</p>
                <p className="mt-1 text-xs text-indigo-800/80">{t('email_invitation_msg')} </p>
            </div>

            {/* Candidate Name */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-700 text-sm">
                    Candidate Name <span className="text-red-500">*</span>
                </label>
                <InputField {...register('candidate_name')} placeholder="Candidate Name" error={errors.candidate_name} />
                {errors.candidate_name && <p className="text-xs text-red-500">{errors.candidate_name.message}</p>}
            </div>

            {/* Candidate Email */}
            <div className="space-y-2">
                <label className="font-semibold text-gray-700 text-sm">
                    {t('candidate_email_address')} <span className="text-red-500">*</span>
                </label>
                <InputField
                    {...register('candidate_email')}
                    name="candidate_email"
                    placeholder={t('candidate_email_placeholder')}
                    error={errors.candidate_email}
                />
                {errors.candidate_email && <p className="text-xs text-red-500">{errors.candidate_email.message}</p>}
            </div>

            {/* Resume Upload */}
            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    Resume <span className="text-red-500">*</span>
                </label>
                <div
                    className="relative w-full border border-gray-300 p-4 rounded-md text-center text-gray-500 cursor-pointer"
                    onDrop={handleFileDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        ref={imageInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        {...register('resume')}
                        // onChange={(e) => {
                        //     const file = e.target.files[0];

                        //     if (file) {
                        //         // setValue('resume', [file], { shouldValidate: true });
                        //         setUploadedFile(file);
                        //     }
                        // }}
                    />
                    <WiCloudUp className="mx-auto mb-0.5 text-blue-500" size={36} />
                    <p className="text-sm">
                        <span className="text-blue-600">Upload Document </span>or drag and drop
                        <br />
                        <span className="text-xs">select PDF file only</span>
                    </p>
                </div>
                {errors.resume && <p className="text-xs text-red-500">{errors.resume.message}</p>}
            </div>

            {/* Selected file preview */}
            {watchResume?.[0] && (
                <div className="flex items-center gap-2">
                    {getFileIcon(watchResume[0].type)}
                    <p className="text-sm text-gray-700 flex-1">{watchResume[0].name}</p>
                    <span className="text-red-500 cursor-pointer hover:text-red-700" onClick={handleFileRemove}>
                        <MdClose size={20} />
                    </span>
                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => onClose()}
                >
                    {t('cancel_btn')}
                </button>

                <Button type="submit" color="primary" disabled={mutation.isPending} loading={mutation.isPending}>
                    {t('send_invitation_btn')}
                </Button>
            </div>
        </form>
    );
};

InviteCandidateForm.propTypes = {
    onClose: PropTypes.func,
    interviewId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default InviteCandidateForm;
