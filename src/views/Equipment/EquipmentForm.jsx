import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';   
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';

import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';

import { EquipmentByIdApi, EquipmentUpsertApi } from '@/api/EquipmentApi';
// import { EquipmentValidationSchema } from './EquipmentValidationSchema';

const EquipmentForm = () => {
    const { equipmentId } = useParams();
    const isEdit = Boolean(equipmentId);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        // resolver: yupResolver(EquipmentValidationSchema),
        defaultValues: {
            equipmentId: null,
            name: '',
            type: '',
            location: '',
            qrCode: '',
            purchaseDate: null,
            status: 1
        }
    });

    /* ===================== GET BY ID (EDIT MODE) ===================== */
    const { data, isFetching } = useQuery({
        queryKey: ['equipment-by-id', equipmentId],
        queryFn: () => EquipmentByIdApi({ equipmentId }),
        enabled: isEdit,
        select: (res) => res.data.data
    });

    useEffect(() => {
        if (data) {
            reset({
                equipmentId: data.equipmentId,
                name: data.name,
                type: data.type ?? '',
                location: data.location ?? '',
                qrCode: data.qrCode ?? '',
                purchaseDate: data.purchaseDate ?? null,
                status: data.status
            });
        }
    }, [data, reset]);

    /* ===================== UPSERT ===================== */
    const mutation = useMutation({
        mutationFn: EquipmentUpsertApi,
        onSuccess: () => {
            Toast.success(`Equipment ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['equipments'] });
            navigate('/equipment');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save equipment');
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            equipmentId: formData.equipmentId,
            name: formData.name,
            type: formData.type || null,
            location: formData.location || null,
            qrCode: formData.qrCode || null,
            purchaseDate: formData.purchaseDate || null,
            status: formData.status
        };

        mutation.mutate(payload);
    };

    if (isFetching) {
        return <div className="p-6 text-center">Loading equipment...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Update Equipment' : 'Create Equipment'}</h1>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="text-sm font-medium">Equipment Name *</label>
                    <Controller name="name" control={control} render={({ field }) => <InputField {...field} error={!!errors.name} />} />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* Type */}
                <div>
                    <label className="text-sm font-medium">Type</label>
                    <Controller name="type" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* Location */}
                <div>
                    <label className="text-sm font-medium">Location</label>
                    <Controller name="location" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* QR Code */}
                <div>
                    <label className="text-sm font-medium">QR Code</label>
                    <Controller name="qrCode" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* Purchase Date */}
                <div>
                    <label className="text-sm font-medium">Purchase Date</label>
                    <Controller name="purchaseDate" control={control} render={({ field }) => <InputField type="date" {...field} />} />
                </div>

                {/* Status */}
                <div>
                    <label className="text-sm font-medium">Status</label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                            <select {...field} className="w-full border rounded-md px-3 py-2">
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        )}
                    />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outlined" onClick={() => navigate('/equipment')}>
                        Cancel
                    </Button>

                    <Button type="submit" variant="contained" color="primary" loading={mutation.isPending}>
                        {isEdit ? 'Update' : 'Create'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EquipmentForm;
