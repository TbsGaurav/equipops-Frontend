import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import { EquipmentFailureByIdApi, EquipmentFailureUpsertApi } from '@/api/EquipmentFailureApi';
import { EquipmentDropdownApi, EquipmentSubpartDropdownApi, Organization1DropdownApi } from '@/api/DropdownApi';

const EquipmentFailureForm = () => {
    const { failure_id } = useParams();
    const isEdit = !!failure_id;

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
            failure_id: null,
            organization_id: null,
            equipment_id: null,
            subpart_id: null,
            failure_date: '',
            failure_type: '',
            description: '',
            downtime_minutes: 0
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

    /* ===================== EquipmentSubpart DROPDOWN ===================== */
    const { data: eqsubData, isLoading: eqsubLoading } = useQuery({
        queryKey: ['equipmentsubpart-dropdown'],
        queryFn: async () => {
            const res = await EquipmentSubpartDropdownApi();
            console.log('Equipment subpart API Response:', res);
            return res;
        }
    });

    const equipmentsubparts = eqsubData?.data || [];

    /* ================= GET BY ID ================= */
    const { data, isFetching } = useQuery({
        queryKey: ['equipment-failure-by-id', failure_id],
        queryFn: () => EquipmentFailureByIdApi(failure_id),
        enabled: !!failure_id
    });

    useEffect(() => {
        const failure = data?.value?.data;

        if (failure) {
            reset({
                failure_id: failure.failure_id,
                organization_id: failure.organization_id,
                equipment_id: failure.equipment_id,
                subpart_id: failure.subpart_id,
                failure_date: failure.failure_date?.slice(0, 16), // for datetime-local
                failure_type: failure.failure_type ?? '',
                description: failure.description ?? '',
                downtime_minutes: failure.downtime_minutes ?? 0
            });
        }
    }, [data, reset]);

    /* ================= UPSERT ================= */
    const mutation = useMutation({
        mutationFn: EquipmentFailureUpsertApi,
        onSuccess: () => {
            Toast.success(`Equipment failure ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['equipment-failures'] });
            navigate('/EquipmentFailure');
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save failure');
        }
    });

    const submitHandler = (formData) => {
        const failureDateUtc = formData.failure_date ? new Date(formData.failure_date).toISOString() : null;

        const payload = {
            failure_id: formData.failure_id || 0,
            organization_id: Number(formData.organization_id),
            equipment_id: Number(formData.equipment_id),
            subpart_id: Number(formData.subpart_id),
            failure_date: failureDateUtc,
            failure_type: formData.failure_type,
            description: formData.description,
            downtime_minutes: Number(formData.downtime_minutes)
        };

        mutation.mutate(payload);
    };

    /* ================= LOADING ================= */
    if (isFetching) {
        return <div className="p-6 text-center">Loading failure...</div>;
    }

    /* ================= RENDER ================= */
    return (
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Equipment Failure' : 'Create Equipment Failure'}</h1>

            <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                {/* FAILURE TYPE */}
                <div>
                    <label className="text-sm font-medium">Failure Type *</label>
                    <Controller
                        name="failure_type"
                        control={control}
                        rules={{ required: 'Failure type is required' }}
                        render={({ field }) => <InputField {...field} error={!!errors.failure_type} />}
                    />
                </div>

                {/* FAILURE DATE */}
                <div>
                    <label className="text-sm font-medium">Failure Date *</label>
                    <Controller
                        name="failure_date"
                        control={control}
                        rules={{ required: 'Failure date is required' }}
                        render={({ field }) => <InputField type="datetime-local" {...field} />}
                    />
                </div>

                {/* Organization Dropdown */}
                <Controller
                    name="organization_id"
                    control={control}
                    rules={{ required: 'Organization is required' }}
                    render={({ field }) => (
                        <div>
                            <label className="text-sm font-medium">Organization *</label>
                            <select
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={orgLoading}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select organization</option>
                                {organizations.map((org) => (
                                    <option key={org.organization_id} value={String(org.organization_id)}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                            {errors.organization_id && <p className="text-xs text-red-500">{errors.organization_id.message}</p>}
                        </div>
                    )}
                />

                {/* Equipment Dropdown */}
                <Controller
                    name="equipment_id"
                    control={control}
                    rules={{ required: 'Equipment is required' }}
                    render={({ field }) => (
                        <div>
                            <label className="text-sm font-medium">Equipment *</label>
                            <select
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={eqLoading}
                                className="w-full border rounded-md px-3 py-2"
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

                {/* Equipmentsubpart Dropdown */}
                <Controller
                    name="subpart_id"
                    control={control}
                    rules={{ required: 'Equipment is required' }}
                    render={({ field }) => (
                        <div>
                            <label className="text-sm font-medium">Equipment *</label>
                            <select
                                value={field.value}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                disabled={eqsubLoading}
                                className="w-full border rounded-md px-3 py-2"
                            >
                                <option value="">Select EquipmentSubpart</option>
                                {equipmentsubparts.map((equsub) => (
                                    <option key={equsub.subpart_id} value={String(equsub.subpart_id)}>
                                        {equsub.name}
                                    </option>
                                ))}
                            </select>
                            {errors.subpart_id && <p className="text-xs text-red-500">{errors.subpart_id.message}</p>}
                        </div>
                    )}
                />

                {/* DOWNTIME */}
                <div>
                    <label className="text-sm font-medium">Downtime (minutes)</label>
                    <Controller name="downtime_minutes" control={control} render={({ field }) => <InputField type="number" {...field} />} />
                </div>

                {/* DESCRIPTION */}
                <div>
                    <label className="text-sm font-medium">Description</label>
                    <Controller name="description" control={control} render={({ field }) => <InputField {...field} />} />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outlined" onClick={() => navigate('/EquipmentFailure')}>
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

export default EquipmentFailureForm;
