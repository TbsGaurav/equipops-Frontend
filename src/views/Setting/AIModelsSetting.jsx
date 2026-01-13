import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiKey, FiCpu, FiRefreshCw, FiCopy, FiEdit2, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import Button from '@/utils/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationRetellLLMGenerateApi, OrganizationSettingUpsertApi } from '@/api/OrganizationApi';
import { decryptData } from '@/utils/CryptoService';
import { cn } from '@/utils/Utils';

export default function AIModelsSetting({ settingData, encKey }) {
    const mutation = useMutation({ mutationFn: OrganizationSettingUpsertApi });
    const llm_mutation = useMutation({ mutationFn: OrganizationRetellLLMGenerateApi });

    return (
        <div className="space-y-5 sm:space-y-6">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800">AI Model Settings</h3>
            <p className="text-xs sm:text-sm text-gray-500">Manage API keys and generate custom Retell AI LLM models.</p>

            <RetellAISetting
                data={settingData?.['retell_ai_api_key'] || null}
                mutation={mutation}
                data_llm={settingData?.['retell_llm_key'] || null}
                llm_mutation={llm_mutation}
                encKey={encKey}
            />

            <OpenAISetting data={settingData?.['open_ai_api_key'] || null} mutation={mutation} encKey={encKey} />
        </div>
    );
}

AIModelsSetting.propTypes = {
    settingData: PropTypes.any,
    encKey: PropTypes.any
};

const RetellAISetting = ({ data, encKey, mutation, data_llm, llm_mutation }) => {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    console.log(data_llm);

    const { register, handleSubmit, watch, reset } = useForm({
        defaultValues: { id: data?.id || '', key: 'retell_ai_api_key', value: data?.value ? decryptData(data.value, encKey) : '' }
    });

    const valueWatch = watch('value');

    const handleSubmitFC = (formData) => {
        mutation.mutateAsync(formData).then(() => {
            reset();
            setIsEditing(false);
            queryClient.invalidateQueries({
                queryKey: ['Organization-Setting-List']
            });
        });
    };

    const handleCopy = async () => {
        if (!valueWatch) return;
        try {
            await navigator.clipboard.writeText(valueWatch);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col gap-3 bg-white shadow-sm">
            {/* Header with Generate button on right (responsive) */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span className="h-9 w-9 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 flex-shrink-0">
                        <FiKey />
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Retell AI API Key</p>
                        <p className="text-xs text-gray-500">Used for voice generation and TTS processing.</p>
                    </div>
                </div>

                <button
                    type="button"
                    className={cn(
                        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition bg-emerald-200 text-emerald-800  w-full sm:w-auto',
                        llm_mutation.isPending && 'cursor-not-allowed opacity-50'
                    )}
                    onClick={() => llm_mutation.mutateAsync()}
                >
                    <FiRefreshCw className={cn('text-[12px]', llm_mutation.isPending && 'animate-spin')} />
                    Generate LLM
                </button>
            </div>

            {!data || isEditing ? (
                <form className="flex flex-col gap-2" onSubmit={handleSubmit(handleSubmitFC)}>
                    <input
                        {...register('value')}
                        type="password"
                        placeholder="Enter your Retell AI API Key"
                        className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="small"
                            className="px-3"
                            loading={mutation.isPending}
                            disabled={mutation.isPending || !valueWatch}
                        >
                            Save key
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Stored securely</span>
                            <div className="mt-1 text-sm font-mono tracking-widest text-gray-400 select-none">••••••••••••••••••••••</div>
                        </div>
                        <div className="flex items-stretch sm:items-center gap-2 sm:justify-end w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 w-full xs:w-auto"
                            >
                                <FiCopy className="text-[12px]" />
                                Copy
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setCopied(false);
                                }}
                                type="button"
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-transparent text-indigo-600 hover:bg-indigo-50 w-full xs:w-auto"
                            >
                                <FiEdit2 className="text-[12px]" />
                                Change
                            </button>
                        </div>
                    </div>
                    {copied && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                            <FiCheck className="text-[12px]" />
                            Copied to clipboard
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

RetellAISetting.propTypes = {
    data: PropTypes.any,
    encKey: PropTypes.any,
    mutation: PropTypes.any,
    data_llm: PropTypes.any,
    llm_mutation: PropTypes.any
};

const OpenAISetting = ({ data, mutation, encKey }) => {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, watch, reset } = useForm({
        defaultValues: { id: data?.id || '', key: 'open_ai_api_key', value: data?.value ? decryptData(data.value, encKey) : '' }
    });

    const valueWatch = watch('value');

    const handleSubmitFC = (formData) => {
        mutation.mutateAsync(formData).then(() => {
            reset();
            setIsEditing(false);
            queryClient.invalidateQueries({
                queryKey: ['Organization-Setting-List']
            });
        });
    };

    const handleCopy = async () => {
        if (!valueWatch) return;
        try {
            await navigator.clipboard.writeText(valueWatch);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    return (
        <div className="border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col gap-3 bg-white shadow-sm">
            <div className="flex items-center gap-3">
                <span className="h-9 w-9 flex items-center justify-center rounded-lg bg-sky-100 text-sky-600 flex-shrink-0">
                    <FiCpu />
                </span>
                <div>
                    <p className="text-sm font-semibold text-gray-800">OpenAI API Key</p>
                    <p className="text-xs text-gray-500">Used for text generation, scoring, and summaries.</p>
                </div>
            </div>

            {!data || isEditing ? (
                <form className="flex flex-col gap-2" onSubmit={handleSubmit(handleSubmitFC)}>
                    <input
                        {...register('value')}
                        type="password"
                        placeholder="Enter your OpenAI API Key"
                        className="mt-2 w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="small"
                            className="px-3"
                            loading={mutation.isPending}
                            disabled={mutation.isPending || !valueWatch}
                        >
                            Save key
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Stored securely</span>
                            <div className="mt-1 text-sm font-mono tracking-widest text-gray-400 select-none">••••••••••••••••••••••</div>
                        </div>
                        <div className="flex  items-stretch sm:items-center gap-2 sm:justify-end w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700 w-full xs:w-auto"
                            >
                                <FiCopy className="text-[12px]" />
                                Copy
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(true);
                                    setCopied(false);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-transparent text-indigo-600 hover:bg-indigo-50 w-full xs:w-auto"
                            >
                                <FiEdit2 className="text-[12px]" />
                                Change
                            </button>
                        </div>
                    </div>

                    {copied && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                            <FiCheck className="text-[12px]" />
                            Copied to clipboard
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

OpenAISetting.propTypes = {
    data: PropTypes.any,
    encKey: PropTypes.any,
    mutation: PropTypes.any
};
