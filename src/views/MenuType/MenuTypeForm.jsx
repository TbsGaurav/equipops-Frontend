import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';
import { MenuTypeByIdApi, MenuTypeUpsertApi } from '@/api/SettingApi';
import Toast from '@/utils/toast';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),
    name: yup.string().trim().required('Name is required')
});

const MenuTypeForm = ({ onClose, MenuTypeId }) => {
    const queryClient = useQueryClient();
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            id: MenuTypeId || null,
            name: ''
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { data, isFetching } = useQuery({
        queryKey: ['menuType-by-id', MenuTypeId],
        queryFn: () => MenuTypeByIdApi({ id: MenuTypeId }),
        enabled: !!MenuTypeId,
        select: (res) => res.data
    });

    useEffect(() => {
        if (!MenuTypeId || !data?.id) return;

        reset({
            id: data.id,
            name: data.name ?? ''
        });
    }, [data, reset, MenuTypeId]);

    const mutation = useMutation({
        mutationFn: (data) => MenuTypeUpsertApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['menuType'],
                exact: false
            });
            Toast.success(MenuTypeId ? 'MenuType updated successfully' : 'MenuType created successfully');
            onClose();
        },
        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to save MenuType';

            Toast.error(errorMessage);
        }
    });

    const submitHandler = (data) => {
        mutation.mutate(data);
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
                <span className="ml-3 text-gray-600 text-sm">Loading MenuType data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6 text-gray-900">
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Name <span className="text-red-500">*</span>
                    </label>

                    <Controller
                        name="name"
                        control={control}
                        render={({ field }) => <InputField {...field} placeholder="e.g. Dashboard Menu" error={!!errors.name} />}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
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

MenuTypeForm.propTypes = {
    onClose: PropTypes.func,
    MenuTypeId: PropTypes.string
};

export default MenuTypeForm;
