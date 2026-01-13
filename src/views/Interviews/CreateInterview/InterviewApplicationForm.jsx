import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

/* ---------------- FIELD TYPES ---------------- */
const FIELD_TYPES = [
    { value: 'INPUT', label: 'Input' },
    { value: 'CHECKBOX', label: 'Checkbox' }
];

/* ================= COMPONENT ================= */
export default function InterviewApplicationForm() {
    const methods = useForm();

    /* ---------------- SCHEMA STATE ---------------- */
    const [schema, setSchema] = useState({
        info_section: {
            applicant_name: {
                label: 'Applicant Name',
                placeholder: 'Applicant Name',
                field_type: 'INPUT',
                is_required: true
            },
            applicant_email: {
                label: 'Applicant Email',
                placeholder: 'Applicant Email',
                field_type: 'INPUT',
                is_required: true
            },
            applicant_phone: {
                label: 'Applicant Phone',
                placeholder: 'Applicant Phone',
                field_type: 'INPUT',
                is_required: true
            }
        },

        education: {
            has_multiple: false,
            enable: true,
            fields: [
                {
                    passing_year: {
                        label: 'Passing Year',
                        placeholder: 'Passing Year',
                        field_type: 'INPUT',
                        is_required: true
                    },
                    organization_name: {
                        label: 'College / University',
                        placeholder: 'College / University',
                        field_type: 'INPUT',
                        is_required: true
                    }
                }
            ]
        },

        experience: {
            has_multiple: true,
            enable: true,
            fields: [
                {
                    duration: {
                        label: 'Duration',
                        placeholder: '2 Years',
                        field_type: 'INPUT',
                        is_required: true
                    },
                    is_current_company: {
                        label: 'Current Company',
                        field_type: 'CHECKBOX',
                        is_required: false
                    },
                    company_name: {
                        label: 'Company Name',
                        placeholder: 'Company Name',
                        field_type: 'INPUT',
                        is_required: true
                    }
                }
            ]
        },

        skills: {
            enable: true,
            label: 'Skills',
            field_type: 'CHECKBOX',
            is_required: true,
            options: ['React', 'JavaScript']
        }
    });

    const [selectedPath, setSelectedPath] = useState(null);

    /* ---------------- HELPERS ---------------- */
    const getByPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);

    const updateByPath = (path, updates) => {
        setSchema((prev) => {
            const clone = structuredClone(prev);
            const keys = path.split('.');
            let ref = clone;

            keys.forEach((k, i) => {
                if (i === keys.length - 1) {
                    ref[k] = { ...ref[k], ...updates };
                } else {
                    ref = ref[k];
                }
            });

            return clone;
        });
    };

    const selectedField = selectedPath ? getByPath(schema, selectedPath) : null;

    /* ---------------- FIELD RENDERER ---------------- */
    const renderField = (field, path) => (
        <div
            onClick={() => setSelectedPath(path)}
            className={`p-3 border rounded cursor-pointer ${
                selectedPath === path ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
            }`}
        >
            <label className="block font-medium">
                {field.label}
                {field.is_required && ' *'}
            </label>

            {field.field_type === 'INPUT' && <input disabled placeholder={field.placeholder} className="w-full border rounded p-2 mt-1" />}

            {field.field_type === 'CHECKBOX' && <input type="checkbox" disabled className="mt-2" />}
        </div>
    );

    /* ---------------- RENDER REPEATABLE SECTION ---------------- */
    const renderRepeatableSection = (key, section) => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold capitalize">{key}</h3>

            {section.fields.map((row, rowIndex) => (
                <div key={rowIndex} className="border rounded p-4 space-y-3">
                    {Object.entries(row).map(([fieldKey, field]) => renderField(field, `${key}.fields.${rowIndex}.${fieldKey}`))}
                </div>
            ))}

            {section.has_multiple && (
                <button
                    type="button"
                    className="text-blue-600 text-sm"
                    onClick={() =>
                        setSchema((prev) => {
                            const clone = structuredClone(prev);
                            clone[key].fields.push(structuredClone(prev[key].fields[0]));
                            return clone;
                        })
                    }
                >
                    + Add {key}
                </button>
            )}
        </div>
    );

    /* ---------------- RENDER SKILLS ---------------- */
    const renderSkills = (skills) => (
        <div
            onClick={() => setSelectedPath('skills')}
            className={`p-3 border rounded cursor-pointer ${selectedPath === 'skills' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
        >
            <label className="font-medium">
                {skills.label}
                {skills.is_required && ' *'}
            </label>

            <div className="flex gap-3 mt-2">
                {skills.options.map((opt) => (
                    <label key={opt} className="flex items-center gap-2">
                        <input type="checkbox" disabled />
                        {opt}
                    </label>
                ))}
            </div>
        </div>
    );

    /* ================= UI ================= */
    return (
        <FormProvider {...methods}>
            <div className="flex gap-4 items-start">
                {/* ---------------- LEFT FORM ---------------- */}
                <form
                    className="w-2/3 bg-white p-4 rounded border space-y-6"
                    onSubmit={methods.handleSubmit((data) => console.log('Form Submit', data))}
                >
                    <h2 className="text-xl font-semibold">Personal Information</h2>

                    {Object.entries(schema.info_section).map(([k, f]) => renderField(f, `info_section.${k}`))}

                    {renderRepeatableSection('education', schema.education)}
                    {renderRepeatableSection('experience', schema.experience)}

                    {renderSkills(schema.skills)}
                </form>

                {/* ---------------- RIGHT SIDEBAR ---------------- */}
                <div className="w-1/3 bg-white p-4 rounded border">
                    <h3 className="text-lg font-semibold mb-3">Field Settings</h3>

                    {!selectedField && <p className="text-gray-500">Select a field to edit</p>}

                    {selectedField && (
                        <div className="space-y-3">
                            {'label' in selectedField && (
                                <input
                                    className="w-full border p-2 rounded"
                                    value={selectedField.label}
                                    placeholder="Label"
                                    onChange={(e) =>
                                        updateByPath(selectedPath, {
                                            label: e.target.value
                                        })
                                    }
                                />
                            )}

                            {'placeholder' in selectedField && (
                                <input
                                    className="w-full border p-2 rounded"
                                    value={selectedField.placeholder}
                                    placeholder="Placeholder"
                                    onChange={(e) =>
                                        updateByPath(selectedPath, {
                                            placeholder: e.target.value
                                        })
                                    }
                                />
                            )}

                            {'field_type' in selectedField && (
                                <select
                                    className="w-full border p-2 rounded"
                                    value={selectedField.field_type}
                                    onChange={(e) =>
                                        updateByPath(selectedPath, {
                                            field_type: e.target.value
                                        })
                                    }
                                >
                                    {FIELD_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {'is_required' in selectedField && (
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedField.is_required}
                                        onChange={(e) =>
                                            updateByPath(selectedPath, {
                                                is_required: e.target.checked
                                            })
                                        }
                                    />
                                    Required
                                </label>
                            )}

                            {Array.isArray(selectedField?.options) && (
                                <div>
                                    <p className="font-medium">Options</p>
                                    {selectedField.options.map((opt, i) => (
                                        <input
                                            key={i}
                                            value={opt}
                                            className="w-full border p-2 rounded mt-2"
                                            onChange={(e) => {
                                                const opts = [...selectedField.options];
                                                opts[i] = e.target.value;
                                                updateByPath(selectedPath, {
                                                    options: opts
                                                });
                                            }}
                                        />
                                    ))}
                                    <button
                                        className="text-blue-600 text-sm mt-2"
                                        onClick={() =>
                                            updateByPath(selectedPath, {
                                                options: [...selectedField.options, `Option ${Date.now()}`]
                                            })
                                        }
                                    >
                                        + Add Option
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}
