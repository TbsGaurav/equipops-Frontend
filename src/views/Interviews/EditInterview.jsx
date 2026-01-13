import { yupResolver } from '@hookform/resolvers/yup';
import InputField from '@/utils/components/ui/InputField';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { QuestionLevels } from '@/utils/CommonList';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoAdd } from 'react-icons/io5';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { InterviewByIdApi, InterviewInitApi, InterviewUpdateApi } from '@/api/InterviewApi';
import { useTranslate } from '@/hooks/useTranslate';
import { decryptData } from '@/utils/CryptoService';
import { FiCheck, FiChevronDown } from 'react-icons/fi';
import { WiCloudUp } from 'react-icons/wi';

import * as Select from '@radix-ui/react-select';
import { cn } from '@/utils/Utils';
import Toast from '@/utils/toast';
import Button from '@/utils/components/ui/Button';
import { GenerateInterviewObjectiveApi } from '@/api/InterviewTypeApi';

const EditInterview = () => {
    const { t } = useTranslate();

    const ValidationSchema = yup.object().shape({
        department: yup.string().required(`${t('dept_yup_msg')}`),
        interviewer: yup.string().required(`${t('select_interviewer_yup_msg')}`),
        description: yup.string().required(`${t('objective_yup_msg')}`),
        no_question: yup
            .number()
            .typeError(`${t('number_of_que_yup_msg')}`)
            .positive(`${t('positive_num_yup_msg')}`),
        duration: yup
            .number()
            .typeError(`${t('duration_yup_msg')}`)
            .positive(`${t('positive_num_yup_msg')}`),
        questions: yup.array().of(
            yup.object().shape({
                que: yup.string().required(`${t('question_yup_msg')}`)
            })
        )
    });

    const navigate = useNavigate();
    const params = useParams();
    const imageInputRef = useRef();
    const [selectedFile, setSelectedFile] = useState(null);

    const [imagePrev, setImagePrev] = useState('');
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    const {
        register,
        control,
        watch,
        setValue,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            department: '',
            description: '',
            interview_type: '',
            interviewer: '',
            documents: '',
            work_mode: '',
            no_question: 0,
            duration: 0,
            experience: '',
            questions: []
        },
        resolver: yupResolver(ValidationSchema)
    });

    const { fields, append, update, remove, replace } = useFieldArray({
        control,
        name: 'questions'
    });

    const { data: InitData } = useQuery({
        queryKey: ['Interview-Init'],
        queryFn: () => InterviewInitApi(),
        select: (res) => {
            const secret = res.headers && (res.headers['x-encryption-secret'] || res.headers['X-Encryption-Secret']);
            const data = res.data.data;

            return {
                secret: decryptData(data?.generate_question_key, secret),
                data
            };
        }
    });

    const { data: interviewData } = useQuery({
        queryKey: ['Interview-details-edit', params.id],
        queryFn: () => InterviewByIdApi({ Id: params.id }),
        enabled: !!params.id,
        select: (res) => res.data
    });

    // const mapDepthToLevel = (depth) => {
    //     switch (depth) {
    //         case 1:
    //             return 'low';
    //         case 2:
    //             return 'medium';
    //         case 3:
    //             return 'high';
    //         default:
    //             return 'low';
    //     }
    // };

    const handleImageDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || file.length === 0) return;

        if (!allowedTypes.includes(file.type)) {
            // toast.error('Only JPG, JPEG, and PNG files are allowed.');
        } else {
            setImagePrev(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (!params.id && fields.length === 0) {
            Array.from({ length: 3 }).forEach(() => {
                append({ que: '', level: 'low' });
            });
        }
    }, [params.id, fields.length, append]);

    const AddQuestion = () => {
        append({ que: '', level: 'low' });
    };

    const handleLevelChange = (index, level) => {
        update(index, {
            ...fields[index],
            level
        });
    };
    const queryClient = useQueryClient();

    const updateInterviewMutation = useMutation({
        mutationFn: (formData) => InterviewUpdateApi(formData),
        onSuccess: (res) => {
            const message = res?.data?.message || res?.message || t('interview_update_msg');

            Toast.success(message);
            queryClient.invalidateQueries(['Interview-details-edit', params.id]);
            queryClient.invalidateQueries(['Interview-List']);

            navigate('/job');
        },

        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || t('update_interview_failed_msg');

            Toast.error(errorMessage);
        }
    });

    useEffect(() => {
        if (
            !interviewData?.interview ||
            !InitData?.data?.departmentList ||
            !InitData?.data?.interviewTypeList ||
            !InitData?.data?.workModeList
        ) {
            return;
        }

        const { interview, questions } = interviewData;
        setValue('name', interview?.name ?? '');

        setValue('description', interview?.description ?? '');
        setValue('interview_type', String(interview?.interview_Type_Id ?? ''));
        setValue('interviewer', String(interview?.interviewer_Id ?? ''));
        setValue('work_mode', String(interview?.work_Mode_Id ?? ''));
        setValue('no_question', interview?.no_Of_Question ?? 0);
        setValue('duration', interview?.duration_Mins ? Number(interview.duration_Mins) : 0);
        setValue('experience', interview?.experience ?? '');
        if (Array.isArray(questions) && questions.length > 0) {
            replace(
                questions.map((q) => ({
                    id: q.id,
                    que: q.question ?? '',
                    level: q.depth_level
                }))
            );
        }

        if (interview?.document) {
            setImagePrev(interview.document);
        }

        setValue('department', String(interview?.department_Id ?? ''));
    }, [interviewData, setValue, replace, InitData]);

    const SubmitHandler = (formData) => {
        const fd = new FormData();

        // 🔹 Root fields
        fd.append('id', params.id);
        fd.append('name', formData.name);
        fd.append('department_Id', formData.department);
        fd.append('description', formData.description || '');
        fd.append('interview_Type_Id', formData.interview_type);
        fd.append('interviewer_Id', formData.interviewer);
        fd.append('no_Of_Question', formData.no_question);
        fd.append('duration_Mins', String(formData.duration));
        fd.append('experience', formData.experience);
        fd.append('work_Mode_Id', formData.work_mode);

        if (selectedFile instanceof File) {
            fd.append('document', selectedFile);
        }

        formData.questions.forEach((q, index) => {
            fd.append(`questions[${index}].question`, q.que);
            fd.append(`questions[${index}].depth_level`, q.level === 'low' ? 1 : q.level === 'medium' ? 2 : 3);

            if (q.id) {
                fd.append(`questions[${index}].id`, q.id);
            }
        });
        updateInterviewMutation.mutate(fd);
    };

    const handleGenerateObjective = async () => {
        const values = getValues();

        if (!values.work_mode || !values.interview_type || !values.experience) {
            return;
        }

        const payload = {
            workMode: InitData?.data?.workModeList?.find((w) => String(w.id) === values.work_mode)?.work_Mode,
            jobType: InitData?.data?.interviewTypeList?.find((j) => String(j.id) === values.interview_type)?.interview_type,
            experienceYears: parseInt(values.experience, 10),
            objective: values.description || ''
        };

        try {
            const res = await generateObjectiveMutation.mutateAsync(payload);

            const generatedObjective = res?.data?.jobObjective;

            if (generatedObjective) {
                setValue('description', generatedObjective, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <button className="fl-button fl-button-secondary pl-2 flex items-center" onClick={() => navigate('/job')}>
                    <MdKeyboardArrowLeft className="size-5" />
                    {t('back_btn')}
                </button>
                <button
                    className="fl-button fl-button-secondary px-2 flex items-center"
                    onClick={() => {
                        const rawFormId = interviewData?.interview?.interview_Form_Id;
                        const formId = rawFormId && rawFormId !== '00000000-0000-0000-0000-000000000000' ? rawFormId : null;
                        navigate(`/job/${params.id}/application-form/${formId ?? ''}`);
                    }}
                >
                    {t('application_form')}
                </button>
            </div>
            <form onSubmit={handleSubmit(SubmitHandler)} className="flex flex-col gap-4 text-black">
                <div className="gap-3 py-3 fl-card flex-col bg-gray-50">
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1">
                        {t('job_name')} <span className="text-sm text-gray-500">({t('job_name_helper')})</span>
                    </label>
                    <Controller name="name" control={control} render={({ field }) => <InputField {...field} error={!!errors.name} />} />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div className="gap-3 py-3 fl-card flex-col bg-gray-50">
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1">
                        {t('department')}
                    </label>
                    <Controller
                        name="department"
                        control={control}
                        rules={{ required: t('dept_yup_msg') }}
                        render={({ field }) => (
                            <Select.Root
                                value={field.value ?? ''} // Ensure the value is tied to the form state
                                onValueChange={(value) => {
                                    field.onChange(value); // Update the form state
                                }}
                            >
                                <Select.Trigger
                                    className={cn(
                                        `w-full h-10 px-3 text-sm flex items-center justify-between border rounded-md bg-white
                                        focus:outline-none focus:ring-0`,
                                        errors.department ? 'border-red-500' : 'border-gray-300'
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
                                            {InitData?.data?.departmentList?.map((type) => (
                                                <Select.Item
                                                    key={type.id}
                                                    value={String(type.id)}
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
                    {errors.department && <p className="text-xs text-red-500 mt-1">{errors.department.message}</p>}
                </div>
                <div className="gap-3 py-3 fl-card flex-col bg-gray-50">
                    <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1">
                        {t('experience')}
                    </label>
                    <Controller
                        name="experience"
                        control={control}
                        render={({ field }) => <InputField {...field} error={!!errors.experience} />}
                    />
                    {errors.experience && <p className="text-xs text-red-500 mt-1">{errors.experience.message}</p>}
                </div>
                <div className="gap-3 py-3 fl-card flex-col bg-gray-50">
                    <div className="flex flex-row justify-between items-center">
                        <label className="font-semibold">
                            {t('objective')} <span className="text-red-500">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={handleGenerateObjective}
                            disabled={generateObjectiveMutation.isPending || !watch('description')?.trim()}
                            className={cn(
                                'font-semibold underline text-primary',
                                generateObjectiveMutation.isPending || !watch('description')?.trim()
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'cursor-pointer'
                            )}
                        >
                            {generateObjectiveMutation.isPending ? 'Generating...' : 'Generate Objective'}
                        </button>
                    </div>
                    <Controller
                        name="description"
                        control={control}
                        rules={{ required: t('objective_yup_msg') }}
                        render={({ field }) => (
                            <textarea
                                placeholder={t('enter_obj')}
                                className={`p-2 text-base w-full fl-input ${errors.description ? 'fl-input-error' : ''}`}
                                rows={4}
                                {...field}
                            />
                        )}
                    />
                    {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
                </div>

                <div className="gap-1 flex flex-col">
                    <label className="font-semibold">
                        {t('interview_type')} <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="interview_type"
                        control={control}
                        rules={{ required: t('interview_type_validation_msg') }}
                        render={({ field }) => (
                            <Select.Root value={field.value ?? ''} onValueChange={field.onChange}>
                                <Select.Trigger
                                    className={cn(
                                        `w-full h-10 px-3 text-sm flex items-center justify-between border rounded-md bg-white
                                        focus:outline-none focus:ring-0`,
                                        errors.interview_type ? 'border-red-500' : 'border-gray-300'
                                    )}
                                    aria-label={t('interview_type')}
                                >
                                    <Select.Value placeholder={t('select_interview_type_placeholder')} />
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
                                            {InitData?.data?.interviewTypeList?.map((type) => (
                                                <Select.Item
                                                    key={type.id}
                                                    value={String(type.id)}
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
                                        errors.work_mode ? 'border-red-500' : 'border-gray-300'
                                    )}
                                    aria-label={t('work_mode')}
                                >
                                    <Select.Value placeholder={t('select_work_mode_placeholder')} />
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
                                            {InitData?.data?.workModeList?.map((mode) => (
                                                <Select.Item
                                                    key={mode.id}
                                                    value={String(mode.id)}
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
                <div className="gap-3 flex-col fl-card bg-gray-50">
                    <div className="flex flex-col gap-3">
                        <label className="font-semibold">
                            {t('select_an_interview')} <span className="text-red-500">*</span>
                        </label>
                        <div>
                            {errors.interviewer && <p className="text-sm text-red-500">{errors.interviewer.message}</p>}
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 justify-around">
                                {InitData?.data?.interviewerList?.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => setValue('interviewer', item.id)}
                                        className={`fl-card flex-col gap-3 items-center p-4 lg:p-8 cursor-pointer
                                        hover:scale-105 transition-transform duration-200 ease-in-out
                                        ${watch('interviewer') === item.id ? 'bg-indigo-300 text-white' : 'bg-white'} 
                                        ${errors.interviewer && !watch('interviewer') ? 'ring-2 ring-red-500 animate-pulse' : ''}`}
                                    >
                                        <img
                                            src={item.avatar_url || null}
                                            alt={item.name}
                                            className={`size-20 object-cover object-top rounded-full
                                        ${watch('interviewer') === item.id ? 'bg-white/60' : 'bg-indigo-300'}`}
                                        />
                                        <span className="text-center font-semibold">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
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
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setSelectedFile(file); // ✅ store File separately
                                    setValue('documents', null); // keep RHF clean
                                    setImagePrev(URL.createObjectURL(file));
                                }}
                            />
                            <WiCloudUp className="mx-auto mb-0.5 text-blue-500" size={36} />
                            <p className="text-sm">
                                <span className="text-blue-600">{t('upload_document')} </span>
                                {t('or_drag_drop')}
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
                                placeholder={t('no_of_ques_placeholder')}
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
                            <InputField
                                type="number"
                                placeholder={t('duration_placeholder')}
                                className="w-full p-2"
                                error={errors.duration}
                                {...register('duration')}
                            />
                            {errors.duration && <p className="text-sm text-red-500">{errors.duration.message}</p>}
                        </div>
                    </div>
                </div>
                <div className="fl-card flex-col gap-2 bg-gray-50">
                    <label className="font-semibold">{t('questions')}</label>
                    <div className="flex flex-col gap-3 max-h-[440px] overflow-y-auto w-full">
                        {fields.map((item, i) => {
                            const currentLevel = watch(`questions.${i}.level`) || 'low';

                            return (
                                <div key={i} className="p-3 border border-gray-300 rounded-lg flex flex-col gap-3 bg-white">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span className="">
                                            {t('question')}
                                            {i + 1}
                                        </span>
                                        <div className="flex gap-2 items-center">
                                            <span>{t('depth_level')}</span>
                                            {QuestionLevels.map((level) => (
                                                <button
                                                    type="button"
                                                    key={level.value}
                                                    onClick={() => handleLevelChange(i, level.value)}
                                                    className={`fl-button py-1 text-sm 
                                                        ${currentLevel === level.value ? 'fl-active' : level.classes}`}
                                                >
                                                    {t(level.key)}
                                                </button>
                                            ))}

                                            {/* {QuestionLevels.map((level) => (
                                                <button
                                                    key={level.value}
                                                    onClick={() => handleLevelChange(i, level.value)}
                                                    className={`fl-button py-1 text-sm ${item.level == level.value ? 'fl-active' : level.classes}`}
                                                >
                                                    {t(level.key)}
                                                </button>
                                            ))} */}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <textarea
                                                placeholder={t('enter_que_placeholder')}
                                                className={`p-2 text-base w-full fl-input bg-gray-50 
                                                        ${errors.questions && errors.questions[i]?.que ? 'fl-input-error placeholder:text-red-300' : ''}`}
                                                rows={2}
                                                {...register(`questions.${i}.que`)}
                                            />
                                            {errors.questions && errors.questions[i]?.que && (
                                                <span className="text-sm text-red-500">{errors.questions[i].que.message}</span>
                                            )}
                                        </div>
                                        <div className="content-center">
                                            <button type="button" onClick={() => remove(i)}>
                                                <AiOutlineDelete className="size-5 text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex">
                    <div className="flex-1 justify-items-center">
                        <button
                            type="button"
                            className="fl-button flex items-center gap-1 hover:bg-indigo-400 hover:text-white text-indigo-600"
                            onClick={AddQuestion}
                        >
                            <IoAdd className="size-5" /> <span>{t('add_question')}</span>
                        </button>
                    </div>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={updateInterviewMutation.isPending}
                        loading={updateInterviewMutation.isPending}
                    >
                        {updateInterviewMutation.isPending ? t('submitting_btn') : t('submit_btn')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditInterview;
