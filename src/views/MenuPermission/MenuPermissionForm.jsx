import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useMemo } from 'react';
import * as Select from '@radix-ui/react-select';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

import * as yup from 'yup';
import { MasterMenuListApi, MenuByIdApi, MenuUpsertApi } from '@/api/SettingApi';
import Toast from '@/utils/toast';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),

    name: yup.string().trim().required('Subscription Type is required'),

    slug: yup
        .string()
        .trim()
        .required('Slug is required')
        .matches(/^[A-Z_]+$/, 'Slug must contain only uppercase letters and underscores'),
    menu_type_id: yup.string().trim().required('Menu Permission is required')
});

const MenuPermissionForm = ({ onClose, MenuPermissionId }) => {
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        shouldUnregister: false,
        defaultValues: {
            id: MenuPermissionId || null,
            menu_type_id: '',
            slug: '',
            name: ''
        },
        resolver: yupResolver(ValidationSchema)
    });
    const { data: dropdownRes, isFetching: isDropdownLoading } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterMenuListApi,
        select: (res) => res.data
    });
    const menuTypes = useMemo(() => dropdownRes?.menu_Types ?? [], [dropdownRes]);

    const { data, isFetching } = useQuery({
        queryKey: ['menuPermission-by-id', MenuPermissionId],
        queryFn: () => MenuByIdApi({ id: MenuPermissionId }),
        enabled: !!MenuPermissionId,
        select: (res) => res.data
    });
    const menuTypesReady = menuTypes.length > 0;
    useEffect(() => {
        if (!MenuPermissionId || !data?.id || !menuTypesReady) return;

        reset({
            id: data.id,
            name: data.name ?? '',
            slug: data.slug ?? '',
            menu_type_id: data.menu_type_id ?? ''
        });
    }, [data, menuTypesReady, reset, MenuPermissionId]);

    const mutation = useMutation({
        mutationFn: (payload) => MenuUpsertApi(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['menuPermission'],
                exact: false
            });
            Toast.success(MenuPermissionId ? 'MenuPermission updated successfully' : 'MenuPermission created successfully');
            onClose();
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save MenuPermission';

            Toast.error(errorMessage);
        }
    });
    const submitHandler = (data) => {
        mutation.mutate({
            id: data.id,
            name: data.name,
            slug: data.slug,
            menu_type_id: data.menu_type_id
        });
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
                <span className="ml-3 text-gray-600 text-sm">Loading MenuPermission data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6 text-gray-900">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Menu Name <span className="text-red-500">*</span>
                    </label>

                    <Controller name="name" control={control} render={({ field }) => <InputField {...field} error={!!errors.name} />} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Slug <span className="text-red-500">*</span>
                    </label>

                    <Controller name="slug" control={control} render={({ field }) => <InputField {...field} error={!!errors.slug} />} />
                    {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Menu Type <span className="text-red-500">*</span>
                </label>

                <Controller
                    name="menu_type_id"
                    control={control}
                    render={({ field }) => (
                        <Select.Root value={field.value} onValueChange={field.onChange} disabled={isDropdownLoading}>
                            <Select.Trigger
                                className={`w-full px-3 py-2.5 text-sm rounded-lg
            bg-slate-50/60 flex justify-between items-center outline-none
            ${errors.menu_type_id ? 'border border-red-500' : 'border border-slate-300'}
            focus:ring-2 focus:ring-indigo-400`}
                            >
                                <Select.Value placeholder={isDropdownLoading ? 'Loading...' : 'Select Menu Type'} />
                                <Select.Icon>
                                    <FiChevronDown />
                                </Select.Icon>
                            </Select.Trigger>

                            <Select.Portal>
                                <Select.Content
                                    side="bottom"
                                    position="popper"
                                    className="bg-white border border-gray-200 rounded-md shadow-lg
            mt-1 min-w-[var(--radix-select-trigger-width)] z-50"
                                >
                                    <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                        {menuTypes.map((type) => (
                                            <Select.Item
                                                key={type.id}
                                                value={type.id}
                                                className="px-3 py-2 rounded-md cursor-pointer
                  hover:bg-gray-100 flex justify-between"
                                            >
                                                <Select.ItemText>{type.name}</Select.ItemText>
                                                <Select.ItemIndicator>
                                                    <FiCheck />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    )}
                />

                {/* ✅ VALIDATION MESSAGE */}
                {errors.menu_type_id && <p className="text-xs text-red-500 mt-1">{errors.menu_type_id.message}</p>}
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

MenuPermissionForm.propTypes = {
    onClose: PropTypes.func,
    MenuPermissionId: PropTypes.string
};

export default MenuPermissionForm;
