import { useMemo, useState, useRef, useEffect } from 'react';
import { FiUser, FiMic, FiImage, FiPlus, FiCheck, FiChevronDown, FiSearch } from 'react-icons/fi';
import * as Select from '@radix-ui/react-select';
import { InterviewerVoiceListApi, InterviewerCreateApi, InterviewerByIdApi, InterviewerUpdateApi } from '@/api/InterviewerApi';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

const MAX_VISIBLE_ITEMS = 200; // safety cap

const CreateInterviewer = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [imagePreview, setImagePreview] = useState(null);
    const [created, setCreated] = useState(false);
    const [search, setSearch] = useState('');
    const fileInputRef = useRef(null);

    const {
        control,
        handleSubmit,
        register,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting, isValid }
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            name: '',
            voiceAgent: '',
            avatar: null
        }
    });

    const watchName = watch('name');
    const watchVoiceAgent = watch('voiceAgent');

    // Fetch voices
    const { data: voices = [] } = useQuery({
        queryKey: ['interviewer-voices-dd'],
        queryFn: InterviewerVoiceListApi,
        select: (res) => res.data
    });

    // If edit mode, fetch interviewer details and populate
    const { data: interviewerRes } = useQuery({
        queryKey: ['interviewer-get-form', id],
        queryFn: () => InterviewerByIdApi({ id }),
        enabled: !!id
    });

    useEffect(() => {
        if (!interviewerRes) return;
        const payload = interviewerRes.data || {};
        reset({
            name: payload.name || '',
            voiceAgent: payload.voice_id ? String(payload.voice_id) : '',
            avatar: null,
            agent_id: payload.agent_id
        });
        setImagePreview(payload.avatar_url || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interviewerRes]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: (form) => InterviewerCreateApi(form)
    });

    const updateMutation = useMutation({
        mutationFn: (form) => InterviewerUpdateApi(form)
    });

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setImagePreview(url);
        setValue('avatar', file);
    };

    // Reset file input so selecting same file again will trigger change
    const handleRemoveAvatar = () => {
        setImagePreview(null);
        setValue('avatar', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onSubmit = async (formValues) => {
        if (!formValues.name.trim() || !formValues.voiceAgent) return;

        setCreated(false);

        const payload = new FormData();
        payload.append('name', formValues.name.trim());
        payload.append('voice_id', formValues.voiceAgent); // adjust key as your backend expects

        payload.append('avatar', formValues.avatar || null);

        try {
            if (isEdit) {
                payload.append('id', id);
                payload.append('agent_id', formValues.agent_id);
                await updateMutation.mutateAsync(payload);
                navigate('/interviewers');
            } else {
                await createMutation.mutateAsync(payload);
                setCreated(true);
                navigate('/interviewers');
            }
        } catch (error) {
            console.error('Save failed:', error);
        }
    };

    // filter + cap
    const filteredAgents = useMemo(() => {
        const q = search.trim().toLowerCase();
        const base = q ? voices?.filter((x) => x.voice_name.toLowerCase().includes(q)) : voices;
        return (base || []).slice(0, MAX_VISIBLE_ITEMS);
    }, [search, voices]);

    const selectedVoice = watchVoiceAgent ? voices.find((v) => String(v.voice_id) === String(watchVoiceAgent)) : null;

    const isSaving = isSubmitting || createMutation.isLoading || updateMutation.isLoading;

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-4xl mx-auto">
                {/* Header */}
                {isEdit ? (
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                            <FiCheck className="text-indigo-500" />
                            Update Interviewer
                        </h1>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">Modify the details and save changes.</p>
                    </div>
                ) : (
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 flex items-center justify-center gap-2">
                            <FiPlus className="text-indigo-500" />
                            Create AI Interviewer
                        </h1>
                        <p className="mt-2 text-xs md:text-sm text-slate-500 max-w-xl mx-auto">
                            Give your interviewer a name, a voice, and a face.
                        </p>
                    </div>
                )}

                {/* Card */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 lg:p-8 flex flex-col gap-6"
                >
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Left Side */}
                        <div className="flex-1 space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                    <FiUser className="text-indigo-500" />
                                    Interviewer name
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Emma from Talent Team"
                                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50/60"
                                    {...register('name', {
                                        required: 'Name is required'
                                    })}
                                />
                                {errors.name && <p className="text-[11px] text-red-500 mt-0.5">{errors.name.message}</p>}
                            </div>

                            {/* Voice agent – Radix Select + Controller + search */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                    <FiMic className="text-indigo-500" />
                                    Voice agent
                                </label>

                                <Controller
                                    name="voiceAgent"
                                    control={control}
                                    rules={{ required: 'Voice agent is required' }}
                                    render={({ field }) => (
                                        <Select.Root value={field.value} onValueChange={field.onChange}>
                                            <Select.Trigger
                                                className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg 
                                                           bg-slate-50/60 flex justify-between items-center
                                                           focus:ring-2 focus:ring-indigo-400 outline-none"
                                            >
                                                <Select.Value placeholder="Select a voice" />
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
                                                    {/* Search */}
                                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 bg-slate-50">
                                                        <FiSearch className="text-xs text-slate-400" />
                                                        <input
                                                            value={search}
                                                            onChange={(e) => setSearch(e.target.value)}
                                                            placeholder="Search voice..."
                                                            className="w-full text-xs outline-none bg-transparent placeholder:text-slate-300"
                                                        />
                                                    </div>

                                                    <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                                        {filteredAgents.length === 0 ? (
                                                            <div className="px-3 py-2 text-[11px] text-slate-400">No voices found.</div>
                                                        ) : (
                                                            filteredAgents.map((agent) => (
                                                                <Select.Item
                                                                    key={agent.voice_id}
                                                                    value={String(agent.voice_id)}
                                                                    className="px-3 py-2 text-sm rounded-md cursor-pointer flex outline-none items-center justify-between hover:bg-indigo-50 focus:bg-indigo-50 text-slate-700"
                                                                >
                                                                    {/* Left: image + name + gender */}
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-[11px] font-medium text-slate-600">
                                                                            {agent.avatar_url ? (
                                                                                <img
                                                                                    src={agent.avatar_url}
                                                                                    alt={agent.voice_name}
                                                                                    className="h-full w-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                (agent.voice_name || '?').charAt(0).toUpperCase()
                                                                            )}
                                                                        </div>

                                                                        <div className="flex flex-col">
                                                                            <Select.ItemText asChild>
                                                                                <span className="text-sm font-medium">
                                                                                    {agent.voice_name}
                                                                                </span>
                                                                            </Select.ItemText>

                                                                            {agent.gender && (
                                                                                <span className="text-[11px] text-slate-400 capitalize">
                                                                                    {agent.gender}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {/* Right: check indicator */}
                                                                    <Select.ItemIndicator>
                                                                        <FiCheck className="text-indigo-600 text-xs" />
                                                                    </Select.ItemIndicator>
                                                                </Select.Item>
                                                            ))
                                                        )}

                                                        {filteredAgents.length === MAX_VISIBLE_ITEMS && (
                                                            <div className="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-100">
                                                                Showing first {MAX_VISIBLE_ITEMS} results. Refine search to see more.
                                                            </div>
                                                        )}
                                                    </Select.Viewport>
                                                </Select.Content>
                                            </Select.Portal>
                                        </Select.Root>
                                    )}
                                />

                                {errors.voiceAgent && <p className="text-[11px] text-red-500 mt-0.5">{errors.voiceAgent.message}</p>}

                                <p className="text-[11px] text-slate-400">
                                    Choose how your interviewer speaks. Use search if the list is long.
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="mt-4 text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-2.5">
                                <span className="font-medium text-slate-700">Preview:</span>{' '}
                                {watchName ? (
                                    <>
                                        <span className="font-semibold">{watchName}</span>
                                        {watchVoiceAgent && selectedVoice && (
                                            <>
                                                {' '}
                                                speaking as{' '}
                                                <span className="font-semibold text-indigo-600">{selectedVoice.voice_name}</span>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    'Set a name and a voice to preview.'
                                )}
                            </div>
                        </div>

                        {/* Right – avatar */}
                        <div className="w-full lg:w-64 flex-shrink-0">
                            <div className="border border-slate-200 rounded-2xl bg-slate-50/60 px-4 py-5 flex flex-col items-center gap-3">
                                <div className="relative h-28 w-28 rounded-full bg-gradient-to-br from-indigo-100 via-slate-50 to-sky-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} className="h-full w-full object-cover" alt="Interviewer avatar" />
                                    ) : (
                                        <FiImage className="text-3xl text-indigo-400" />
                                    )}
                                </div>

                                <label className="w-full">
                                    <span className="inline-flex items-center justify-center gap-1 w-full text-[11px] font-medium px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer">
                                        <FiImage className="text-[12px]" />
                                        {imagePreview ? 'Replace avatar' : 'Upload avatar'}
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>

                                {imagePreview && (
                                    <button type="button" onClick={handleRemoveAvatar} className="text-[11px] text-slate-500 underline">
                                        Remove avatar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        {created && (
                            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                                <FiCheck /> Interviewer created
                            </div>
                        )}

                        {(createMutation.isError || updateMutation.isError) && (
                            <div className="text-[11px] text-red-500">Failed to save interviewer. Please try again.</div>
                        )}

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                className="px-4 py-2 text-xs rounded-lg border border-slate-200 text-slate-600"
                                onClick={() => navigate('/interviewers')}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={!isValid || isSaving}
                                className={[
                                    'px-5 py-2 text-xs rounded-lg font-medium text-white flex items-center gap-1.5',
                                    isValid && !isSaving ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
                                ].join(' ')}
                            >
                                <FiPlus />
                                {isSaving ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save changes' : 'Create interviewer'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateInterviewer;
