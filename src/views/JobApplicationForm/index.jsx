import { JobApplicationFormLayout } from '@/api/InterviewFormApi';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { RotatingLines } from 'react-loader-spinner';
import { useParams } from 'react-router';
import { RiDeleteBinLine } from 'react-icons/ri';
import { CandidateUpsertApi } from '@/api/Candidate';

const JobApplicationForm = () => {
    const params = useParams();
    const ApplicationId = params?.applicationID;

    const { data, isFetching } = useQuery({
        queryKey: ['job-application-form', ApplicationId],
        queryFn: () => JobApplicationFormLayout({ id: ApplicationId }),
        select: (data) => data.data
    });
    const formBuilder = data?.form_json_data || null;
    const InfoSection = formBuilder?.info_section || null;
    const EducationSection = formBuilder?.education || null;
    const EducationFieldBuilder = EducationSection?.fields[0] || null;

    const ExperienceSection = formBuilder?.experience || null;
    const ExperienceFieldBuilder = ExperienceSection?.fields[0] || null;

    const SkillsSection = formBuilder?.skills || null;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control
    } = useForm();

    const mutation = useMutation({
        mutationFn: CandidateUpsertApi
    });

    console.log(mutation);

    const submitFC = (form_data) => {
        const formData = new FormData();
        formData.append('json_form_data.Id', ApplicationId);
        formData.append('json_form_data.InterviewId', data.interview_id);
        formData.append('json_form_data.Name', form_data.applicant_name);
        formData.append('json_form_data.Email', form_data.applicant_email);
        formData.append('json_form_data.Phone_Number', form_data.applicant_phone);
        formData.append('json_form_data.Resume', null);

        form_data.education.forEach((edu, index) => {
            formData.append(`json_form_data.Education[${index}].University_name`, edu.organization_name);
            formData.append(`json_form_data.Education[${index}].Passing_Year`, edu.passing_year);
        });

        form_data.experience.forEach((exp, index) => {
            formData.append(`json_form_data.Experience[${index}].Company_Name`, exp.company_name);
            formData.append(`json_form_data.Experience[${index}].Is_Current_Company`, exp.is_current_company);
            formData.append(`json_form_data.Experience[${index}].Duration`, exp.duration);
        });

        form_data.skills.forEach((skill, index) => {
            formData.append(`json_form_data.Skills[${index}]`, skill);
        });

        mutation.mutateAsync(formData);
    };

    const {
        fields: educationFields,
        append: appendEducationField,
        remove: removeEducationField
    } = useFieldArray({
        name: 'education',
        control
    });

    const {
        fields: experienceFields,
        append: appendExperienceField,
        remove: removeExperienceField
    } = useFieldArray({
        name: 'experience',
        control
    });

    useEffect(() => {
        if (data && EducationSection?.fields) {
            const educationData = EducationSection.fields.map((field) => {
                const emptyField = Object.keys(field).reduce((acc, key) => {
                    acc[key] = '';
                    return acc;
                }, {});
                return emptyField;
            });
            setValue('education', educationData);
        }

        if (data && ExperienceSection?.fields) {
            const experienceData = ExperienceSection.fields.map((field) => {
                const emptyField = Object.keys(field).reduce((acc, key) => {
                    acc[key] = '';
                    return acc;
                }, {});
                return emptyField;
            });
            setValue('experience', experienceData);
        }
    }, [data, EducationSection, ExperienceSection, setValue]);

    if (isFetching) {
        return (
            <div className="h-dvh flex items-center justify-center py-20">
                <RotatingLines
                    visible={true}
                    height="1.5em"
                    width="1.5em"
                    color="currentColor"
                    strokeWidth="5"
                    animationDuration="0.75"
                    ariaLabel="loading-interviewers"
                />
                <span className="ml-3 text-gray-600 font-medium">Please wait...</span>
            </div>
        );
    }

    if (mutation.isSuccess) {
        return (
            <div className="h-dvh flex flex-col items-center justify-center py-20">
                <h2 className="text-2xl font-bold mb-4 text-green-600">Application Submitted Successfully!</h2>
                <p className="text-gray-700">Thank you for applying. We will review your application and get back to you soon.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-5">
            <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit(submitFC)}>
                <div className="text-sm grid gap-0.5">
                    <label className="font-medium">{InfoSection?.applicant_name?.label || 'Name'}</label>
                    <InputField
                        placeholder={InfoSection?.applicant_name?.placeholder || 'Enter your name'}
                        className="w-full p-2 relative"
                        error={errors.applicant_name}
                        {...register('applicant_name')}
                    />
                </div>
                <div className="text-sm grid gap-0.5">
                    <label className="font-medium">{InfoSection?.applicant_email?.label || 'Email'}</label>
                    <InputField
                        placeholder={InfoSection?.applicant_email?.placeholder || 'Enter your email'}
                        className="w-full p-2 relative"
                        error={errors.applicant_email}
                        {...register('applicant_email')}
                    />
                </div>
                <div className="text-sm grid gap-0.5">
                    <label className="font-medium">{InfoSection?.applicant_phone?.label || 'Phone'}</label>
                    <InputField
                        placeholder={InfoSection?.applicant_phone?.placeholder || 'Enter your phone'}
                        className="w-full p-2 relative"
                        error={errors.applicant_phone}
                        {...register('applicant_phone')}
                    />
                </div>

                {EducationSection?.enable && (
                    <div className="text-sm grid gap-3 border border-gray-400 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <label className="font-medium flex-1 text-lg text-gray-500">Education</label>
                            <span
                                className="text-blue-800 font-medium cursor-pointer"
                                onClick={() => {
                                    const emptyField = Object.keys(EducationSection?.fields?.[0]).reduce((acc, key) => {
                                        acc[key] = '';
                                        return acc;
                                    }, {});
                                    appendEducationField(emptyField);
                                }}
                            >
                                Add More
                            </span>
                        </div>
                        {educationFields?.length > 0 && (
                            <div className="divide-y divide-gray-400">
                                {educationFields?.map((education, idx) => (
                                    <div key={education.id} className="flex flex-col gap-2 pb-4 pt-2">
                                        <div className="text-sm grid gap-0.5">
                                            <label className="font-medium my-1">
                                                {EducationFieldBuilder['organization_name'].label || 'Organization Name'}
                                            </label>
                                            <InputField
                                                placeholder={EducationFieldBuilder['organization_name']?.placeholder || 'Enter your phone'}
                                                className="w-full p-2 relative"
                                                error={errors.applicant_phone}
                                                {...register(`education.${idx}.organization_name`)}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="text-sm flex-1 grid gap-0.5">
                                                <label className="font-medium">
                                                    {EducationFieldBuilder['passing_year'].label || 'Passing Year'}
                                                </label>
                                                <InputField
                                                    placeholder={EducationFieldBuilder['passing_year']?.placeholder || 'Enter your phone'}
                                                    className="w-full p-2 relative"
                                                    error={errors.applicant_phone}
                                                    {...register(`education.${idx}.passing_year`)}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="self-end text-red-600 font-medium px-2 py-3"
                                                onClick={() => removeEducationField(idx)}
                                            >
                                                <RiDeleteBinLine size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {ExperienceSection?.enable && (
                    <div className="text-sm grid gap-3 border border-gray-400 rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <label className="font-medium flex-1 text-lg text-gray-500">Experience</label>
                            <span
                                className="text-blue-800 font-medium cursor-pointer"
                                onClick={() => {
                                    const emptyField = Object.keys(ExperienceSection?.fields?.[0]).reduce((acc, key) => {
                                        acc[key] = '';
                                        return acc;
                                    }, {});
                                    appendExperienceField(emptyField);
                                }}
                            >
                                Add More
                            </span>
                        </div>
                        {experienceFields?.length > 0 && (
                            <div className="divide-y divide-gray-400">
                                {experienceFields?.map((experience, idx) => (
                                    <div key={experience.id} className="flex flex-col gap-2 pb-4 pt-2">
                                        <div className="text-sm grid gap-0.5">
                                            <label className="font-medium my-1">
                                                {ExperienceFieldBuilder['company_name'].label || 'Company Name'}
                                            </label>
                                            <InputField
                                                placeholder={ExperienceFieldBuilder['company_name']?.placeholder || 'Company Name'}
                                                className="w-full p-2 relative"
                                                error={errors.applicant_phone}
                                                {...register(`experience.${idx}.company_name`)}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={`experience-is-current-${idx}`}
                                                {...register(`experience.${idx}.is_current_company`)}
                                                className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`experience-is-current-${idx}`}>
                                                {ExperienceFieldBuilder['is_current_company'].label}
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="text-sm flex-1 grid gap-0.5">
                                                <label className="font-medium">
                                                    {ExperienceFieldBuilder['duration'].label || 'Duration'}
                                                </label>
                                                <InputField
                                                    placeholder={ExperienceFieldBuilder['duration']?.placeholder || 'Duration'}
                                                    className="w-full p-2 relative"
                                                    error={errors.applicant_phone}
                                                    {...register(`experience.${idx}.duration`)}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className="self-end text-red-600 font-medium px-2 py-3"
                                                onClick={() => removeExperienceField(idx)}
                                            >
                                                <RiDeleteBinLine size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="text-sm grid gap-2">
                    <label className="font-medium">{SkillsSection?.label || 'Skills'}</label>
                    <div className="grid gap-0.5">
                        {SkillsSection?.options?.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`skill-${index}`}
                                    value={skill}
                                    {...register('skills')}
                                    className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`skill-${index}`}>{skill}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <Button type="submit" disabled={mutation.isLoading} loading={mutation.isLoading}>
                    Submit Application
                </Button>
            </form>
        </div>
    );
};

export default JobApplicationForm;
