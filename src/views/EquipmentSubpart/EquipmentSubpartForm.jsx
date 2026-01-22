import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import Toast from '@/utils/toast';
import ReactSelect from 'react-select';
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

    const subparts = eqData?.data || [];

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
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-indigo-500 px-5 py-4 sm:px-8 text-center rounded-t-2xl">
                    <h1 className="text-3xl font-bold text-white">{isEdit ? 'Update Equipment Subpart' : 'Create New Subpart'}</h1>
                    <p className="mt-1 text-blue-100 text-sm">
                        {isEdit ? 'Modify equipment subpart information' : 'Add a new equipment subpart to the system'}
                    </p>
                </div>

                {/* Form Content */}
                <div className="p-8 md:p-10">
                    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
                        {/* SUBPART NAME */}
                        <div>
                            <label className="text-sm font-medium">
                                Subpart Name <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                name="subpart_name"
                                control={control}
                                rules={{ required: 'Subpart name is required' }}
                                render={({ field }) => (
                                    <InputField {...field} error={!!errors.subpart_name} placeholder="Enter Subpart name" />
                                )}
                            />
                            {errors.subpart_name && <p className="text-xs text-red-500">{errors.subpart_name.message}</p>}
                        </div>

                        {/* Equipment Dropdown */}
                        <Controller
                            name="equipment_id"
                            control={control}
                            rules={{ required: 'Equipment is required' }}
                            render={({ field }) => {
                                const options = subparts.map((eq) => ({
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
                                            closeMenuOnScroll
                                            menuShouldScrollIntoView={false}
                                        />

                                        {errors.equipment_id && <p className="text-xs text-red-500">{errors.equipment_id.message}</p>}
                                    </div>
                                );
                            }}
                        />

                        {/* Status Dropdown */}
                        <Controller
                            name="status"
                            control={control}
                            rules={{ required: 'Status is required' }}
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
                                            onChange={(selected) => field.onChange(selected?.value ?? null)}
                                            onBlur={field.onBlur}
                                            placeholder="Select Status"
                                            isClearable={false}
                                            menuPlacement="auto"
                                            closeMenuOnScroll
                                            menuShouldScrollIntoView={false}
                                        />

                                        {errors.status && <p className="text-xs text-red-500">{errors.status.message}</p>}
                                    </div>
                                );
                            }}
                        />

                        {/* QR Code */}
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
            </div>
        </div>
    );
};

export default EquipmentSubpartForm;
