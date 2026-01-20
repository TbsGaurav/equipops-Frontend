import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import ReactSelect from 'react-select';
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
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEdit ? 'Update Equipment Failure' : 'Create New Equipment Failure'}
                    </h1>
                    <p className="mt-2 text-gray-500">
                        {isEdit ? 'Modify equipment failure information' : 'Add a new equipment failure to the system'}
                    </p>
                </div>

                <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                    {/* FAILURE TYPE */}
                    <div>
                        <label className="text-sm font-medium">
                            Failure Type <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="failure_type"
                            control={control}
                            rules={{
                                required: 'Failure Type is required',
                                maxLength: {
                                    value: 50,
                                    message: 'Failure Type cannot exceed 50 characters'
                                }
                            }}
                            render={({ field }) => <InputField {...field} error={!!errors.failure_type} placeholder="Enter Failure Type" />}
                        />
                        {errors.failure_type && <p className="text-xs text-red-500">{errors.failure_type.message}</p>}
                    </div>
                    {/* FAILURE DATE */}
                    <div>
                        <label className="text-sm font-medium">
                            Failure Date <span className="text-red-500"></span>
                        </label>
                        <Controller
                            name="failure_date"
                            control={control}
                            render={({ field }) => <InputField type="datetime-local" {...field} placeholder="Enter Failure Date" />}
                        />
                    </div>
                    {/* Organization Dropdown */}
                    <Controller
                        name="organization_id"
                        control={control}
                        rules={{ required: 'Organization is required' }}
                        render={({ field }) => {
                            const options = organizations.map((org) => ({
                                value: org.organization_id,
                                label: org.name
                            }));

                            return (
                                <div>
                                    <label className="text-sm font-medium">
                                        Organization <span className="text-red-500">*</span>
                                    </label>

                                    <ReactSelect
                                        options={options}
                                        value={options.find((opt) => opt.value === field.value) || null}
                                        onChange={(selected) => field.onChange(selected?.value)}
                                        onBlur={field.onBlur}
                                        isLoading={orgLoading}
                                        placeholder="Select organization"
                                        maxMenuHeight={180}
                                        menuPlacement="auto"
                                        closeMenuOnScroll={true}
                                        menuShouldScrollIntoView={false}
                                    />

                                    {errors.organization_id && <p className="text-xs text-red-500">{errors.organization_id.message}</p>}
                                </div>
                            );
                        }}
                    />

                    {/* Equipment Dropdown */}
                    <Controller
                        name="equipment_id"
                        control={control}
                        rules={{ required: 'Equipment is required' }}
                        render={({ field }) => {
                            const options = equipments.map((eq) => ({
                                value: eq.equipment_id,
                                label: eq.name
                            }));

                            return (
                                <div>
                                    <label className="text-sm font-medium">
                                        Equipment <span className="text-red-500">*</span>
                                    </label>

                                    <ReactSelect
                                        options={options}
                                        value={options.find((opt) => opt.value === field.value) || null}
                                        onChange={(selected) => field.onChange(selected?.value)}
                                        onBlur={field.onBlur}
                                        isLoading={eqLoading}
                                        placeholder="Select Equipment"
                                        maxMenuHeight={180}
                                        menuPlacement="auto"
                                        closeMenuOnScroll={true}
                                        menuShouldScrollIntoView={false}
                                    />

                                    {errors.equipment_id && <p className="text-xs text-red-500">{errors.equipment_id.message}</p>}
                                </div>
                            );
                        }}
                    />

                    {/* Equipment Subpart Dropdown */}
                    <Controller
                        name="subpart_id"
                        control={control}
                        rules={{ required: 'Equipment Subpart is required' }}
                        render={({ field }) => {
                            const options = equipmentsubparts.map((sub) => ({
                                value: sub.subpart_id,
                                label: sub.name
                            }));

                            return (
                                <div>
                                    <label className="text-sm font-medium">
                                        Equipment Subpart <span className="text-red-500">*</span>
                                    </label>

                                    <ReactSelect
                                        options={options}
                                        value={options.find((opt) => opt.value === field.value) || null}
                                        onChange={(selected) => field.onChange(selected?.value)}
                                        onBlur={field.onBlur}
                                        isLoading={eqsubLoading}
                                        placeholder="Select Subpart"
                                        maxMenuHeight={180}
                                        menuPlacement="auto"
                                        closeMenuOnScroll={true}
                                        menuShouldScrollIntoView={false}
                                    />

                                    {errors.subpart_id && <p className="text-xs text-red-500">{errors.subpart_id.message}</p>}
                                </div>
                            );
                        }}
                    />

                    {/* DOWNTIME */}
                    <div>
                        <label className="text-sm font-medium">Downtime (minutes)</label>
                        <Controller
                            name="downtime_minutes"
                            control={control}
                            render={({ field }) => <InputField type="number" {...field} />}
                        />
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
        </div>
    );
};

export default EquipmentFailureForm;
