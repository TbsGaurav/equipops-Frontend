import { useRef, useState } from 'react';
import InputField from '@/utils/components/ui/InputField';
import { WiCloudUp } from 'react-icons/wi';
import { Controller, useForm } from 'react-hook-form';
import PropTypes from 'prop-types';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Select from '@radix-ui/react-select';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { cn } from '@/utils/Utils';
import { useMutation } from '@tanstack/react-query';
import { InterviewCreateApi } from '@/api/InterviewApi';
import Button from '@/utils/components/ui/Button';
import { useTranslate } from '@/hooks/useTranslate';
import { GenerateInterviewObjectiveApi } from '@/api/InterviewTypeApi';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

const InterviewDetails = ({ PageAction, data }) => {
    const imageInputRef = useRef();
    const [imagePrev, setImagePrev] = useState('');
    const { t } = useTranslate();

    const ValidationSchema = yup.object().shape({
        name: yup.string().required(t('interview_name_validation_msg')),
        department: yup.string().required(t('select_dept_validation_msg')),
        interviewer: yup.string().required(t('select_interviewer_yup_msg')),
        experience: yup.string().required(t('select_experience_validation_msg')),
        interview_type: yup.string().required(t('select_job_type_validation_msg')),
        work_mode: yup.string().required(t('select_work_mode_validation_msg')),
        objective: yup.string().required(t('objective_yup_msg')),
        no_question: yup.number().typeError(t('number_of_que_yup_msg')).positive(t('positive_num_yup_msg')),
        duration: yup.number().typeError(t('duration_yup_msg')).positive(t('positive_num_yup_msg'))
    });

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        watch,
        formState: { errors },
        control
    } = useForm({
        defaultValues: { name: '', interviewer: '', objective: '', documents: '', no_question: 0, duration: 0 },
        resolver: yupResolver(ValidationSchema)
    });

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || file.length === 0) return;

        if (!allowedTypes.includes(file.type)) {
            // toast.error(t('allowed_file_types_msg'));
        } else {
            setImagePrev(URL.createObjectURL(file));
        }
    };

    const mutation = useMutation({ mutationFn: InterviewCreateApi });
    const SubmitHandler = (data) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('department_Id', data.department);
        formData.append('interviewer_Id', data.interviewer);
        formData.append('interview_Type_Id', data.interview_type);
        formData.append('work_Mode_Id', data.work_mode);
        formData.append('description', data.objective);
        if (data.documents) {
            formData.append('document', data.documents);
        }

        formData.append('experience', data.experience);
        formData.append('no_Of_Question', data.no_question);
        formData.append('duration_Mins', data.duration);

        mutation.mutateAsync(formData).then((res) => {
            const { data: resData } = res;
            PageAction('next', { ...data, id: resData.id });
        });
    };

    const handleGenerateObjective = async () => {
        const values = getValues();

        if (!values.work_mode || !values.interview_type || !values.experience) {
            return;
        }

        const payload = {
            workMode: data?.workModeList?.find((w) => String(w.id) === values.work_mode)?.work_Mode,
            jobType: data?.interviewTypeList?.find((j) => String(j.id) === values.interview_type)?.interview_type,
            experienceYears: parseInt(values.experience, 10),
            objective: values.objective || ''
        };

        try {
            const res = await generateObjectiveMutation.mutateAsync(payload);

            const generatedObjective = res?.data?.jobObjective;

            if (generatedObjective) {
                setValue('objective', generatedObjective, {
                    shouldValidate: true,
                    shouldDirty: true
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateObjectiveMutation = useMutation({
        mutationFn: GenerateInterviewObjectiveApi
    });

    return (
        <form onSubmit={handleSubmit(SubmitHandler)} className="flex flex-col gap-3 text-black">
            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    {t('job_name')} <span className="text-red-500">*</span>
                </label>
                <InputField
                    type="text"
                    placeholder={t('enter_job_name')}
                    className="w-full p-2"
                    error={errors.name}
                    {...register('name')}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    {t('department')}
                    <span className="text-red-500"> *</span>
                </label>
                <Controller
                    name="department"
                    control={control}
                    rules={{ required: t('dept_yup_msg') }}
                    render={({ field }) => (
                        <Select.Root value={field.value ?? ''} onValueChange={field.onChange}>
                            <Select.Trigger
                                className={cn(
                                    `w-full h-10 px-3 text-sm flex items-center justify-between border rounded-md bg-white focus:outline-none focus:ring-0`,
                                    errors.department ? 'border-red-500 text-red-500' : 'border-gray-300'
                                )}
                                aria-label={t('department')}
                            >
                                <Select.Value placeholder={t('select_dept')} />
                                <Select.Icon>
                                    <FiChevronDown />
                                </Select.Icon>
                            </Select.Trigger>

                            <Select.Portal>
                                <Select.Content
                                    side="bottom"
                                    position="popper"
                                    className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)]"
                                >
                                    <Select.Viewport className="p-1">
                                        {data?.departmentList?.map((type) => (
                                            <Select.Item
                                                key={type.id}
                                                value={String(type.id)} // 🔴 must be string
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>{type.name}</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    )}
                />
                {errors.department && <p className="text-sm text-red-500">{errors.department.message}</p>}
            </div>
            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    {t('select_an_interview')} <span className="text-red-500">*</span>
                </label>
                {errors.interviewer && <p className="text-sm text-red-500">{errors.interviewer.message}</p>}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-around">
                    {data?.interviewerList.map((item, index) => (
                        <div className="relative flex-1 flex flex-col gap-2 items-center text-center py-2" key={index}>
                            <img
                                src={item.avatar_url || null}
                                alt=""
                                className={`size-16 bg-indigo-300 rounded-full object-cover object-top cursor-pointer
                                  hover:scale-105 transition-transform duration-200 ease-in-out
                                  ${watch('interviewer') === item.id ? 'ring-2 ring-indigo-500' : ''} 
                                  ${errors.interviewer && !watch('interviewer') ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                                onClick={() => {
                                    setValue('interviewer', item.id);
                                }}
                            />
                            <span className="text-center">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    {t('experience')} <span className="text-red-500">*</span>
                </label>
                <InputField
                    type="text"
                    placeholder={t('enter_experience')}
                    className="w-full p-2"
                    error={errors.experience}
                    {...register('experience')}
                />
                {errors.experience && <p className="text-sm text-red-500">{errors.experience.message}</p>}
            </div>

            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    {t('interview_type')} <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="interview_type"
                    control={control}
                    rules={{ required: t('job_type_validation_msg') }}
                    render={({ field }) => (
                        <Select.Root value={field.value ?? ''} onValueChange={field.onChange}>
                            <Select.Trigger
                                className={cn(
                                    `w-full h-10 px-3 text-sm flex items-center justify-between border rounded-md bg-white
                    focus:outline-none focus:ring-0`,
                                    errors.interview_type ? 'border-red-500 text-red-500' : 'border-gray-300'
                                )}
                                aria-label={t('interview_type')}
                            >
                                <Select.Value placeholder={t('select_job_type')} />
                                <Select.Icon>
                                    <FiChevronDown />
                                </Select.Icon>
                            </Select.Trigger>

                            <Select.Portal>
                                <Select.Content
                                    side="bottom"
                                    position="popper"
                                    className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)]"
                                >
                                    <Select.Viewport className="p-1">
                                        {data?.interviewTypeList.map((type) => (
                                            <Select.Item
                                                key={type.id}
                                                value={String(type.id)} // 🔴 must be string
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>{type.interview_type}</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    )}
                />
                {errors.interview_type && <p className="text-sm text-red-500">{errors.interview_type.message}</p>}
            </div>

            <div className="gap-1 flex flex-col">
                <label className="font-semibold">
                    {t('work_mode')} <span className="text-red-500">*</span>
                </label>
                <Controller
                    name="work_mode"
                    control={control}
                    rules={{ required: t('work_mode_validation_msg') }}
                    render={({ field }) => (
                        <Select.Root value={field.value ?? ''} onValueChange={field.onChange}>
                            <Select.Trigger
                                className={cn(
                                    `w-full h-10 px-3 text-sm flex items-center justify-between border rounded-md bg-white
                    focus:outline-none focus:ring-0`,
                                    errors.work_mode ? 'border-red-500 text-red-500' : 'border-gray-300'
                                )}
                                aria-label={t('work_mode')}
                            >
                                <Select.Value placeholder={t('select_work_mode')} />
                                <Select.Icon>
                                    <FiChevronDown />
                                </Select.Icon>
                            </Select.Trigger>

                            <Select.Portal>
                                <Select.Content
                                    side="bottom"
                                    position="popper"
                                    className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)]"
                                >
                                    <Select.Viewport className="p-1">
                                        {data?.workModeList?.map((mode) => (
                                            <Select.Item
                                                key={mode.id}
                                                value={String(mode.id)} // 🔴 must be string
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>{mode.work_Mode}</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                        ))}
                                    </Select.Viewport>
                                </Select.Content>
                            </Select.Portal>
                        </Select.Root>
                    )}
                />
                {errors.work_mode && <p className="text-sm text-red-500">{errors.work_mode.message}</p>}
            </div>

            <div className="gap-2 flex flex-col">
                <div className="flex flex-row justify-between items-center">
                    <label className="font-semibold">
                        {t('objective')} <span className="text-red-500">*</span>
                    </label>
                    <button
                        type="button"
                        onClick={handleGenerateObjective}
                        disabled={generateObjectiveMutation.isPending || !watch('objective')?.trim()}
                        className={cn(
                            'font-semibold underline text-primary',
                            generateObjectiveMutation.isPending || !watch('objective')?.trim()
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                        )}
                    >
                        {generateObjectiveMutation.isPending ? 'Generating...' : 'Generate Objective'}
                    </button>
                </div>
                <Controller
                    name="objective"
                    control={control}
                    rules={{ required: t('objective_yup_msg') }}
                    render={({ field }) => (
                        <textarea
                            placeholder={t('enter_obj')}
                            className={`p-2 text-base w-full fl-input ${errors.objective ? 'fl-input-error' : ''}`}
                            rows={4}
                            {...field}
                        />
                    )}
                />
                {errors.objective && <p className="text-sm text-red-500">{errors.objective.message}</p>}
            </div>

            <div className="gap-1 flex flex-col">
                <label className="font-semibold">{t('upload_interview_documents')}</label>
                <div
                    className="relative w-full border border-gray-300 p-4 rounded-md text-center text-gray-500 cursor-pointer"
                    onDrop={handleImageDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        type="file"
                        accept="image/*"
                        ref={imageInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                            setValue('documents', e.target.files[0]);
                            setImagePrev(URL.createObjectURL(e.target.files[0]));
                        }}
                    />
                    <WiCloudUp className="mx-auto mb-0.5 text-blue-500" size={36} />
                    <p className="text-sm">
                        <span className="text-blue-600">{t('upload_document')}</span> {t('or_drag_drop')}
                        <br />
                        <span className="text-xs">{t('allowed_file_types')}</span>
                    </p>
                </div>
            </div>
            {imagePrev && (
                <div className="flex justify-center">
                    <img
                        src={imagePrev}
                        className="mx-auto mb-2 max-h-40 object-contain rounded transition-all duration-200 hover:scale-105"
                    />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="gap-1 flex flex-col">
                    <label className="font-semibold">
                        {t('no_of_ques')} <span className="text-red-500">*</span>
                    </label>
                    <InputField
                        type="number"
                        placeholder="10"
                        className="w-full p-2"
                        error={errors.no_question}
                        {...register('no_question')}
                    />
                    {errors.no_question && <p className="text-sm text-red-500">{errors.no_question.message}</p>}
                </div>
                <div className="gap-1 flex flex-col">
                    <label className="font-semibold">
                        {t('duration_mins')} <span className="text-red-500">*</span>
                    </label>
                    <InputField type="number" placeholder="30" className="w-full p-2" error={errors.duration} {...register('duration')} />
                    {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
                </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-evenly">
                <Button
                    type="submit"
                    onClick={() => setValue('action', 'generate')}
                    variant="outline"
                    color="primary"
                    disabled={mutation.isPending}
                    loading={mutation.isPending && getValues('action') === 'generate'}
                >
                    {t('generate_questions')}
                </Button>
                <Button
                    type="submit"
                    onClick={() => setValue('action', 'manually')}
                    color="primary"
                    disabled={mutation.isPending}
                    loading={mutation.isPending && getValues('action') === 'manually'}
                >
                    {t('i_will_do_it_myself')}
                </Button>
            </div>
        </form>
    );
};

InterviewDetails.propTypes = {
    PageAction: PropTypes.func,
    data: PropTypes.any
};

export default InterviewDetails;
