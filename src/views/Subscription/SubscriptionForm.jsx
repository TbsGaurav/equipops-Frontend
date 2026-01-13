import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';
import { SubscriptionTypeByIdApi, SubscriptionTypeUpsertApi } from '@/api/SettingApi';
import Toast from '@/utils/toast';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),

    type: yup.string().trim().required('Subscription Type is required'),

    description: yup.string().trim().required('Description is required'),

    duration: yup.number().typeError('Duration must be a number').min(0, 'Duration must be >= 0').nullable(),

    price: yup.number().typeError('Amount must be a number').min(0, 'Amount must be >= 0').nullable(),

    resume_matching: yup.number().typeError('Resume matching must be a number').min(0).nullable(),

    interview_create: yup.number().typeError('Interview create must be a number').min(0).nullable(),

    interview_schedule: yup.number().typeError('Interview schedule must be a number').min(0).nullable()
});

const SubscriptionForm = ({ onClose, SubscriptionId }) => {
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            id: SubscriptionId || null,
            type: '',
            duration: '',
            price: '',
            description: '',
            resume_matching: '',
            interview_create: '',
            interview_schedule: ''
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { data, isFetching } = useQuery({
        queryKey: ['subscriptionType-by-id', SubscriptionId],
        queryFn: () => SubscriptionTypeByIdApi({ id: SubscriptionId }),
        enabled: !!SubscriptionId,
        select: (res) => res.data
    });

    useEffect(() => {
        if (!SubscriptionId || !data?.id) return;

        reset({
            id: data.id,
            type: data.type ?? '',
            price: data.price ?? '',
            description: data.description ?? '',
            duration: data.duration ?? '',
            resume_matching: data.resume_matching ?? '',
            interview_create: data.interview_create ?? '',
            interview_schedule: data.interview_schedule ?? ''
        });
    }, [data, reset, SubscriptionId]);

    const mutation = useMutation({
        mutationFn: (payload) => SubscriptionTypeUpsertApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['subscriptions'],
                exact: false
            });
            Toast.success(SubscriptionId ? 'Subscription updated successfully' : 'Subscription created successfully');
            onClose();
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save subscription';

            Toast.error(errorMessage);
        }
    });

    const renderNumber = (value) => {
        if (value === 0 || value === null || value === undefined) return '';
        return value;
    };
    const submitHandler = (data) => {
        const payload = {
            ...data,
            duration: renderNumber(data.duration),
            price: renderNumber(data.price),
            resume_matching: renderNumber(data.resume_matching),
            interview_create: renderNumber(data.interview_create),
            interview_schedule: renderNumber(data.interview_schedule)
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
                <span className="ml-3 text-gray-600 text-sm">Loading organization data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6 text-gray-900">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Plan Name <span className="text-red-500">*</span>
                    </label>

                    <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                            <InputField {...field} placeholder="e.g. Sunrise Multispeciality Hospital" error={!!errors.type} />
                        )}
                    />
                    {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Duration <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="duration"
                            control={control}
                            render={({ field }) => <InputField {...field} type="number" min={0} error={!!errors.duration} />}
                        />
                        {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="price"
                            control={control}
                            render={({ field }) => <InputField {...field} type="number" min={0} error={!!errors.price} />}
                        />
                        {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                    </div>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Resume Matching</label>
                <Controller
                    name="resume_matching"
                    control={control}
                    render={({ field }) => (
                        <InputField {...field} type="number" min={0} placeholder="e.g. 5" error={!!errors.resume_matching} />
                    )}
                />
                {errors.resume_matching && <p className="text-xs text-red-500 mt-1">{errors.resume_matching.message}</p>}
            </div>

            {/* Interview Create */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Interview Create</label>
                <Controller
                    name="interview_create"
                    control={control}
                    render={({ field }) => (
                        <InputField {...field} type="number" min={0} placeholder="e.g. 10" error={!!errors.interview_create} />
                    )}
                />
                {errors.interview_create && <p className="text-xs text-red-500 mt-1">{errors.interview_create.message}</p>}
            </div>

            {/* Interview Schedule */}
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Interview Schedule</label>
                <Controller
                    name="interview_schedule"
                    control={control}
                    render={({ field }) => (
                        <InputField {...field} type="number" min={0} placeholder="e.g. 20" error={!!errors.interview_schedule} />
                    )}
                />
                {errors.interview_schedule && <p className="text-xs text-red-500 mt-1">{errors.interview_schedule.message}</p>}
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>

                <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            rows={3}
                            placeholder="Brief description of the subscription plan"
                            className={`
                    w-full rounded-md border border-gray-300 p-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-primary-dark/40
                `}
                        />
                    )}
                />

                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
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

SubscriptionForm.propTypes = {
    onClose: PropTypes.func,
    SubscriptionId: PropTypes.string
};

export default SubscriptionForm;
