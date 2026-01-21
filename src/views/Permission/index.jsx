import { Fragment, useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { useNavigate } from 'react-router';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import DeleteAlertDialog from '@/utils/components/ui/DeleteAlertDialog';
import Toast from '@/utils/toast';
import { PermissionListApi, PermissionDeleteApi } from '@/api/PermissionApi';
import clsx from 'clsx';

const Permission = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();
    const ITEMS_PER_PAGE = 10;

    const params = {
        search: searchTerm,
        status: statusFilter === '' ? null : statusFilter === 'true',
        page: currentPage,
        length: ITEMS_PER_PAGE
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['permissions', currentPage, searchTerm, statusFilter],
        queryFn: () => PermissionListApi(params),
        keepPreviousData: true
    });

    const permissions = data?.data?.permissionData || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    const handleCreate = () => navigate('/permission/create');
    const handleEdit = (row) => navigate(`/permission/edit/${row.permission_id}`);

    const deleteMutation = useMutation({
        mutationFn: PermissionDeleteApi,
        onSuccess: () => {
            Toast.success('Permission deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to delete permission');
        }
    });

    const handleDelete = () => {
        if (showDeleteDialog) {
            deleteMutation.mutate({ permission_id: showDeleteDialog.permission_id });
        }
    };

    return (
        <Fragment>
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Permissions</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage, search and organize system permissions</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} permissions
                        </span>

                        <Button variant="contained" color="primary" size="md" onClick={handleCreate} className="font-medium shadow-sm">
                            + New Permission
                        </Button>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                    <InputField
                        placeholder="Search permission..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-md"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border rounded-md px-5 py-2 text-sm max-w-xs"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {/* Error */}
                {isError && (
                    <Alert.Error className="rounded-xl border-l-4 border-l-red-500">
                        {error?.message || 'Failed to load permissions'}
                    </Alert.Error>
                )}

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase">Permission Code</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase">Created</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <RotatingLines width="32" strokeColor="#6366f1" />
                                        </td>
                                    </tr>
                                ) : permissions.length > 0 ? (
                                    permissions.map((row) => (
                                        <tr key={row.permission_id} className="hover:bg-indigo-50/40 transition-colors">
                                            <td className="px-6 py-4">{row.permission_code}</td>
                                            <td className="px-6 py-4 text-gray-600 break-words">{row.description}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={clsx(
                                                        'px-3 py-1 rounded-full text-xs font-medium',
                                                        row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    )}
                                                >
                                                    {row.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(row.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="text-indigo-600 hover:text-indigo-800 p-1 rounded hover:bg-indigo-50"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteDialog(row)}
                                                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-500">
                                            No permissions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
                        <div>
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span>{' '}
                            of <span className="font-medium">{totalCount}</span>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outlined" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                                Previous
                            </Button>

                            <Button
                                variant="outlined"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteAlertDialog
                itemName={showDeleteDialog?.permission_code}
                isOpen={Boolean(showDeleteDialog)}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default Permission;
