import { Fragment, useState } from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { useNavigate } from 'react-router';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import DeleteAlertDialog from '@/utils/components/ui/DeleteAlertDialog';
import Toast from '@/utils/toast';
import { RoleListApi, RoleDeleteApi } from '@/api/RoleApi';

const ITEMS_PER_PAGE = 10;

const Role = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();

    const params = {
        search: searchTerm,
        is_active: statusFilter === '' ? null : statusFilter === 'true',
        page: currentPage,
        length: ITEMS_PER_PAGE
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['roles', currentPage, searchTerm, statusFilter],
        queryFn: () => RoleListApi(params),
        keepPreviousData: true
    });

    const roles = data?.data?.roleData || [];
    const totalCount = data?.data?.totalRecords || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    const handleCreate = () => navigate('/Role/create');
    const handleEdit = (row) => navigate(`/Role/edit/${row.role_id}`);
    const handleView = (e, row) => {
        e.stopPropagation();
        navigate(`/Role/view/${row.role_id}`);
    };

    const deleteMutation = useMutation({
        mutationFn: RoleDeleteApi,
        onSuccess: () => {
            Toast.success('Role deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to delete role');
        }
    });

    const handleDelete = () => {
        if (showDeleteDialog) {
            deleteMutation.mutate({ role_id: showDeleteDialog.role_id });
        }
    };

    return (
        <Fragment>
            <div className="space-y-6 pb-10">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Roles</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage, search and organize roles</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} roles
                        </span>
                        <Button variant="contained" color="primary" size="md" onClick={handleCreate}>
                            + New Role
                        </Button>
                    </div>
                </div>

                {/* SEARCH & FILTER */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                    <InputField
                        placeholder="Search role..."
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
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load roles'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Role Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center">
                                            <RotatingLines width="32" strokeColor="#6366f1" />
                                        </td>
                                    </tr>
                                ) : roles.length ? (
                                    roles.map((row) => (
                                        <tr key={row.role_id} className="hover:bg-indigo-50/40 transition-colors">
                                            <td className="px-6 py-4">{row.role_name}</td>
                                            <td className="px-6 py-4">{row.description || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        row.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}
                                                >
                                                    {row.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{new Date(row.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={(e) => handleView(e, row)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="View"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(row)}
                                                        className="text-indigo-600 hover:text-indigo-800"
                                                        title="Edit"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteDialog(row)}
                                                        className="text-rose-600 hover:text-rose-800"
                                                        title="Delete"
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
                                            No roles found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
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

            {/* DELETE DIALOG */}
            <DeleteAlertDialog
                isOpen={Boolean(showDeleteDialog)}
                itemName={showDeleteDialog?.role_name}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default Role;
