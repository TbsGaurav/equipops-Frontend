import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { FiCheck, FiPlus } from 'react-icons/fi';

import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { EquipmentByIdApi, EquipmentUpsertApi } from '@/api/EquipmentApi';

/* ===== Hardcode (temporary) ===== */
const CATEGORY_LIST = [
    { id: 1, name: 'MRI Machines' },
    { id: 2, name: 'CT Scanners' },
    { id: 3, name: 'X-Ray Machines' },
    { id: 4, name: 'Ventilators' },
    { id: 5, name: 'Ultrasound Machines' }
];

const ORG_MAP = {
    1: 'FTP Solution'
};

const FIXED_ORG_ID = 1;

const EquipmentForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues: {
            equipmentId: 0,
            organizationId: FIXED_ORG_ID,
            categoryId: '',
            name: '',
            type: '',
            location: '',
            qrCode: '',
            purchaseDate: '',
            status: 1
        }
    });

    /* ===== GET BY ID ===== */
    const { data, isFetching } = useQuery({
        queryKey: ['equipment-by-id', id],
        queryFn: () => EquipmentByIdApi(id),
        enabled: !!id,
        select: (res) => res.data
    });

    useEffect(() => {
        if (data) {
            reset({
                equipmentId: data.EquipmentId,
                organizationId: data.OrganizationId ?? FIXED_ORG_ID,
                categoryId: data.CategoryId ? data.CategoryId.toString() : '',
                name: data.Name || '',
                type: data.Type || '',
                location: data.Location || '',
                qrCode: data.QrCode || '',
                purchaseDate: data.PurchaseDate ? data.PurchaseDate.split('T')[0] : '',
                status: Number(data.Status)
            });
        }
    }, [data, reset]);

    /* ===== UPSERT ===== */
    const mutation = useMutation({
        mutationFn: EquipmentUpsertApi,
        onSuccess: () => {
            Toast.success(`Equipment ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['equipments'] });
            navigate('/equipment');
        },
        onError: (err) => {
            const apiErrors = err?.response?.data?.errors || [err?.response?.data?.message] || ['Failed to save equipment'];
            apiErrors.forEach((e) => Toast.error(e));
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            equipmentId: formData.equipmentId || 0,
            organizationId: FIXED_ORG_ID,
            categoryId: Number(formData.categoryId),
            name: formData.name,
            type: formData.type || null,
            qrCode: formData.qrCode || null,
            location: formData.location || null,
            purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
            status: formData.status
        };

        mutation.mutate(payload);
    };

    if (isFetching) return <div className="p-6 text-center">Loading equipment...</div>;

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                        {isEdit ? <FiCheck className="text-indigo-500" /> : <FiPlus className="text-indigo-500" />}
                        {isEdit ? 'Update Equipment' : 'Create Equipment'}
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5"
                >
                    {/* Organization (read-only) */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Organization</label>
                        <InputField value={ORG_MAP[FIXED_ORG_ID]} disabled className="bg-gray-100 cursor-not-allowed" />
                    </div>

                    {/* Category dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="categoryId"
                            control={control}
                            rules={{ required: 'Category is required' }}
                            render={({ field }) => (
                                <>
                                    <select
                                        {...field}
                                        className={`w-full border rounded-lg px-3 py-2 bg-slate-50 outline-none
                      ${errors.categoryId ? 'border-red-500' : 'border-slate-300'}
                      focus:ring-2 focus:ring-indigo-400`}
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORY_LIST.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
                                </>
                            )}
                        />
                    </div>

                    {/* Name & Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Equipment Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Equipment name is required' }}
                                render={({ field }) => (
                                    <>
                                        <InputField {...field} error={!!errors.name} />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                            <Controller name="type" control={control} render={({ field }) => <InputField {...field} />} />
                        </div>
                    </div>

                    {/* Location & QR */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                            <Controller name="location" control={control} render={({ field }) => <InputField {...field} />} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">QR Code</label>
                            <Controller name="qrCode" control={control} render={({ field }) => <InputField {...field} />} />
                        </div>
                    </div>

                    {/* Date & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Purchase Date</label>
                            <Controller
                                name="purchaseDate"
                                control={control}
                                rules={{
                                    validate: (v) => !v || new Date(v) <= new Date() || 'Future date not allowed'
                                }}
                                render={({ field }) => (
                                    <>
                                        <InputField type="date" {...field} error={!!errors.purchaseDate} />
                                        {errors.purchaseDate && <p className="text-xs text-red-500 mt-1">{errors.purchaseDate.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <select
                                        {...field}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-400 outline-none"
                                    >
                                        <option value={1}>Active</option>
                                        <option value={0}>Inactive</option>
                                    </select>
                                )}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/equipment')}
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

export default EquipmentForm;
