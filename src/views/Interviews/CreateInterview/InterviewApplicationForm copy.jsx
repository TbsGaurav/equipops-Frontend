import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider, useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

/* ===================== SECTION DEFINITIONS ===================== */
const SECTION_TEMPLATES = {
    education: {
        key: 'education',
        label: 'Education',
        fields: [
            { key: 'degree', label: 'Degree', type: 'text', required: true },
            { key: 'institution', label: 'Institution', type: 'text', required: true }
        ]
    },

    skills: {
        key: 'skills',
        label: 'Skills',
        fields: [
            {
                key: 'skills',
                label: 'Select Skills',
                type: 'checkbox',
                options: ['React', 'Node.js', '.NET', 'SQL'],
                required: true
            }
        ]
    },

    languages: {
        key: 'languages',
        label: 'Languages',
        fields: [
            {
                key: 'languages',
                label: 'Known Languages',
                type: 'checkbox',
                options: ['English', 'Hindi', 'Gujarati'],
                required: true
            }
        ]
    },

    resume: {
        key: 'resume',
        label: 'Resume',
        fields: [
            {
                key: 'resume_file',
                label: 'Upload Resume',
                type: 'file',
                required: true
            }
        ]
    },

    certificates: {
        key: 'certificates',
        label: 'Certificates',
        repeatable: true,
        fields: [
            {
                key: 'certificate_file',
                label: 'Upload Certificate',
                type: 'file'
            }
        ]
    }
};

/* ===================== FIELD COMPONENTS ===================== */
const InputField = ({ label, error, ...props }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <input {...props} className="w-full border rounded-lg px-3 py-2" />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

InputField.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string
};

const CheckboxGroup = ({ label, options, value, onChange, error }) => {
    const toggle = (opt) => {
        if (value.includes(opt)) {
            onChange(value.filter((v) => v !== opt));
        } else {
            onChange([...value, opt]);
        }
    };

    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">{label}</p>
            {options.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                    <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
                    <span>{opt}</span>
                </label>
            ))}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
};

CheckboxGroup.propTypes = {
    label: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    value: PropTypes.arrayOf(PropTypes.string),
    onChange: PropTypes.func.isRequired,
    error: PropTypes.string
};

CheckboxGroup.defaultProps = {
    value: []
};

const FileUpload = ({ label, error, onChange }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium">{label}</label>
        <input type="file" onChange={(e) => onChange(e.target.files?.[0] || null)} />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);

FileUpload.propTypes = {
    label: PropTypes.string.isRequired,
    error: PropTypes.string,
    onChange: PropTypes.func.isRequired
};

/* ===================== APPLICANT INFO ===================== */
const ApplicantInfo = () => {
    const { register, formState } = useFormContext();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Full Name" error={formState.errors?.applicant?.name?.message} {...register('applicant.name')} />

            <InputField label="Email" type="email" error={formState.errors?.applicant?.email?.message} {...register('applicant.email')} />

            <InputField label="Phone Number" error={formState.errors?.applicant?.phone?.message} {...register('applicant.phone')} />
        </div>
    );
};

/* ===================== SECTION RENDER ===================== */
const Section = ({ section }) => {
    const { register, control, formState } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: section.key
    });

    const template = SECTION_TEMPLATES[section.key];

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">{template.label}</h3>

            {fields.map((item, i) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                    {template.fields.map((f) => {
                        const name = `${section.key}.${i}.${f.key}`;
                        const error = formState.errors?.[section.key]?.[i]?.[f.key]?.message;

                        if (f.type === 'checkbox') {
                            return (
                                <Controller
                                    key={f.key}
                                    name={name}
                                    control={control}
                                    render={({ field }) => (
                                        <CheckboxGroup
                                            label={f.label}
                                            options={f.options}
                                            value={field.value || []}
                                            onChange={field.onChange}
                                            error={error}
                                        />
                                    )}
                                />
                            );
                        }

                        if (f.type === 'file') {
                            return (
                                <Controller
                                    key={f.key}
                                    name={name}
                                    control={control}
                                    render={({ field }) => <FileUpload label={f.label} onChange={field.onChange} error={error} />}
                                />
                            );
                        }

                        return <InputField key={f.key} label={f.label} error={error} {...register(name)} />;
                    })}

                    {template.repeatable && (
                        <button type="button" onClick={() => remove(i)} className="text-sm text-red-500">
                            Remove
                        </button>
                    )}
                </div>
            ))}

            <button type="button" onClick={() => append({})} className="text-indigo-600 text-sm">
                + Add {template.label}
            </button>
        </div>
    );
};

Section.propTypes = {
    section: PropTypes.shape({
        key: PropTypes.string.isRequired,
        enabled: PropTypes.bool.isRequired
    }).isRequired
};

/* ===================== FORM RENDER ===================== */
const RenderForm = ({ config }) => {
    const schema = useMemo(() => {
        const shape = {
            applicant: yup.object({
                name: yup.string().required('Name is required'),
                email: yup.string().email('Invalid email').required('Email is required'),
                phone: yup
                    .string()
                    .matches(/^[0-9]{10}$/, 'Phone must be 10 digits')
                    .required('Phone is required')
            })
        };

        config.sections.forEach((s) => {
            if (!s.enabled) return;

            shape[s.key] = yup.array().of(
                yup.object(
                    SECTION_TEMPLATES[s.key].fields.reduce((acc, f) => {
                        acc[f.key] = f.required
                            ? f.type === 'checkbox'
                                ? yup.array().min(1, `${f.label} is required`)
                                : f.type === 'file'
                                  ? yup.mixed().required(`${f.label} is required`)
                                  : yup.string().required(`${f.label} is required`)
                            : yup.mixed().nullable();
                        return acc;
                    }, {})
                )
            );
        });

        return yup.object(shape);
    }, [config]);

    const methods = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            applicant: { name: '', email: '', phone: '' },
            ...Object.fromEntries(config.sections.filter((s) => s.enabled).map((s) => [s.key, [{}]]))
        }
    });

    const onSubmit = (data) => {
        console.log('FINAL SUBMISSION DATA:', data);
        alert('Application submitted! Check console.');
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-10">
                <ApplicantInfo />

                {config.sections
                    .filter((s) => s.enabled)
                    .map((s) => (
                        <Section key={s.key} section={s} />
                    ))}

                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg">Submit Application</button>
            </form>
        </FormProvider>
    );
};

RenderForm.propTypes = {
    config: PropTypes.shape({
        sections: PropTypes.array.isRequired
    }).isRequired
};

/* ===================== MAIN APP ===================== */
export default function App() {
    const [sections, setSections] = useState(
        Object.keys(SECTION_TEMPLATES).map((key) => ({
            key,
            enabled: true
        }))
    );

    const [publishedForm, setPublishedForm] = useState(null);

    const saveAndPublish = () => {
        const config = {
            id: 'job_form_001',
            title: 'Job Application',
            sections,
            published: true
        };

        localStorage.setItem('published_form', JSON.stringify(config));
        setPublishedForm(config);
    };

    return (
        <div className="p-6 space-y-8 bg-gray-100 min-h-screen">
            <div className="grid grid-cols-12 gap-6">
                {/* BUILDER */}
                <div className="col-span-4 bg-white rounded-xl p-6 shadow">
                    <h2 className="font-bold text-xl mb-4">Form Builder</h2>

                    {sections.map((s) => (
                        <label key={s.key} className="flex justify-between mb-3">
                            <span className="capitalize">{s.key}</span>
                            <input
                                type="checkbox"
                                checked={s.enabled}
                                onChange={() =>
                                    setSections((prev) => prev.map((x) => (x.key === s.key ? { ...x, enabled: !x.enabled } : x)))
                                }
                            />
                        </label>
                    ))}

                    <button onClick={saveAndPublish} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg">
                        Save & Publish
                    </button>
                </div>

                {/* PREVIEW */}
                <div className="col-span-8 bg-white rounded-xl p-6 shadow">
                    <h2 className="font-bold text-xl mb-4">Live Form Preview</h2>
                    <RenderForm config={{ sections }} />
                </div>
            </div>

            {/* IFRAME */}
            {publishedForm && (
                <div className="bg-white rounded-xl p-6 shadow">
                    <h2 className="font-bold mb-3">Published Form (iframe)</h2>
                    <iframe
                        className="w-full h-[600px] border rounded-lg"
                        title="Published Form"
                        srcDoc={`<pre>${JSON.stringify(publishedForm, null, 2)}</pre>`}
                    />
                </div>
            )}
        </div>
    );
}
