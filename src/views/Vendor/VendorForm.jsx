import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import ReactSelect from 'react-select';
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
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-500 px-5 py-4 sm:px-8 text-center rounded-t-2xl">
                    <h1 className="text-3xl font-bold text-white">{isEdit ? 'Update Vendor' : 'Create New Vendor'}</h1>
                    <p className="mt-1 text-blue-100 text-sm">{isEdit ? 'Modify vendor information' : 'Add a new vendor to the system'}</p>
                </div>

                {/* Form Content */}
                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                        {/* Vendor Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vendor Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Vendor name is required' }}
                                render={({ field }) => <InputField {...field} error={!!errors.name} placeholder="Enter vendor name" />}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                        </div>

                        {/* Service Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Type <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="service_type"
                                control={control}
                                rules={{ required: 'Service Type is required' }}
                                render={({ field }) => (
                                    <InputField {...field} error={!!errors.service_type} placeholder="e.g. Maintenance, Supply, Repair" />
                                )}
                            />
                            {errors.service_type && <p className="mt-1 text-sm text-red-600">{errors.service_type.message}</p>}
                        </div>

                        {/* Organization Dropdown */}
                        <Controller
                            name="organization_id"
                            control={control}
                            rules={{ required: 'Organization is required' }}
                            render={({ field }) => {
                                const options = organizations.map((org) => ({
                                    value: org.organization_id,
                                    label: org.name
                                }));

                                return (
                                    <div>
                                        <label className="text-sm font-medium">
                                            Organization <span className="text-red-500">*</span>
                                        </label>

                                        <ReactSelect
                                            options={options}
                                            value={options.find((opt) => opt.value === field.value) || null}
                                            onChange={(selected) => field.onChange(selected?.value)}
                                            onBlur={field.onBlur}
                                            isLoading={orgLoading}
                                            placeholder="Select organization"
                                            maxMenuHeight={180}
                                            menuPlacement="auto"
                                            closeMenuOnScroll
                                            menuShouldScrollIntoView={false}
                                        />

                                        {errors.organization_id && <p className="text-xs text-red-500">{errors.organization_id.message}</p>}
                                    </div>
                                );
                            }}
                        />

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.com$/,
                                            message: 'Invalid email address'
                                        }
                                    }}
                                    render={({ field }) => <InputField {...field} placeholder="vendor@example.com" />}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <Controller
                                    name="phone"
                                    control={control}
                                    rules={{
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Phone must be 10 digits'
                                        }
                                    }}
                                    render={({ field }) => <InputField {...field} placeholder="Enter 10-digit number" />}
                                />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Button type="button" variant="outlined" onClick={() => navigate('/vendor')} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                loading={mutation.isPending}
                                disabled={mutation.isPending}
                                className="flex-1"
                            >
                                {isEdit ? 'Update Vendor' : 'Create Vendor'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default VendorForm;
