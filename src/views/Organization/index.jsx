import { Fragment, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { FiChevronDown, FiCheck, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';

import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import {
    OrganizationDeleteApi,
    OrganizationListApi,
    OrganizationsForSuperAdminApi,
    UpdateOrganizationStatusApi
} from '@/api/OrganizationApi';
import Alert from '@/utils/components/ui/Alert';
import DeleteAlertDialog from '@/utils/components/ui/DeleteAlertDialog';
import { useSelector } from 'react-redux';
import { canCreate, canDelete, canUpdate, canOrgUserView } from '@/utils/Utils';
import { useNavigate } from 'react-router';
import Toast from '@/utils/toast';
import { MdRestore } from 'react-icons/md';

const Organization = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);
    const permissions = useSelector((state) => state.user.permissions);
    const navigate = useNavigate();

    const itemsPerPage = 10;

    const commonParams = {
        Search: searchTerm,
        Page: currentPage,
        Length: itemsPerPage,
        OrderColumn: orderColumn,
        OrderDirection: orderDirection,
        IsActive: filterStatus === 'all' ? null : filterStatus === 'active'
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['organizations', currentPage, searchTerm, filterStatus, orderColumn, orderDirection],
        queryFn: () =>
            canOrgUserView(permissions, 'ORGANIZATION') ? OrganizationsForSuperAdminApi(commonParams) : OrganizationListApi(commonParams),
        keepPreviousData: true
    });

    const organizations = data?.data?.organizationData || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    const handleCreateOrganization = () => {
        navigate('/organization/create');
    };

    const handleEditClick = (e, organization) => {
        e.stopPropagation();
        navigate(`/organization/edit/${organization.id}`);
    };

    const handleViewClick = (e, organization) => {
        e.stopPropagation();
        navigate(`/organization/${organization.id}/users`);
    };

    const deleteMutation = useMutation({
        mutationFn: OrganizationDeleteApi,
        onSuccess: () => {
            Toast.success('Organization deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },

        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete Organization';
            Toast.error(errorMessage);
        }
    });

    const statusMutation = useMutation({
        mutationFn: UpdateOrganizationStatusApi,
        onSuccess: (res) => {
            const message = res?.message ?? 'Organization status updated successfully';
            Toast.success(message);
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (error) => {
            const message = error?.response?.data?.message ?? error?.message ?? 'Failed to update organization status';
            Toast.error(message);
        }
    });

    const handleStatusChange = (org, action) => {
        statusMutation.mutate({
            organizationId: org.id,
            action
        });
    };

    const handleDeleteOrganization = () => {
        deleteMutation.mutateAsync({ id: showDeleteDialog.id }).then(() => {
            refetch();
            setShowDeleteDialog(null);
        });
    };

    const handleDeleteOrganizationUsers = () => {
        handleStatusChange(showDeleteDialog, 'DELETE');
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Title + Subtitle */}
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Organizations</h1>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Manage all organizations, search by name or email, and filter by status.
                        </p>
                    </div>

                    {/* Count + Button */}
                    <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:items-center sm:justify-end md:w-auto">
                        <span className="inline-flex items-center justify-center sm:justify-start rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                            {totalCount} total organizations
                        </span>
                        {canCreate(permissions, 'ORGANIZATION') && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateOrganization}
                                className="w-full sm:w-auto whitespace-nowrap"
                            >
                                + Create Organization
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
                            <div className="flex items-center gap-2">
                                <InputField
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark/40"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                        className="text-sm px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Status Filter - Radix Select */}
                        <div className="w-full sm:w-48">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>

                            <Select.Root
                                value={filterStatus}
                                onValueChange={(val) => {
                                    setFilterStatus(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <Select.Trigger
                                    className="
                                    w-full h-10 px-3 text-sm
                                    flex items-center justify-between 
                                    border border-gray-300 rounded-md bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary-dark/40
                                "
                                    aria-label="Status"
                                >
                                    <Select.Value placeholder="All Status" />
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
                                            {/* All */}
                                            <Select.Item
                                                value="all"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>All Status</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>

                                            {/* Active */}
                                            <Select.Item
                                                value="active"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>Active</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>

                                            {/* Inactive */}
                                            <Select.Item
                                                value="inactive"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>Inactive</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                        </Select.Viewport>
                                    </Select.Content>
                                </Select.Portal>
                            </Select.Root>
                        </div>
                    </div>

                    {/* Sort helper */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                            Tip: Click on <b>Name</b> or <b>Created</b> column to sort.
                        </p>
                        <span className="text-xs inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                            {orderColumn === 'name' ? 'Name' : 'Created'} • {orderDirection === 'ASC' ? 'ASC' : 'DESC'}
                        </span>
                    </div>
                </div>

                {/* Error */}
                {isError && <Alert.Error className="mt-1">{error?.message || 'Failed to load organizations'}</Alert.Error>}

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('name');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Name {orderColumn === 'name' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-3 text-left font-semibold">Email</th>
                                    {canOrgUserView(permissions, 'ORGANIZATION') && (
                                        <th className="p-3 text-left font-semibold">Website</th>
                                    )}
                                    {canOrgUserView(permissions, 'ORGANIZATION') && <th className="p-3 text-left font-semibold">Phone</th>}
                                    {canOrgUserView(permissions, 'ORGANIZATION') && (
                                        <th className="p-3 text-left font-semibold">Industry</th>
                                    )}
                                    <th className="p-3 text-left font-semibold">Status</th>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('createdAt');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Created {orderColumn === 'createdAt' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <RotatingLines
                                                    visible={true}
                                                    height="24"
                                                    width="24"
                                                    color="currentColor"
                                                    strokeWidth="5"
                                                    animationDuration="0.75"
                                                    ariaLabel="rotating-lines-loading"
                                                />
                                                Loading organizations...
                                            </div>
                                        </td>
                                    </tr>
                                ) : organizations.length > 0 ? (
                                    organizations.map((org) => (
                                        <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{org.name}</td>
                                            <td className="p-3 text-gray-600">{org.email}</td>
                                            {canOrgUserView(permissions, 'ORGANIZATION') && (
                                                <td className="p-3">
                                                    {org.website_Url !== '-' ? (
                                                        <a
                                                            href={org.website_Url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 underline"
                                                        >
                                                            {org.website_Url}
                                                        </a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                            )}
                                            {canOrgUserView(permissions, 'ORGANIZATION') && <td className="p-3">{org.phone_No}</td>}
                                            {canOrgUserView(permissions, 'ORGANIZATION') && <td className="p-3">{org.industry_Type}</td>}
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full font-medium ${org.is_Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                                                >
                                                    {org.is_Active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600">{new Date(org.created_Date).toLocaleDateString()}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    {canOrgUserView(permissions, 'ORGANIZATION') && (
                                                        <button
                                                            title="View organization users"
                                                            className="text-[#FF8C00] hover:text-[#FF7000] transition"
                                                            onClick={(e) => handleViewClick(e, org)}
                                                        >
                                                            <FiEye size={16} />
                                                        </button>
                                                    )}
                                                    {canUpdate(permissions, 'ORGANIZATION') && (
                                                        <button
                                                            className="text-primary-dark hover:text-primary-dark/70 transition"
                                                            title="Edit"
                                                            onClick={(e) => handleEditClick(e, org)}
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                    )}
                                                    {canDelete(permissions, 'ORGANIZATION') &&
                                                        (canOrgUserView(permissions, 'ORGANIZATION') && org.is_Delete ? (
                                                            <button
                                                                className="text-green-600 hover:text-green-800 transition"
                                                                title="Restore Organization"
                                                                onClick={() => handleStatusChange(org, 'UNDELETE')}
                                                            >
                                                                <MdRestore size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="text-error hover:text-error/70 transition"
                                                                title="Delete Organization"
                                                                onClick={() => setShowDeleteDialog(org)}
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        {canOrgUserView(permissions, 'ORGANIZATION') ? (
                                            <td colSpan={8} className="p-10">
                                                <div className="flex flex-col items-center text-gray-500">
                                                    <div className="text-4xl mb-2">📂</div>
                                                    <p className="font-semibold text-gray-600">No organizations found</p>
                                                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        ) : (
                                            <td colSpan={5} className="p-10">
                                                <div className="flex flex-col items-center text-gray-500">
                                                    <div className="text-4xl mb-2">📂</div>
                                                    <p className="font-semibold text-gray-600">No organizations found</p>
                                                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {!isLoading && totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {endIndex} of {totalCount}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 rounded-md border ${currentPage === page ? 'bg-primary-dark text-white' : 'border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteAlertDialog
                itemName={showDeleteDialog?.name}
                isOpen={Boolean(showDeleteDialog)}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={() => {
                    canOrgUserView(permissions, 'ORGANIZATION') ? handleDeleteOrganizationUsers() : handleDeleteOrganization();
                }}
                disabled={deleteMutation.isPending || statusMutation.isPending}
                loading={deleteMutation.isPending || statusMutation.isPending}
            />
        </Fragment>
    );
};

export default Organization;
