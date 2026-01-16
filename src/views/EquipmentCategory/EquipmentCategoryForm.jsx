import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { EquipmentCategoryByIdApi, EquipmentCategoryUpsertApi } from '@/api/EquipmentCategoryApi';
import { Organization1DropdownApi } from '@/api/DropdownApi';

const EquipmentCategoryForm = () => {
    const { category_id } = useParams();
    const isEdit = !!category_id;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    /* ================= FORM ================= */
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            category_id: null,
            organization_id: null,
            category_name: '',
            description: ''
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

    /* ================= GET BY ID ================= */
    const { data, isFetching } = useQuery({
        queryKey: ['equipment-category-by-id', category_id],
        queryFn: () => EquipmentCategoryByIdApi(category_id),
        enabled: !!category_id
    });

    useEffect(() => {
        const category = data?.value?.data;

        if (category) {
            reset({
                category_id: category.category_id,
                organization_id: category.organization_id,
                category_name: category.category_name ?? '',
                description: category.description ?? ''
            });
        }
    }, [data, reset]);

    /* ================= UPSERT ================= */
    const mutation = useMutation({
        mutationFn: EquipmentCategoryUpsertApi,
        onSuccess: () => {
            Toast.success(`Equipment category ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['equipment-categories'] });
            navigate('/EquipmentCategory');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save category');
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            category_id: formData.category_id || 0,
            organization_id: Number(formData.organization_id),
            category_name: formData.category_name,
            description: formData.description
        };

        mutation.mutate(payload);
    };

    /* ================= LOADING ================= */
    if (isFetching) {
        return <div className="p-6 text-center">Loading category...</div>;
    }

    /* ================= RENDER ================= */
    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Equipment Category' : 'Create Equipment Category'}</h1>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                {/* CATEGORY NAME */}
                <div>
                    <label className="text-sm font-medium">Category Name *</label>
                    <Controller
                        name="category_name"
                        control={control}
                        rules={{ required: 'category name is required' }}
                        render={({ field }) => <InputField {...field} error={!!errors.category_name} />}
                    />
                    {errors.category_name && <p className="text-xs text-red-500">{errors.category_name.message}</p>}
                </div>

                {/* Organization Dropdown */}
                <Controller
                    name="organization_id"
                    control={control}
                    rules={{ required: 'Organization is required' }}
                    render={({ field }) => (
                        <div>
                            <label className="text-sm font-medium">Organization *</label>
                            <select
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={orgLoading}
                                className="w-full border rounded-md px-3 py-2"
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

                {/* DESCRIPTION */}
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <Controller name="description" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outlined" onClick={() => navigate('/EquipmentCategory')}>
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

export default EquipmentCategoryForm;
