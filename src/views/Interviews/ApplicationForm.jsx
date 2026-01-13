import Toast from '@/utils/toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { InterviewFormByIdApi, InterviewFormUpsertApi } from '@/api/InterviewFormApi';

/* ---------------- FIELD TYPES ---------------- */
const FIELD_TYPES = [
    { value: 'INPUT', label: 'Text Input' },
    { value: 'CHECKBOX', label: 'Checkbox' },
    { value: 'FILE', label: 'File Upload' }
];

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

export default function ApplicationForm() {
    const navigate = useNavigate();
    const { id: interviewId, formId } = useParams();

    /* ---------------- DEFAULT SCHEMA (CREATE ONLY) ---------------- */
    const DEFAULT_SCHEMA = {
        info_section: {
            applicant_name: {
                label: 'Applicant Name',
                placeholder: 'Enter applicant name',
                field_type: 'INPUT',
                is_required: true
            },
            applicant_email: {
                label: 'Applicant Email',
                placeholder: 'Enter email',
                field_type: 'INPUT',
                is_required: true
            },
            applicant_phone: {
                label: 'Applicant Phone',
                placeholder: 'Enter phone number',
                field_type: 'INPUT',
                is_required: true
            },
            resume: {
                label: 'Upload Resume',
                field_type: 'FILE',
                is_required: true,
                accept: '.pdf,.doc,.docx',
                max_size_mb: 5
            }
        },
        education: {
            enable: true,
            has_multiple: false,
            fields: [
                {
                    passing_year: {
                        label: 'Passing Year',
                        placeholder: '2023',
                        field_type: 'INPUT',
                        is_required: true
                    },
                    organization_name: {
                        label: 'College / University',
                        placeholder: 'University name',
                        field_type: 'INPUT',
                        is_required: true
                    }
                }
            ]
        },
        experience: {
            enable: true,
            has_multiple: true,
            fields: [
                {
                    duration: {
                        label: 'Duration',
                        placeholder: '2 Years',
                        field_type: 'INPUT',
                        is_required: true
                    },
                    is_current_company: {
                        label: 'Currently Working Here',
                        field_type: 'CHECKBOX',
                        is_required: false
                    },
                    company_name: {
                        label: 'Company Name',
                        placeholder: 'Enter Company name',
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
    };

    const [schema, setSchema] = useState(() => deepClone(DEFAULT_SCHEMA));

    const [selectedPath, setSelectedPath] = useState(null);

    /* ---------------- FETCH (UPDATE MODE) ---------------- */
    const { data: formData } = useQuery({
        queryKey: ['interview-form', formId],
        queryFn: () => InterviewFormByIdApi(formId),
        enabled: !!formId,
        select: (res) => res?.data
    });

    useEffect(() => {
        if (formData?.form_json_data) {
            setSchema(deepClone(formData.form_json_data));
        }
    }, [formData]);

    const saveFormMutation = useMutation({
        mutationFn: InterviewFormUpsertApi,
        onSuccess: (res) => {
            const savedSchema = res?.data?.data?.form_json_data;

            if (savedSchema) {
                setSchema(savedSchema); // ✅ UI updates immediately
            }

            Toast.success('Application form saved successfully');
            navigate(`/job/edit/${interviewId}`);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to save form');
        }
    });

    const handleSaveForm = () => {
        const payload = {
            id: formId ?? null,
            interview_id: interviewId,
            form_json_data: deepClone(schema)
        };

        saveFormMutation.mutate(payload);
    };

    /* ---------------- HELPERS ---------------- */
    const getByPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);

    const updateByPath = (path, updates) => {
        setSchema((prev) => {
            const clone = deepClone(prev);
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

    const selectedItem = selectedPath ? getByPath(schema, selectedPath) : null;
    const isSectionSelected =
        selectedPath && !selectedPath.includes('fields') && !selectedPath.includes('info_section.') && selectedPath !== 'skills';

    /* ---------------- FIELD RENDER ---------------- */
    const renderField = (field, path) => (
        <div
            key={path}
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

            {field.field_type === 'FILE' && (
                <>
                    <input type="file" disabled className="mt-2" />
                    <p className="text-xs text-gray-500 mt-1">
                        {field.accept} | Max {field.max_size_mb}MB
                    </p>
                </>
            )}
        </div>
    );

    /* ---------------- REPEATABLE SECTION ---------------- */
    const renderRepeatableSection = (key, section) => {
        if (!section.enable) return null;

        return (
            <div className="border rounded p-4 space-y-4">
                <h3
                    onClick={() => setSelectedPath(key)}
                    className={`text-lg font-semibold cursor-pointer ${selectedPath === key ? 'text-blue-600' : ''}`}
                >
                    {key.toUpperCase()}
                </h3>

                {section.fields.map((row, rowIndex) => (
                    <div key={rowIndex} className="space-y-3">
                        {Object.entries(row).map(([k, f]) => renderField(f, `${key}.fields.${rowIndex}.${k}`))}
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
    };

    /* ---------------- SKILLS ---------------- */
    const renderSkills = (skills) =>
        skills.enable && (
            <div
                onClick={() => setSelectedPath('skills')}
                className={`p-4 border rounded cursor-pointer ${
                    selectedPath === 'skills' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
            >
                <label className="font-medium">
                    {skills.label}
                    {skills.is_required && ' *'}
                </label>

                <div className="flex gap-4 mt-2">
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
        <div className="min-h-screen bg-gray-100">
            {/* HEADER */}
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Interview Application Builder</h1>
                        <p className="text-xs text-gray-500">Design and customize your application form</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 border rounded" onClick={() => navigate(`/job/edit/${interviewId}`)}>
                            Cancel
                        </button>
                        <button className="px-5 py-2 bg-blue-600 text-white rounded" onClick={handleSaveForm}>
                            Save Form
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
                {/* FORM PREVIEW */}
                <div className="w-2/3 bg-white p-6 rounded border space-y-8">
                    <h2 className="font-semibold">Form Preview</h2>
                    {/* Applicant Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Applicant Information</h3>

                        {Object.entries(schema.info_section).map(([k, f]) => renderField(f, `info_section.${k}`))}
                    </div>

                    {renderRepeatableSection('education', schema.education)}
                    {renderRepeatableSection('experience', schema.experience)}
                    {renderSkills(schema.skills)}
                </div>
                {/* -------- RIGHT SETTINGS PANEL -------- */}
                <aside className="w-1/3 sticky top-24">
                    <div className="bg-white rounded-2xl border shadow-sm p-5">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>

                        {!selectedItem && (
                            <div className="text-center py-10">
                                <p className="text-sm text-gray-400">Select a field or section to configure</p>
                            </div>
                        )}

                        {/* ================= SECTION SETTINGS ================= */}
                        {isSectionSelected && selectedItem && (
                            <div className="space-y-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Section Settings</p>

                                {'enable' in selectedItem && (
                                    <label className="flex items-center justify-between text-sm">
                                        <span>Enable section</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedItem.enable}
                                            onChange={(e) =>
                                                updateByPath(selectedPath, {
                                                    enable: e.target.checked
                                                })
                                            }
                                        />
                                    </label>
                                )}

                                {'has_multiple' in selectedItem && (
                                    <label className="flex items-center justify-between text-sm">
                                        <span>Allow multiple entries</span>
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={selectedItem.has_multiple}
                                            onChange={(e) =>
                                                updateByPath(selectedPath, {
                                                    has_multiple: e.target.checked
                                                })
                                            }
                                        />
                                    </label>
                                )}
                            </div>
                        )}
                        {/* ================= FIELD + SKILLS SETTINGS ================= */}
                        {!isSectionSelected && selectedItem && (
                            <div className="space-y-5">
                                {/* -------- DEFAULT FIELD SETTINGS -------- */}
                                {selectedPath !== 'skills' && (
                                    <>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Field Settings</p>

                                        {'label' in selectedItem && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Label</label>
                                                <input
                                                    className="w-full border rounded-lg p-2 mt-1"
                                                    value={selectedItem.label}
                                                    onChange={(e) =>
                                                        updateByPath(selectedPath, {
                                                            label: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>
                                        )}

                                        {'placeholder' in selectedItem && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Placeholder</label>
                                                <input
                                                    className="w-full border rounded-lg p-2 mt-1"
                                                    value={selectedItem.placeholder}
                                                    onChange={(e) =>
                                                        updateByPath(selectedPath, {
                                                            placeholder: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>
                                        )}

                                        {'field_type' in selectedItem && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Field Type</label>
                                                <select
                                                    className="w-full border rounded-lg p-2 mt-1"
                                                    value={selectedItem.field_type}
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
                                            </div>
                                        )}

                                        {'is_required' in selectedItem && (
                                            <label className="flex items-center justify-between text-sm">
                                                <span>Required field</span>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={selectedItem.is_required}
                                                    onChange={(e) =>
                                                        updateByPath(selectedPath, {
                                                            is_required: e.target.checked
                                                        })
                                                    }
                                                />
                                            </label>
                                        )}

                                        {'accept' in selectedItem && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Allowed File Types</label>
                                                <input
                                                    className="w-full border rounded-lg p-2 mt-1"
                                                    value={selectedItem.accept}
                                                    onChange={(e) =>
                                                        updateByPath(selectedPath, {
                                                            accept: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>
                                        )}

                                        {'max_size_mb' in selectedItem && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-600">Max File Size (MB)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border rounded-lg p-2 mt-1"
                                                    value={selectedItem.max_size_mb}
                                                    onChange={(e) =>
                                                        updateByPath(selectedPath, {
                                                            max_size_mb: Number(e.target.value)
                                                        })
                                                    }
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* -------- SKILLS SETTINGS -------- */}
                                {selectedPath === 'skills' && (
                                    <>
                                        <p className="text-xs font-semibold text-gray-500 uppercase">Skills Settings</p>

                                        {/* Label */}
                                        <div>
                                            <label className="text-xs font-medium text-gray-600">Label</label>
                                            <input
                                                className="w-full border rounded-lg p-2 mt-1"
                                                value={selectedItem.label}
                                                onChange={(e) =>
                                                    updateByPath('skills', {
                                                        label: e.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        {/* Required */}
                                        <label className="flex items-center justify-between text-sm">
                                            <span>Required field</span>
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4"
                                                checked={selectedItem.is_required}
                                                onChange={(e) =>
                                                    updateByPath('skills', {
                                                        is_required: e.target.checked
                                                    })
                                                }
                                            />
                                        </label>

                                        {/* Options */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-gray-600">Skill Options</label>

                                            {selectedItem.options.map((opt, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input
                                                        className="flex-1 border rounded-lg p-2 text-sm"
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const updated = [...selectedItem.options];
                                                            updated[index] = e.target.value;
                                                            updateByPath('skills', { options: updated });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="px-3 text-red-500 hover:bg-red-50 rounded"
                                                        onClick={() => {
                                                            const updated = selectedItem.options.filter((_, i) => i !== index);
                                                            updateByPath('skills', { options: updated });
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}

                                            <button
                                                type="button"
                                                className="text-sm text-blue-600 hover:underline"
                                                onClick={() =>
                                                    updateByPath('skills', {
                                                        options: [...selectedItem.options, 'New Skill']
                                                    })
                                                }
                                            >
                                                + Add Skill
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
