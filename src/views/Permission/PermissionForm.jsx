import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { PermissionByIdApi, PermissionUpsertApi } from '@/api/PermissionApi';

const PermissionForm = () => {
    const { permission_id } = useParams(); // get ID from URL
    const isEdit = !!permission_id;

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
            permission_id: 0,
            permission_code: '',
            description: '',
            is_active: true
        }
    });

    /* ================= GET BY ID ================= */
    const { data, isFetching } = useQuery({
        queryKey: ['permission-by-id', permission_id],
        queryFn: () => PermissionByIdApi(permission_id),
        enabled: isEdit
    });

    useEffect(() => {
        const permission = data?.data;
        if (permission) {
            reset({
                permission_id: permission.permission_id,
                permission_code: permission.permission_code ?? '',
                description: permission.description ?? '',
                is_active: permission.is_active
            });
        }
    }, [data, reset]);

    /* ================= UPSERT ================= */
    const mutation = useMutation({
        mutationFn: PermissionUpsertApi,
        onSuccess: () => {
            Toast.success(`Permission ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['permissions'] });
            navigate('/Permission');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save permission');
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            permission_id: isEdit ? Number(formData.permission_id) : 0,
            permission_code: formData.permission_code,
            description: formData.description,
            is_active: formData.is_active === 'true' || formData.is_active === true
        };
        mutation.mutate(payload);
    };

    /* ================= LOADING ================= */
    if (isFetching) {
        return <div className="p-6 text-center">Loading permission...</div>;
    }

    /* ================= RENDER ================= */
    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{isEdit ? 'Update Permission' : 'Create New Permission'}</h1>
                    <p className="mt-2 text-gray-500">{isEdit ? 'Modify permission information' : 'Add a new permission to the system'}</p>
                </div>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    {/* PERMISSION CODE */}
                    <div>
                        <label className="text-sm font-medium">
                            Permission Code <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="permission_code"
                            control={control}
                            rules={{
                                required: 'Permission code is required'
                            }}
                            render={({ field }) => (
                                <InputField {...field} error={!!errors.permission_code} placeholder="Enter permission code name" />
                            )}
                        />
                        {errors.permission_code && <p className="text-xs text-red-500">{errors.permission_code.message}</p>}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="text-sm font-medium">Description</label>
                        <Controller name="description" control={control} render={({ field }) => <InputField {...field} />} />
                    </div>

                    {/* IS_ACTIVE */}
                    <div>
                        <label className="text-sm font-medium">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="is_active"
                            control={control}
                            rules={{ required: 'Status is required' }}
                            render={({ field }) => (
                                <select
                                    {...field}
                                    className={`w-full border rounded-md px-3 py-2 ${errors.is_active ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value={true}>Active</option>
                                    <option value={false}>Inactive</option>
                                </select>
                            )}
                        />
                        {errors.is_active && <p className="text-xs text-red-500">{errors.is_active.message}</p>}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outlined" onClick={() => navigate('/Permission')}>
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

export default PermissionForm;
