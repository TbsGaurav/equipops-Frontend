import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { VendorByIdApi, VendorUpsertApi } from '@/api/VendorApi';
import { Organization1DropdownApi } from '@/api/DropdownApi';

const VendorForm = () => {
    const { vendor_id } = useParams();
    const isEdit = !!vendor_id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            vendor_id: null,
            organization_id: '',
            name: '',
            email: '',
            phone: '',
            service_type: ''
        }
    });

    /* ===================== ORGANIZATION DROPDOWN ===================== */
    const { data: orgData, isLoading: orgLoading } = useQuery({
        queryKey: ['organization-dropdown'],
        queryFn: async () => {
            const res = await Organization1DropdownApi();
            console.log('Organization API Response:', res);
            return res;
        }
    });

    const organizations = orgData?.data || [];

    /* ===================== GET BY ID (EDIT MODE) ===================== */
    const { data, isFetching } = useQuery({
        queryKey: ['vendor-by-id', vendor_id],
        queryFn: () => VendorByIdApi(vendor_id),
        enabled: !!vendor_id
    });

    useEffect(() => {
        const vendor = data?.value?.data;

        if (vendor) {
            reset({
                vendor_id: vendor.vendor_id,
                organization_id: String(vendor.organization_id),
                name: vendor.name ?? '',
                email: vendor.email ?? '',
                phone: vendor.phone ?? '',
                service_type: vendor.service_type ?? ''
            });
        }
    }, [data, reset]);

    /* ===================== UPSERT ===================== */
    const mutation = useMutation({
        mutationFn: VendorUpsertApi,
        onSuccess: () => {
            Toast.success(`Vendor ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['vendors'] });
            navigate('/vendor');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save vendor');
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            vendor_id: formData.vendor_id || 0,
            organization_id: Number(formData.organization_id),
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            service_type: formData.service_type
        };

        mutation.mutate(payload);
    };

    if (isFetching) {
        return <div className="p-6 text-center">Loading vendor...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Update Vendor' : 'Create Vendor'}</h1>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                {/* Vendor Name */}
                <div>
                    <label className="text-sm font-medium">
                        Vendor Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Vendor name is required' }}
                        render={({ field }) => <InputField {...field} error={!!errors.name} placeholder="Enter vendor name" />}
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* Service Type */}
                <div>
                    <label className="text-sm font-medium">
                        Service Type <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="service_type"
                        control={control}
                        rules={{ required: 'Service Type is required' }}
                        render={({ field }) => <InputField {...field} error={!!errors.name} placeholder="Enter service type" />}
                    />
                    {errors.service_type && <p className="text-xs text-red-500">{errors.service_type.message}</p>}
                </div>

                {/* Organization Dropdown */}
                <Controller
                    name="organization_id"
                    control={control}
                    rules={{ required: 'Organization is required' }}
                    render={({ field }) => (
                        <div>
                            <label className="text-sm font-medium">
                                Organization <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={orgLoading}
                                className={`w-full border rounded-md px-3 py-2 ${
                                    errors.organization_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select organization</option>
                                {organizations.map((org) => (
                                    <option key={org.organization_id} value={String(org.organization_id)}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                            {errors.organization_id && <p className="text-xs text-red-500">{errors.organization_id.message}</p>}
                        </div>
                    )}
                />

                {/* Email */}
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <Controller
                        name="email"
                        control={control}
                        rules={{
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.com$/,
                                message: 'Invalid email address'
                            }
                        }}
                        render={({ field }) => <InputField {...field} placeholder="Enter email" />}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Controller
                        name="phone"
                        control={control}
                        rules={{
                            pattern: {
                                value: /^[0-9]{10}$/,
                                message: 'Phone must be 10 digits'
                            }
                        }}
                        render={({ field }) => <InputField {...field} placeholder="Enter phone number" />}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outlined" onClick={() => navigate('/vendor')}>
                        Cancel
                    </Button>

                    <Button type="submit" variant="contained" loading={mutation.isPending}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default VendorForm;
