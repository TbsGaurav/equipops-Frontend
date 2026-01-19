import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { EquipmentSubpartByIdApi, EquipmentSubpartUpsertApi } from '@/api/EquipmentSubpartApi';
import { EquipmentDropdownApi } from '@/api/DropdownApi';

const EquipmentSubpartForm = () => {
    const { subpart_id } = useParams();
    const isEdit = !!subpart_id;

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
            subpart_id: 0,
            equipment_id: '',
            subpart_name: '',
            description: '',
            status: '',
            qr_code: ''
        }
    });

    /* ===================== Equipment DROPDOWN ===================== */
    const { data: eqData, isLoading: eqLoading } = useQuery({
        queryKey: ['equipment-dropdown'],
        queryFn: async () => {
            const res = await EquipmentDropdownApi();
            console.log('Equipment API Response:', res);
            return res;
        }
    });

    const equipments = eqData?.data || [];

    /* ================= GET BY ID ================= */
    const { data, isFetching } = useQuery({
        queryKey: ['equipment-subpart-by-id', subpart_id],
        queryFn: () => EquipmentSubpartByIdApi(subpart_id),
        enabled: isEdit
    });

    useEffect(() => {
        const subpart = data?.value?.data;

        if (subpart) {
            reset({
                subpart_id: subpart.subpart_id,
                equipment_id: subpart.equipment_id,
                subpart_name: subpart.subpart_name ?? '',
                description: subpart.description ?? '',
                status: subpart.status ? 'true' : 'false',
                qr_code: subpart.qr_code ?? ''
            });
        }
    }, [data, reset]);

    /* ================= UPSERT ================= */
    const mutation = useMutation({
        mutationFn: EquipmentSubpartUpsertApi,
        onSuccess: () => {
            Toast.success(`Subpart ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['equipment-subparts'] });
            navigate('/equipmentsubpart');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save subpart');
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            subpart_id: isEdit ? Number(formData.subpart_id) : 0,
            equipment_id: Number(formData.equipment_id),
            subpart_name: formData.subpart_name,
            description: formData.description,
            status: formData.status === 'true',
            qr_code: formData.qr_code
        };

        mutation.mutate(payload);
    };

    /* ================= LOADING ================= */
    if (isFetching) {
        return <div className="p-6 text-center">Loading subpart...</div>;
    }

    /* ================= RENDER ================= */
    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Equipment Subpart' : 'Create Equipment Subpart'}</h1>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                {/* SUBPART NAME */}
                <div>
                    <label className="text-sm font-medium">
                        Subpart Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="subpart_name"
                        control={control}
                        rules={{
                            required: 'Subpart name is required'
                        }}
                        render={({ field }) => <InputField {...field} error={!!errors.subpart_name} placeholder="Enter Subpart name" />}
                    />
                    {errors.subpart_name && <p className="text-xs text-red-500">{errors.subpart_name.message}</p>}
                </div>

                {/* Equipment Dropdown */}
                <Controller
                    name="equipment_id"
                    control={control}
                    rules={{ required: 'Equipment is required' }}
                    render={({ field }) => (
                        <div>
                            <label className="text-sm font-medium">
                                Equipment <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={eqLoading}
                                className={`w-full border rounded-md px-3 py-2 ${
                                    errors.equipment_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Select Equipment</option>
                                {equipments.map((equ) => (
                                    <option key={equ.equipment_id} value={String(equ.equipment_id)}>
                                        {equ.name}
                                    </option>
                                ))}
                            </select>
                            {errors.equipment_id && <p className="text-xs text-red-500">{errors.equipment_id.message}</p>}
                        </div>
                    )}
                />

                {/* DESCRIPTION */}
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <Controller name="description" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* STATUS */}
                <div>
                    <label className="text-sm font-medium">
                        Status <span className="text-red-500">*</span>
                    </label>

                    <Controller
                        name="status"
                        control={control}
                        rules={{ required: 'Status is required' }}
                        render={({ field }) => (
                            <select
                                {...field}
                                className={`w-full border rounded-md px-3 py-2 ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
                            >
                                <option value="">Select Status</option>
                                <option value="true">Active</option>
                                <option value="false">Inactive</option>
                            </select>
                        )}
                    />

                    {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                </div>

                {/* QR CODE */}
                <div>
                    <label className="text-sm font-medium">QR Code</label>
                    <Controller name="qr_code" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outlined" onClick={() => navigate('/EquipmentSubpart')}>
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

export default EquipmentSubpartForm;
