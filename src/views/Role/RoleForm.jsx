import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import ReactSelect from 'react-select';
import { RoleByIdApi, RoleUpsertApi } from '@/api/RoleApi';

const RoleForm = () => {
    const { role_id } = useParams();
    const isEdit = !!role_id;
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            role_id: 0,
            role_name: '',
            description: '',
            is_active: ''
        }
    });

    /* ===================== GET BY ID (EDIT MODE) ===================== */
    const { data, isFetching } = useQuery({
        queryKey: ['role-by-id', role_id],
        queryFn: () => RoleByIdApi(role_id),
        enabled: !!role_id
    });

    useEffect(() => {
        const role = data?.data;

        if (role) {
            reset({
                role_id: role.role_id,
                role_name: role.role_name ?? '',
                description: role.description ?? '',
                is_active: role.is_active
            });
        }
    }, [data, reset]);

    /* ===================== UPSERT ===================== */
    const mutation = useMutation({
        mutationFn: RoleUpsertApi,
        onSuccess: () => {
            Toast.success(`Role ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            navigate('/role');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save role');
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            role_id: isEdit ? formData.role_id : 0,
            role_name: formData.role_name,
            description: formData.description,
            is_active: formData.is_active
        };

        mutation.mutate(payload);
    };

    if (isFetching) {
        return <div className="p-6 text-center">Loading role...</div>;
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-500 px-5 py-4 sm:px-8 text-center rounded-t-2xl">
                    <h1 className="text-3xl font-bold text-white">{isEdit ? 'Update Role' : 'Create New Role'}</h1>
                    <p className="mt-1 text-blue-100 text-sm">{isEdit ? 'Modify role information' : 'Add a new role to the system'}</p>
                </div>

                {/* Form Content */}
                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
                        {/* Role Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="role_name"
                                control={control}
                                rules={{ required: 'Role name is required' }}
                                render={({ field }) => (
                                    <InputField {...field} error={!!errors.role_name} placeholder="Enter role name" className="mt-1" />
                                )}
                            />
                            {errors.role_name && <p className="mt-1 text-sm text-red-600">{errors.role_name.message}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => <InputField {...field} error={!!errors.description} />}
                            />
                        </div>

                        {/* Status */}
                        <Controller
                            name="is_active"
                            control={control}
                            render={({ field }) => {
                                const options = [
                                    { value: true, label: 'Active' },
                                    { value: false, label: 'Inactive' }
                                ];
                                const selectedOption = options.find((opt) => opt.value === field.value) || null;

                                return (
                                    <div>
                                        <label className="text-sm font-medium">
                                            Status <span className="text-red-500">*</span>
                                        </label>

                                        <ReactSelect
                                            options={options}
                                            value={selectedOption}
                                            onChange={(opt) => field.onChange(opt.value)}
                                            placeholder="Select Status"
                                        />
                                    </div>
                                );
                            }}
                        />

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Button type="button" variant="outlined" onClick={() => navigate('/role')} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                loading={mutation.isPending}
                                disabled={mutation.isPending}
                                className="flex-1"
                            >
                                {isEdit ? 'Update Role' : 'Create Role'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RoleForm;
