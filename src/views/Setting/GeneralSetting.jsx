import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { IoPersonOutline } from 'react-icons/io5';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { OrganizationByIdApi, OrganizationUpsertApi } from '@/api/OrganizationApi';
import { useSelector } from 'react-redux';

const ValidationSchema = yup.object({
    name: yup.string().required('Company name is required'),
    website: yup.string().nullable(),
    email: yup.string().email('Invalid email').required('Email is required'),
    number: yup.string().nullable()
});

const GeneralSetting = () => {
    const queryClient = useQueryClient();
    const orgId = useSelector((state) => state.user?.user?.organizationId);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            website: '',
            email: '',
            number: ''
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { data, isFetching } = useQuery({
        queryKey: ['organization-by-id', orgId],
        queryFn: () => OrganizationByIdApi({ id: orgId }),
        enabled: !!orgId,
        select: (res) => res.data.organization
    });

    useEffect(() => {
        if (data) {
            reset({
                name: data.name ?? '',
                website: data.website_Url ?? '',
                email: data.email ?? '',
                number: data.phone_No ?? ''
            });
        }
    }, [data, reset]);

    const mutation = useMutation({
        mutationFn: OrganizationUpsertApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'], exact: false });
        },
        onError: (error) => {
            Toast.error(error?.response?.data?.message || 'Failed to save organization');
        }
    });

    const SubmitHandler = (formData) => {
        const payload = {
            id: orgId ?? null,
            name: formData.name,
            website_Url: formData.website,
            email: formData.email,
            phone_No: formData.number
        };

        mutation.mutate(payload);
    };

    if (isFetching) {
        return <p className="text-sm text-gray-500">Loading organization details...</p>;
    }

    return (
        <form onSubmit={handleSubmit(SubmitHandler)} className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <IoPersonOutline className="size-5" />
                <h2 className="text-lg font-semibold text-gray-800">General Information</h2>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-600">Company Name</label>
                    <InputField type="text" placeholder="Enter Company Name" error={errors.name} {...register('name')} />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-600">Company Website</label>
                    <InputField type="url" placeholder="https://example.com" error={errors.website} {...register('website')} />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-600">Email Address</label>
                    <InputField type="email" placeholder="company@email.com" error={errors.email} {...register('email')} />
                </div>

                <div>
                    <label className="text-sm font-medium text-gray-600">Phone Number</label>
                    <InputField type="text" placeholder="+91 9876543210" error={errors.number} {...register('number')} />
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center">
                <Button type="submit" variant="contained" color="primary" loading={mutation.isPending}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
};

export default GeneralSetting;
