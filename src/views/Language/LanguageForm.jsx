import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller } from 'react-hook-form';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LanguageByIdApi, LanguageUpsertApi } from '@/api/SettingApi';
import { RotatingLines } from 'react-loader-spinner';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import * as Select from '@radix-ui/react-select';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),
    name: yup.string().trim().required('Language name is required'),
    code: yup.string().trim().required('Language code is required'),
    direction: yup.string().oneOf(['ltr', 'rtl']).required('Direction is required')
});

const LanguageForm = ({ onClose, LanguageId }) => {
    const queryClient = useQueryClient();
    const [openDirection, setOpenDirection] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            id: LanguageId || null,
            name: '',
            code: '',
            direction: 'ltr'
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { data, isFetching } = useQuery({
        queryKey: ['language-by-id', LanguageId],
        queryFn: () => LanguageByIdApi({ id: LanguageId }),
        enabled: !!LanguageId,
        select: (res) => res.data
    });

    useEffect(() => {
        if (data) {
            reset({
                id: data.id ?? null,
                name: data.name ?? '',
                code: data.code ?? '',
                direction: data.direction ?? 'ltr'
            });
        }
    }, [data, reset]);

    const mutation = useMutation({
        mutationFn: (data) => LanguageUpsertApi(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['languages'], exact: false });
        }
    });

    const submitHandler = (data) => {
        mutation.mutateAsync(data).then(() => onClose());
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
                <span className="ml-3 text-gray-600 text-sm">Loading language data...</span>
            </div>
        );
    }

    const Directions = [
        { label: 'Left to Right (LTR)', value: 'ltr' },
        { label: 'Right to Left (RTL)', value: 'rtl' }
    ];

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6 text-gray-900">
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1">
                            Language Name <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <InputField {...field} placeholder="e.g. Sunrise Multispeciality Hospital" error={!!errors.name} />
                            )}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="code" className="block text-xs font-semibold text-gray-600 mb-1">
                            Language Code <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => <InputField {...field} placeholder="e.g. EN" error={!!errors.code} />}
                        />
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Language Direction <span className="text-red-500">*</span>
                        </label>

                        <Controller
                            name="direction"
                            control={control}
                            rules={{ required: 'Direction is required' }}
                            render={({ field }) => (
                                <Select.Root
                                    value={field.value}
                                    open={openDirection}
                                    onOpenChange={setOpenDirection}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        setOpenDirection(false);
                                    }}
                                >
                                    <Select.Trigger
                                        className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg 
                               bg-slate-50/60 flex justify-between items-center
                               focus:ring-2 focus:ring-indigo-400 outline-none"
                                    >
                                        <Select.Value placeholder="Select direction" />
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
                                                {Directions.map((dir) => (
                                                    <Select.Item
                                                        key={dir.value}
                                                        value={dir.value}
                                                        className="px-3 py-2 rounded-md cursor-pointer 
                                               hover:bg-gray-100 flex justify-between"
                                                    >
                                                        <Select.ItemText>{dir.label}</Select.ItemText>
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
                        {errors.direction && <p className="text-xs text-red-500">{errors.direction.message}</p>}
                    </div>
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

LanguageForm.propTypes = {
    onClose: PropTypes.func,
    LanguageId: PropTypes.string
};

export default LanguageForm;
