import * as yup from 'yup';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { yupResolver } from '@hookform/resolvers/yup';
import { useFieldArray, useForm } from 'react-hook-form';
import { QuestionLevels } from '@/utils/CommonList';
import { RotatingLines } from 'react-loader-spinner';
import { useMutation } from '@tanstack/react-query';
import { InterviewQuestionsCreateApi } from '@/api/InterviewApi';
import { useNavigate } from 'react-router';
import Button from '@/utils/components/ui/Button';

// --------------------
// Validation Schema
// --------------------
const schema = yup.object({
    questions: yup.array().of(
        yup.object({
            question: yup.string().required('Question is required.'),
            depth_level: yup.number().required()
        })
    )
});

// --------------------
// Component
// --------------------
const InterviewQuestion = ({ formData, isGenerating }) => {
    const navigate = useNavigate();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            interview_id: formData?.id,
            questions: []
        }
    });

    const { fields, remove } = useFieldArray({
        control,
        name: 'questions'
    });

    console.log(errors);

    // --------------------
    // Initialize Questions
    // --------------------
    useEffect(() => {
        if (isGenerating || !formData) return;

        const questions = formData.generated_questions?.length
            ? formData.generated_questions.map((q) => ({
                  id: null,
                  question: q,
                  depth_level: 1
              }))
            : Array.from({ length: formData.no_question }).map(() => ({
                  id: null,
                  question: '',
                  depth_level: 1
              }));

        setValue('questions', questions, { shouldValidate: true });
    }, [formData, isGenerating, setValue]);

    // --------------------
    // Depth Level Change
    // --------------------
    const handleLevelChange = (index, level) => {
        setValue(`questions.${index}.depth_level`, level, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: false
        });
    };

    // --------------------
    // Submit
    // --------------------
    const mutation = useMutation({
        mutationFn: InterviewQuestionsCreateApi,
        onSuccess: () => navigate('/job')
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    // --------------------
    // Loading UI
    // --------------------
    if (isGenerating) {
        return (
            <div className="flex items-center justify-center py-20">
                <RotatingLines height="1.5em" width="1.5em" />
                <span className="ml-3 text-gray-600 text-sm">Generating questions...</span>
            </div>
        );
    }

    // --------------------
    // Render
    // --------------------
    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <label className="font-semibold">Please review the questions below before proceeding.</label>

            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto">
                {fields.map((_, i) => {
                    const depth = watch(`questions.${i}.depth_level`);

                    return (
                        <div key={i} className="p-3 border border-gray-300 rounded-lg flex flex-col gap-3">
                            <div className="flex justify-between items-center font-semibold">
                                <span>Question {i + 1}</span>

                                <div className="flex gap-2 items-center">
                                    <span>Depth Level:</span>

                                    {QuestionLevels.map((level) => (
                                        <button
                                            key={level.value}
                                            type="button"
                                            onClick={() => handleLevelChange(i, level.value)}
                                            className={`fl-button py-1 text-sm ${depth === level.value ? 'fl-active' : level.classes}`}
                                        >
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <textarea
                                        rows={2}
                                        placeholder="Enter Question"
                                        className={`p-2 w-full fl-input bg-gray-50 ${
                                            errors.questions?.[i]?.question ? 'fl-input-error placeholder:text-red-300' : ''
                                        }`}
                                        {...register(`questions.${i}.question`)}
                                    />

                                    {errors.questions?.[i]?.question && (
                                        <span className="text-sm text-red-500">{errors.questions[i].question.message}</span>
                                    )}
                                </div>

                                <button type="button" onClick={() => remove(i)}>
                                    <AiOutlineDelete className="size-5 text-red-600" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center gap-10">
                <button type="button" className="fl-button fl-button-secondary px-6">
                    Cancel
                </button>

                <Button type="submit" color="primary" disabled={mutation.isPending} loading={mutation.isPending}>
                    Save
                </Button>
            </div>
        </form>
    );
};

// --------------------
// PropTypes
// --------------------
InterviewQuestion.propTypes = {
    formData: PropTypes.object,
    isGenerating: PropTypes.bool
};

export default InterviewQuestion;
