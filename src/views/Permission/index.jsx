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

    const handleEdit = (row) => {
        navigate(`/permission/edit/${row.permission_id}`);
    };

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
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold">Permissions</h1>
                        <p className="text-sm text-gray-500">Manage system permissions</p>
                    </div>

                    <Button onClick={handleCreate}>+ Create Permission</Button>
                </div>

                {/* SEARCH */}
                <div className="bg-white border rounded-lg p-4 flex gap-4">
                    <InputField
                        placeholder="Search permission"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {isError && <Alert.Error>{error?.message}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full text-sm table-fixed">
                        {/* ✅ COLUMN WIDTH FIX */}
                        <colgroup>
                            <col className="w-[18%]" /> {/* Permission Code */}
                            <col className="w-[22%]" /> {/* Description */}
                            <col className="w-[10%]" /> {/* Status */}
                            <col className="w-[12%]" /> {/* Created At */}
                            <col className="w-[8%]" /> {/* Actions */}
                        </colgroup>

                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left">Permission Code</th>
                                <th className="p-3 text-left">Description</th>
                                <th className="p-3 text-left">Status</th>
                                <th className="p-3 text-left">Created At</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center">
                                        <RotatingLines width="24" />
                                    </td>
                                </tr>
                            ) : permissions.length ? (
                                permissions.map((row) => (
                                    <tr key={row.permission_id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{row.permission_code}</td>
                                        <td className="p-3 break-words">{row.description}</td>
                                        <td className="p-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {row.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3">{new Date(row.created_at).toLocaleString()}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <FiEdit className="cursor-pointer text-primary-dark" onClick={() => handleEdit(row)} />
                                                <FiTrash2 className="cursor-pointer text-error" onClick={() => setShowDeleteDialog(row)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No permission found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION */}
                {totalPages > 0 && (
                    <div className="flex justify-between items-center">
                        <p className="text-sm">
                            Showing {startIndex + 1} to {endIndex} of {totalCount}
                        </p>

                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3 py-2 border rounded-md"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3 py-2 border rounded-md"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <DeleteAlertDialog
                itemName={showDeleteDialog?.permission_code}
                isOpen={!!showDeleteDialog}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default Permission;
