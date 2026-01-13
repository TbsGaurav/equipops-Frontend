import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InterviewTypeByIdApi, InterviewTypeUpsertApi } from '@/api/InterviewTypeApi';
import { RotatingLines } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';
import Toast from '@/utils/toast';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),
    interview_Type: yup.string().trim().required('Interview type is required')
});

const InterviewTypeForm = ({ onClose, InterviewTypeId }) => {
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            id: InterviewTypeId || null,
            interview_Type: ''
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { data, isFetching } = useQuery({
        queryKey: ['interviewtype-list', InterviewTypeId],
        queryFn: () => InterviewTypeByIdApi({ id: InterviewTypeId }),
        enabled: !!InterviewTypeId,
        select: (res) => res.data
    });

    useEffect(() => {
        if (data) {
            const interviewType = data.interviewType ?? '';

            reset({
                id: interviewType.id ?? null,
                interview_Type: interviewType.interview_Type ?? ''
            });
        }
    }, [data, reset]);

    const mutation = useMutation({
        mutationFn: (data) => InterviewTypeUpsertApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interviewtype-list'], exact: false });
            Toast.success(InterviewTypeId ? 'InterviewType updated successfully' : 'InterviewType created successfully');
            onClose();
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save InterviewType';

            Toast.error(errorMessage);
        }
    });
    const submitHandler = (data) => {
        mutation.mutate(data);
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
                <span className="ml-3 text-gray-600 text-sm">Loading interview type data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6 text-gray-900">
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="interview_Type" className="block text-xs font-semibold text-gray-600 mb-1">
                            Interview Type <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="interview_Type"
                            control={control}
                            render={({ field }) => <InputField {...field} placeholder="e.g. Full-Time" error={!!errors.name} />}
                        />
                        {errors.interview_Type && <p className="text-xs text-red-500 mt-1">{errors.interview_Type.message}</p>}
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => onClose()}
                    className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                    Cancel
                </button>

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="px-4 py-2 text-sm"
                    disabled={mutation.isPending}
                    loading={mutation.isPending}
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </form>
    );
};

InterviewTypeForm.propTypes = {
    onClose: PropTypes.func,
    InterviewTypeId: PropTypes.string
};

export default InterviewTypeForm;
