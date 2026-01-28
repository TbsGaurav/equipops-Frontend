import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { FiCheck, FiPlus } from 'react-icons/fi';

import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';

import { DashboardCategoryByIdApi, DashboardCategoryUpsertApi } from '@/api/DashboardCategoryApi';
import { Organization1DropdownApi1 } from '@/api/DropdownApi';

const DashboardCategoryForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    /* ===== ORGANIZATION DROPDOWN ===== */
    const { data: orgData = [], isLoading: orgLoading } = useQuery({
        queryKey: ['organization-dropdown'],
        queryFn: async () => {
            const res = await Organization1DropdownApi1();
            return res?.data || [];
        }
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            dashboardCategoryId: 0,
            organizationId: '', // 👈 important
            name: '',
            description: ''
        }
    });

    /* ===== GET BY ID ===== */
    const { data, isFetching } = useQuery({
        queryKey: ['dashboard-category-by-id', id],
        queryFn: () => DashboardCategoryByIdApi(id),
        enabled: !!id,
        select: (res) => res.data
    });

    useEffect(() => {
        if (data) {
            reset({
                dashboardCategoryId: data.dashboard_category_id,
                organizationId: data.organization_id?.toString() || '',
                name: data.name || '',
                description: data.description || ''
            });
        }
    }, [data, reset]);

    /* ===== UPSERT ===== */
    const mutation = useMutation({
        mutationFn: DashboardCategoryUpsertApi,
        onSuccess: () => {
            Toast.success(`Category ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['dashboard-categories'] });
            navigate('/dashboard-category');
        },
        onError: (err) => {
            const apiErrors = err?.response?.data?.errors || [err?.response?.data?.message] || ['Failed to save category'];

            apiErrors.forEach((e) => Toast.error(e));
        }
    });

    const submitHandler = (formData) => {
        mutation.mutate({
            ...formData,
            organizationId: Number(formData.organizationId)
        });
    };

    if (isFetching) {
        return <div className="p-6 text-center">Loading category...</div>;
    }

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                        {isEdit ? <FiCheck className="text-indigo-500" /> : <FiPlus className="text-indigo-500" />}
                        {isEdit ? 'Update Category' : 'Create Category'}
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5"
                >
                    {/* Organization */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Organization <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="organizationId"
                            control={control}
                            rules={{ required: 'Organization is required' }}
                            render={({ field }) => (
                                <>
                                    <select
                                        {...field}
                                        disabled={orgLoading}
                                        className={`w-full border rounded-lg px-3 py-2 bg-slate-50 outline-none
                                        ${errors.organizationId ? 'border-red-500' : 'border-slate-300'}
                                        focus:ring-2 focus:ring-indigo-400`}
                                    >
                                        <option value="">Select organization</option>
                                        {orgData.map((o) => (
                                            <option key={o.organization_id} value={o.organization_id}>
                                                {o.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.organizationId && <p className="text-xs text-red-500 mt-1">{errors.organizationId.message}</p>}
                                </>
                            )}
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Category Name <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Category name is required' }}
                            render={({ field }) => (
                                <>
                                    <InputField {...field} error={!!errors.name} />
                                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                </>
                            )}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <Controller name="description" control={control} render={({ field }) => <InputField {...field} />} />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard-category')}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <Button type="submit" loading={mutation.isPending}>
                            {isEdit ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DashboardCategoryForm;
