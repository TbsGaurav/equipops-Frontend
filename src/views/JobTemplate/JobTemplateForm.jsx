import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as yup from 'yup';
import InputField from '@/utils/components/ui/InputField';
import Button from '@/utils/components/ui/Button';
import { RotatingLines } from 'react-loader-spinner';
import { JobTemplateByIdApi, JobTemplateUpsertApi, EmploymentTypeListApi } from '@/api/JobTemplateApi';
import toast from 'react-hot-toast';
/* ===================== VALIDATION ===================== */
const ValidationSchema = yup.object({
    id: yup.mixed().nullable(),
    title: yup.string().required('Title is required'),
    employmentType: yup.string().required('Employment type is required'),
    responsibilities: yup.array().of(yup.string().required('Responsibility is required')).min(1),
    requirements: yup.array().of(yup.string().required('Requirement is required')).min(1)
});

/* ===================== COMPONENT ===================== */
const JobTemplateForm = ({ onClose, jobTemplateId }) => {
    const queryClient = useQueryClient();

    /* ===================== FORM ===================== */
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            id: jobTemplateId || null,
            title: '',
            subtitle: '',
            department: '',
            location: '',
            employmentType: '',
            experienceMin: '',
            experienceMax: '',
            skills: '',
            responsibilities: [''],
            requirements: [''],
            benefits: '',
            notes: ''
        },
        resolver: yupResolver(ValidationSchema)
    });

    /* ===================== FIELD ARRAYS ===================== */
    const {
        fields: responsibilityFields,
        append: addResponsibility,
        remove: removeResponsibility
    } = useFieldArray({ control, name: 'responsibilities' });

    const {
        fields: requirementFields,
        append: addRequirement,
        remove: removeRequirement
    } = useFieldArray({ control, name: 'requirements' });

    /* ===================== QUERIES ===================== */
    const { data: employmentTypes } = useQuery({
        queryKey: ['employment-types'],
        queryFn: EmploymentTypeListApi,
        select: (res) => res.data
    });

    const { data: jobData, isFetching } = useQuery({
        queryKey: ['job-template-by-id', jobTemplateId],
        queryFn: () => JobTemplateByIdApi({ id: jobTemplateId }),
        enabled: !!jobTemplateId,
        select: (res) => res.data
    });

    /* ===================== EDIT MODE ===================== */
    useEffect(() => {
        console.log('jobData', jobData);
        if (jobData) {
            reset({
                id: jobData?.template?.id ?? null,
                title: jobData?.template?.title ?? '',
                subtitle: jobData?.template?.subTitle ?? '',
                department: jobData?.template?.department ?? '',
                location: jobData?.template?.location ?? '',
                employmentType: jobData?.template?.employmentTypeId ?? '',
                experienceMin: jobData?.template?.experienceMin ?? '',
                experienceMax: jobData?.template?.experienceMax ?? '',
                salaryMin: jobData?.template?.salaryMin ?? '',
                salaryMax: jobData?.template?.salaryMax ?? '',
                skills: jobData?.template?.skills ?? '',
                benefits: jobData?.template?.benefits ?? '',
                notes: jobData?.template?.notes ?? '',
                responsibilities: jobData?.template?.responsibilities?.length ? jobData?.template?.responsibilities : [''],
                requirements: jobData?.template?.requirements?.length ? jobData?.template?.requirements : ['']
            });
        }
    }, [jobData, reset]);

    /* ===================== MUTATION ===================== */
    const mutation = useMutation({
        mutationFn: JobTemplateUpsertApi,
        onSuccess: (res) => {
            toast.success(res.message || 'Job Template created successfully');
            queryClient.invalidateQueries({ queryKey: ['jobTemplates-list'] });
            onClose();
        }
    });

    const submitHandler = (formData) => {
        mutation.mutate(formData);
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
                <span className="ml-3 text-gray-600 text-sm">Loading job template data...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-6 text-gray-900">
            <div className="space-y-4">
                {/* Row 1: Title & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="title"
                            control={control}
                            render={({ field }) => (
                                <InputField {...field} placeholder="e.g. Senior Software Engineer" error={!!errors.title} />
                            )}
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Sub Title</label>
                        <Controller
                            name="subtitle"
                            control={control}
                            render={({ field }) => (
                                <InputField {...field} placeholder="e.g. Backend Development Role" error={!!errors.subtitle} />
                            )}
                        />
                    </div>
                </div>

                {/* Row 2: Department & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                        <Controller
                            name="department"
                            control={control}
                            render={({ field }) => <InputField {...field} placeholder="e.g. Engineering" error={!!errors.department} />}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Location</label>
                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <InputField {...field} placeholder="e.g. Bangalore / Remote" error={!!errors.location} />
                            )}
                        />
                    </div>
                </div>

                {/* Row 3: Employment Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Employment Type <span className="text-red-500">*</span>
                        </label>

                        <Controller
                            name="employmentType"
                            control={control}
                            render={({ field }) => (
                                <select {...field} className="fl-input p-2 text-base">
                                    <option value="">Select</option>
                                    {employmentTypes?.map((e) => (
                                        <option key={e.value} value={e.value}>
                                            {e.text}
                                        </option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>

                    {errors.employmentType && <p className="text-xs text-red-500 mt-1">{errors.employmentType.message}</p>}
                </div>

                {/* Row 4: Experience */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Experience Min</label>
                        <Controller
                            name="experienceMin"
                            control={control}
                            render={({ field }) => (
                                <InputField type="number" {...field} placeholder="e.g. 0" error={!!errors.experienceMin} />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Experience Max</label>
                        <Controller
                            name="experienceMax"
                            control={control}
                            render={({ field }) => (
                                <InputField type="number" {...field} placeholder="e.g. 10" error={!!errors.experienceMax} />
                            )}
                        />
                    </div>
                </div>

                {/* Row 5: Salary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Salary Min</label>
                        <Controller
                            name="salaryMin"
                            control={control}
                            render={({ field }) => (
                                <InputField type="number" {...field} placeholder="e.g. 600000" error={!!errors.salaryMin} />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Salary Max</label>
                        <Controller
                            name="salaryMax"
                            control={control}
                            render={({ field }) => (
                                <InputField type="number" {...field} placeholder="e.g. 1200000" error={!!errors.salaryMax} />
                            )}
                        />
                    </div>
                </div>

                {/* Row 6: Skills */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Skills</label>
                    <Controller
                        name="skills"
                        control={control}
                        render={({ field }) => (
                            <textarea {...field} rows={2} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                        )}
                    />
                </div>

                {/* Row 7: Responsibilities */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Responsibilities
                            <button
                                type="button"
                                onClick={() => addResponsibility('')}
                                className="mt-2 text-sm text-primary-dark font-semibold float-right"
                            >
                                + Add Responsibility
                            </button>
                        </label>

                        <div className="space-y-2">
                            {responsibilityFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <InputField
                                        {...register(`responsibilities.${index}`)}
                                        placeholder={`Responsibility ${index + 1}`}
                                        className="flex-1"
                                        error={!!errors.responsibilities?.[index]}
                                    />

                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeResponsibility(index)}
                                            className="p-2 rounded-md border border-gray-300 hover:bg-red-100 text-red-500"
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 8: Requirements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            Requirements
                            <button
                                type="button"
                                onClick={() => addRequirement('')}
                                className="mt-2 text-sm text-primary-dark font-semibold float-right"
                            >
                                + Add Requirement
                            </button>
                        </label>

                        <div className="space-y-2">
                            {requirementFields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <InputField
                                        {...register(`requirements.${index}`)}
                                        placeholder={`Requirement ${index + 1}`}
                                        className="flex-1"
                                        error={!!errors.requirements?.[index]}
                                    />

                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRequirement(index)}
                                            className="p-2 rounded-md border border-gray-300 hover:bg-red-100 text-red-500"
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Row 9: Benefits */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Benefits</label>
                    <Controller
                        name="benefits"
                        control={control}
                        render={({ field }) => (
                            <textarea {...field} rows={2} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                        )}
                    />
                </div>

                {/* Row 10: Notes */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
                    <Controller
                        name="notes"
                        control={control}
                        render={({ field }) => (
                            <textarea {...field} rows={2} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                        )}
                    />
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

JobTemplateForm.propTypes = {
    onClose: PropTypes.func,
    jobTemplateId: PropTypes.string
};

export default JobTemplateForm;
