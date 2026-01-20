import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import ReactSelect from 'react-select';
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
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Update Category' : 'Create New Category'}</h1>
                    <p className="mt-2 text-gray-500">
                        {isEdit ? 'Modify Equipment Category information' : 'Add a new Equipment Category to the system'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    {/* CATEGORY NAME */}
                    <div>
                        <label className="text-sm font-medium">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="category_name"
                            control={control}
                            rules={{
                                required: 'Category name is required',
                                maxLength: {
                                    value: 50,
                                    message: 'Category name cannot exceed 50 characters'
                                }
                            }}
                            render={({ field }) => (
                                <InputField {...field} error={!!errors.category_name} placeholder="Enter category name" />
                            )}
                        />
                        {errors.category_name && <p className="text-xs text-red-500">{errors.category_name.message}</p>}
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
                                        closeMenuOnScroll={true}
                                        menuShouldScrollIntoView={false}
                                    />

                                    {errors.organization_id && <p className="text-xs text-red-500">{errors.organization_id.message}</p>}
                                </div>
                            );
                        }}
                    />

                    {/* DESCRIPTION */}
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Controller
                            name="description"
                            control={control}
                            rules={{
                                maxLength: {
                                    value: 200,
                                    message: 'Description cannot exceed 200 characters'
                                }
                            }}
                            render={({ field }) => <InputField {...field} placeholder="Enter description" />}
                        />
                        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
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
        </div>
    );
};

export default EquipmentCategoryForm;
