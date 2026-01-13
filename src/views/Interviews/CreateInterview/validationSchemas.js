import * as yup from 'yup';

export const interviewDetailsFields = ['name', 'interviewer', 'objective', 'no_question', 'duration'];

export const interviewSchema = yup.object({
    name: yup.string().required('Job name is required'),
    interviewer: yup.string().required('Interviewer is required'),
    interview_type: yup.string().required('InterviewerType is required'),
    objective: yup.string().required('Objective is required'),
    no_question: yup.number().positive().required(),
    duration: yup.number().positive().required(),

    action: yup.string().required(),

    questions: yup.array().when('action', {
        is: 'manually',
        then: (schema) =>
            schema.of(
                yup.object({
                    que: yup.string().required('Question is required'),
                    level: yup.string()
                })
            ),
        otherwise: (schema) => schema.notRequired()
    }),

    description: yup.string()
});
