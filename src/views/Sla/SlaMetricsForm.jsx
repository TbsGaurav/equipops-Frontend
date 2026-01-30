import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import { FiCheck, FiPlus } from 'react-icons/fi';

import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';

import { SlaMetricsByIdApi, SlaMetricsUpsertApi } from '@/api/SlaMetricsApi';
import { Organization1DropdownApi, EquipmentDropdownApi, EquipmentSubpartDropdownApi } from '@/api/DropdownApi';

const SlaMetricsForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    /* ===== DROPDOWNS ===== */
    const { data: orgData = [] } = useQuery({
        queryKey: ['organization-dropdown'],
        queryFn: async () => (await Organization1DropdownApi())?.data || []
    });

    const { data: equipmentData = [] } = useQuery({
        queryKey: ['equipment-dropdown'],
        queryFn: async () => (await EquipmentDropdownApi())?.data || []
    });

    const { data: equipmentSubpartData = [] } = useQuery({
        queryKey: ['equipment-subpart-dropdown'],
        queryFn: async () => (await EquipmentSubpartDropdownApi())?.data || []
    });

    const {
        control,
        handleSubmit,
        reset,
        // watch,
        formState: { errors }
    } = useForm({
        defaultValues: {
            slaId: 0,
            organizationId: '',
            equipmentId: '',
            subpartId: '',
            periodStart: '',
            periodEnd: '',
            downtimeMinutes: '',
            slaBreached: false
        }
    });

    /* ===== WATCH EQUIPMENT FOR SUBPART FILTER ===== */
    // const selectedEquipmentId = watch('equipmentId');

    // const filteredSubparts = useMemo(() => {
    //     if (!selectedEquipmentId) return [];
    //     return equipmentSubpartData.filter((s) => String(s.equipment_id) === String(selectedEquipmentId));
    // }, [equipmentSubpartData, selectedEquipmentId]);

    /* ===== GET BY ID (EDIT) ===== */
    const { data, isFetching } = useQuery({
        queryKey: ['sla-by-id', id],
        queryFn: () => SlaMetricsByIdApi(id),
        enabled: !!id,
        select: (res) => res.data
    });

    useEffect(() => {
        if (data) {
            reset({
                slaId: data.sla_id,
                organizationId: data.organization_id?.toString(),
                equipmentId: data.equipment_id?.toString(),
                subpartId: data.subpart_id?.toString() || '',
                periodStart: data.period_start,
                periodEnd: data.period_end,
                downtimeMinutes: data.downtime_minutes,
                slaBreached: data.sla_breached
            });
        }
    }, [data, reset]);

    /* ===== UPSERT ===== */
    const mutation = useMutation({
        mutationFn: SlaMetricsUpsertApi,
        onSuccess: () => {
            Toast.success(`SLA ${isEdit ? 'updated' : 'created'} successfully`);
            queryClient.invalidateQueries({ queryKey: ['sla-metrics'] });
            navigate('/sla-metrics'); // ✅ fixed
        },
        onError: (err) => {
            const errors = err?.response?.data?.errors || [err?.response?.data?.message] || ['Failed to save SLA'];

            errors.forEach((e) => Toast.error(e));
        }
    });

    const submitHandler = (formData) => {
        const payload = {
            slaId: formData.slaId || 0,
            organizationId: Number(formData.organizationId),
            equipmentId: Number(formData.equipmentId),
            subpartId: Number(formData.subpartId || 0),
            periodStart: new Date(formData.periodStart).toISOString(),
            periodEnd: new Date(formData.periodEnd).toISOString(),
            downtimeMinutes: Number(formData.downtimeMinutes),

            // ✅ FIX HERE
            slaBreached: formData.slaBreached === true || formData.slaBreached === 'true'
        };

        mutation.mutate(payload);
    };

    if (isFetching) {
        return <div className="p-6 text-center">Loading SLA...</div>;
    }

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                        {isEdit ? <FiCheck className="text-indigo-500" /> : <FiPlus className="text-indigo-500" />}
                        {isEdit ? 'Update SLA Metrics' : 'Create SLA Metrics'}
                    </h1>
                </div>

                <form
                    onSubmit={handleSubmit(submitHandler)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5"
                >
                    {/* Organization */}
                    <Controller
                        name="organizationId"
                        control={control}
                        rules={{ required: 'Organization is required' }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Organization *</label>
                                <select {...field} className="w-full border rounded-lg px-3 py-2 bg-slate-50">
                                    <option value="">Select organization</option>
                                    {orgData.map((o) => (
                                        <option key={o.organization_id} value={o.organization_id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.organizationId && <p className="text-xs text-red-500 mt-1">{errors.organizationId.message}</p>}
                            </div>
                        )}
                    />

                    {/* Equipment */}
                    <Controller
                        name="equipmentId"
                        control={control}
                        rules={{ required: 'Equipment is required' }}
                        render={({ field }) => (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Equipment *</label>
                                <select {...field} className="w-full border rounded-lg px-3 py-2 bg-slate-50">
                                    <option value="">Select equipment</option>
                                    {equipmentData.map((e) => (
                                        <option key={e.equipment_id} value={e.equipment_id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.equipmentId && <p className="text-xs text-red-500 mt-1">{errors.equipmentId.message}</p>}
                            </div>
                        )}
                    />

                    {/* 🔥 SUBPART (NEW) */}
                    <Controller
                        name="subpartId"
                        control={control}
                        render={({ field }) => (
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Subpart</label>
                                <select
                                    {...field}
                                    //disabled={!selectedEquipmentId}
                                    className="w-full border rounded-lg px-3 py-2 bg-slate-50"
                                >
                                    <option value="">Select subpart</option>
                                    {equipmentSubpartData.map((s) => (
                                        <option key={s.subpart_id} value={s.subpart_id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    />

                    {/* Period */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Controller
                            name="periodStart"
                            control={control}
                            rules={{ required: 'Start date required' }}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Period Start</label>
                                    <InputField type="date" {...field} />
                                </div>
                            )}
                        />

                        <Controller
                            name="periodEnd"
                            control={control}
                            rules={{ required: 'End date required' }}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Period End</label>
                                    <InputField type="date" {...field} />
                                </div>
                            )}
                        />
                    </div>

                    {/* Downtime & Breach */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Controller
                            name="downtimeMinutes"
                            control={control}
                            rules={{ required: 'Downtime required' }}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Downtime (minutes)</label>
                                    <InputField type="number" {...field} />
                                </div>
                            )}
                        />

                        <Controller
                            name="slaBreached"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">SLA Breached</label>
                                    <select {...field} className="w-full border rounded-lg px-3 py-2 bg-slate-50">
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                </div>
                            )}
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/sla-metrics')}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300"
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

export default SlaMetricsForm;
