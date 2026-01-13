import { useMemo, useState } from 'react';
import { CardBgColors } from '@/utils/CommonList';
import Model from '@/utils/components/Model';
import InterviewerDetail from './InterviewerDetail';
import { Link, useNavigate } from 'react-router';
import { FiArrowRight, FiPlus, FiEdit2, FiTrash, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { InterviewerDeleteApi, InterviewerListApi } from '@/api/InterviewerApi';
import DeleteAlertDialog from '@/utils/components/ui/DeleteAlertDialog';
import { RotatingLines } from 'react-loader-spinner';
import { canCreate, canDelete, canListenVoice, canUpdate, isSuperAdmin } from '@/utils/Utils';
import { useSelector } from 'react-redux';
import { MasterDropdownListApi } from '@/api/MasterDropdownApi';
import * as Select from '@radix-ui/react-select';
import { Controller, useForm } from 'react-hook-form';

const Interviewers = () => {
    const [detailPopup, setDetailPopup] = useState({ display: false, interviewerId: 0 });
    const [confirmDelete, setConfirmDelete] = useState({ display: false, interviewerId: 0, name: '' });
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const permissions = useSelector((state) => state.user.permissions);
    const isSA = isSuperAdmin();
    const [selectedOrgId, setSelectedOrgId] = useState('');

    const { control } = useForm({
        defaultValues: {
            organization_Id: ''
        }
    });

    const deleteMutation = useMutation({
        mutationFn: InterviewerDeleteApi,
        onSuccess: () => {
            queryClient.invalidateQueries(['Interviewer-list']);
            setConfirmDelete({ display: false, interviewerId: 0, name: '' });
        },
        onError: (err) => {
            console.error('Failed to delete interviewer', err);
        }
    });

    const handleDeleteClick = (e, item) => {
        e.stopPropagation();
        setConfirmDelete({ display: true, interviewerId: item.id, name: item.name });
    };

    const handleEditClick = (e, item) => {
        e.stopPropagation();
        navigate(`/interviewers/edit/${item.id}`);
    };

    const confirmDeleteInterviewer = () => {
        if (!confirmDelete.interviewerId) return;
        deleteMutation.mutateAsync({ id: confirmDelete.interviewerId });
    };

    const { data: dropdownRes, isFetching: isDropdownLoading } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterDropdownListApi,
        select: (res) => res.data
    });

    const { data: interviewers, isFetching } = useQuery({
        queryKey: ['Interviewer-list', selectedOrgId],
        queryFn: () => InterviewerListApi(selectedOrgId)
    });

    const organizations = useMemo(() => dropdownRes?.organizations ?? [], [dropdownRes]);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left Section */}
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Interviewers</h1>

                    <p className="text-sm text-gray-500 max-w-xl">
                        Explore and manage your AI interviewers. Click on any profile to view details.
                    </p>
                </div>

                {/* Right Section: responsive actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:justify-end">
                    {/* Create Interviewer (primary) */}
                    {isSA && (
                        <div className="min-w-[260px]">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Organization</label>

                            <Controller
                                name="organization_Id"
                                control={control}
                                render={({ field }) => (
                                    <Select.Root
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            setSelectedOrgId(val);
                                        }}
                                        disabled={isDropdownLoading}
                                    >
                                        <Select.Trigger
                                            className="
                            w-full h-10 px-3 text-sm
                            flex items-center justify-between
                            border border-gray-300 rounded-md
                            bg-white
                            focus:outline-none focus:ring-2 focus:ring-primary-dark/40
                        "
                                            aria-label="Organization"
                                        >
                                            <Select.Value placeholder="Select organization" />
                                            <Select.Icon>
                                                <FiChevronDown />
                                            </Select.Icon>
                                        </Select.Trigger>

                                        <Select.Portal>
                                            <Select.Content
                                                side="bottom"
                                                align="start"
                                                sideOffset={6}
                                                avoidCollisions={false}
                                                position="popper"
                                                className="
                                bg-white border border-gray-200
                                rounded-md shadow-lg
                                min-w-[var(--radix-select-trigger-width)]
                                z-50
                            "
                                            >
                                                <Select.Viewport className="p-1 max-h-64 overflow-y-auto">
                                                    {isDropdownLoading ? (
                                                        <div className="px-3 py-2 text-xs text-gray-400">Loading organizations…</div>
                                                    ) : (
                                                        organizations.map((org) => (
                                                            <Select.Item
                                                                key={org.id}
                                                                value={org.id}
                                                                className="
                                                relative flex items-center
                                                px-8 py-2 text-sm
                                                rounded-md cursor-pointer
                                                text-gray-700 hover:bg-gray-100
                                            "
                                                            >
                                                                <Select.ItemText>{org.name}</Select.ItemText>

                                                                <Select.ItemIndicator className="absolute left-2">
                                                                    <FiCheck className="text-primary-dark" />
                                                                </Select.ItemIndicator>
                                                            </Select.Item>
                                                        ))
                                                    )}
                                                </Select.Viewport>
                                            </Select.Content>
                                        </Select.Portal>
                                    </Select.Root>
                                )}
                            />
                        </div>
                    )}
                    {!isSA && canCreate(permissions, 'INTERVIEWERS') && (
                        <Link
                            to="create"
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-dark px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 transition w-full sm:w-auto"
                        >
                            <FiPlus className="text-sm" />
                            <span>Create Interviewer</span>
                        </Link>
                    )}
                    {!isSA && canListenVoice(permissions, 'INTERVIEWERS') && (
                        <Link
                            to="voices"
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary-dark px-4 py-2 text-sm font-medium text-primary-dark hover:bg-primary-dark hover:text-white transition w-full sm:w-auto"
                        >
                            <span>Voices</span>
                            <FiArrowRight className="text-sm" />
                        </Link>
                    )}
                </div>
            </div>
            {/* Cards Grid */}
            {isFetching ? (
                <div className="flex items-center justify-center py-20">
                    <RotatingLines
                        visible={true}
                        height="1.5em"
                        width="1.5em"
                        color="currentColor"
                        strokeWidth="5"
                        animationDuration="0.75"
                        ariaLabel="loading-interviewers"
                    />
                    <span className="ml-3 text-gray-600 text-sm">Loading interviewers...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {interviewers?.data.length > 0 ? (
                        interviewers?.data.map((item, index) => {
                            const bgClass = CardBgColors[index % CardBgColors.length];

                            return (
                                <div
                                    key={index}
                                    onClick={() => setDetailPopup({ display: true, interviewerId: item.id })}
                                    className={`group relative cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 bg-white/80 border border-gray-100 ${bgClass}`}
                                >
                                    {/* Image */}
                                    <div className="overflow-hidden">
                                        <img
                                            src={item.avatar_url || null}
                                            alt={item.name}
                                            className="w-full h-64 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Vertical edit/delete icons - show on hover */}
                                    <div className="absolute right-3 top-3 z-20 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        {!isSA && canUpdate(permissions, 'INTERVIEWERS') && (
                                            <button
                                                onClick={(e) => handleEditClick(e, item)}
                                                className="inline-flex items-center justify-center rounded-full p-2 shadow hover:scale-105 transition backdrop-blur-md bg-white/80"
                                                title="Edit interviewer"
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <FiEdit2 className="text-primary" />
                                            </button>
                                        )}
                                        {!isSA && canDelete(permissions, 'INTERVIEWERS') && (
                                            <button
                                                onClick={(e) => handleDeleteClick(e, item)}
                                                className="inline-flex items-center justify-center rounded-full p-2 shadow hover:scale-105 transition backdrop-blur-md bg-white/80"
                                                title="Delete interviewer"
                                                aria-label={`Delete ${item.name}`}
                                            >
                                                <FiTrash className="text-red-600" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Gradient overlay */}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-80 transition-opacity" />

                                    {/* Content */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between text-white">
                                        <div>
                                            <p className="text-sm uppercase tracking-wide text-white/80">Interviewer</p>
                                            <p className="text-lg font-semibold leading-tight">{item.name}</p>
                                        </div>

                                        <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur">
                                            View details →
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16">
                            <div className="mx-auto max-w-2xl text-center">
                                {/* Illustration */}
                                <div className="mx-auto w-40 h-40 flex items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-white shadow-md mb-6">
                                    {/* simple inline svg illustration */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-24 h-24 text-indigo-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                    >
                                        <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                                        <path d="M6 20v-1a4 4 0 014-4h4a4 4 0 014 4v1" />
                                        <path d="M3 6h2" />
                                        <path d="M19 6h2" />
                                        <path d="M7 12l3-2 3 2 3-2 1 1" />
                                    </svg>
                                </div>

                                {/* Headline */}
                                <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">No interviewers yet</h3>

                                {/* Description */}
                                <p className="text-sm text-gray-500 mb-6">
                                    {` You don't have any interviewers created. Create your first AI interviewer to start running mock
                                    interviews and training voice agents.`}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Link
                                        to="create"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary-dark text-white text-sm font-medium shadow-sm hover:bg-primary/90 transition"
                                        aria-label="Create interviewer"
                                    >
                                        <FiPlus className="text-sm" />
                                        Create Interviewer
                                    </Link>

                                    <div className="inline-flex items-center gap-3 text-sm">
                                        <Link
                                            to="voices"
                                            className="px-4 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                                        >
                                            Browse Voices
                                        </Link>
                                    </div>
                                </div>

                                {/* subtle hint */}
                                <p className="mt-6 text-xs text-gray-400">
                                    {`Tip: Add avatars and roles to make your interviewer profiles more discoverable.`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {/* Detail modal */}
            {detailPopup.display && (
                <Model
                    title="Interviewer Detail"
                    widthClass="max-w-xl"
                    onClose={() => setDetailPopup({ display: false, interviewerId: 0 })}
                >
                    <InterviewerDetail InterviewerId={detailPopup.interviewerId} />
                </Model>
            )}

            <DeleteAlertDialog
                // itemName={showDeleteDialog?.name}
                isOpen={Boolean(confirmDelete.display)}
                onCancel={() => setConfirmDelete({ display: false, interviewerId: 0, name: '' })}
                onConfirm={() => confirmDeleteInterviewer()}
                disabled={deleteMutation.isPending}
                loading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Interviewers;
