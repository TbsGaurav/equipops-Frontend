import { Fragment, useMemo, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { FiChevronDown, FiCheck, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';

import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import { UserDeleteApi, UserListApi } from '@/api/UserApi';
import Alert from '@/utils/components/ui/Alert';
import Model from '@/utils/components/Model';
import UserForm from './UserForm';
import DeleteAlertDialog from '@/utils/components/ui/DeleteAlertDialog';
import useAuth from '@/hooks/useAuth';
import { MasterDropdownListApi } from '@/api/MasterDropdownApi';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { canCreate, canDelete, canUpdate } from '@/utils/Utils';
import Toast from '@/utils/toast';

const UserManagement = () => {
    const { user } = useAuth();
    const roleName = user?.roleName;
    const isSuperAdmin = roleName === 'Super Admin';

    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showFormModal, setShowFormModal] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const itemsPerPage = 10;
    const permissions = useSelector((state) => state.user.permissions);

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['users', currentPage, searchTerm, filterRole, filterStatus, orderColumn, orderDirection],
        queryFn: () =>
            UserListApi({
                search: searchTerm,
                page: currentPage,
                length: itemsPerPage,
                orderColumn: orderColumn,
                orderDirection: orderDirection,
                role: filterRole === 'all' ? null : filterRole,
                is_active: filterStatus === 'all' ? null : filterStatus === 'active'
            }),
        keepPreviousData: true
    });

    const users = data?.data?.userData || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    const navigate = useNavigate();

    const handleCreateUser = () => {
        navigate('/user-management/create');
    };

    // const deleteMutation = useMutation({ mutationFn: UserDeleteApi });
    const deleteMutation = useMutation({
        mutationFn: UserDeleteApi,
        onSuccess: () => {
            Toast.success('User deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },

        onError: (error) => {
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete User';
            Toast.error(errorMessage);
        }
    });

    const handleDeleteUser = () => {
        if (!showDeleteDialog?.id) return;
        deleteMutation.mutateAsync({ id: showDeleteDialog.id }).then(() => {
            refetch();
            setShowDeleteDialog(null);
        });
    };

    const { data: dropdownRes, isFetching: isDropdownLoading } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterDropdownListApi,
        select: (res) => res.data
    });

    const roles = useMemo(() => dropdownRes?.roles ?? [], [dropdownRes]);

    const handleEditClick = (e, user) => {
        e.stopPropagation();
        navigate(`/user-management/edit/${user.id}`);
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Users</h1>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Manage application users, search by name or email, filter by role or status.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:items-center sm:justify-end md:w-auto">
                        <span className="inline-flex items-center justify-center sm:justify-start rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                            {totalCount} total users
                        </span>
                        {canCreate(permissions, 'USERMANAGEMENT') && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleCreateUser}
                                className="w-full sm:w-auto whitespace-nowrap"
                            >
                                + Create User
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search + Filters */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
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

                        {isSuperAdmin && (
                            <div className="w-full sm:w-48">
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Role</label>

                                <Select.Root
                                    value={filterRole}
                                    onValueChange={(val) => {
                                        setFilterRole(val);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <Select.Trigger
                                        className="w-full h-10 px-3 text-sm flex items-center justify-between border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/40"
                                        aria-label="Role"
                                    >
                                        <Select.Value placeholder="All Roles" />
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
                                                <Select.Item
                                                    value="all"
                                                    className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Select.ItemText>All Roles</Select.ItemText>
                                                    <Select.ItemIndicator className="absolute left-2">
                                                        <FiCheck className="text-primary-dark" />
                                                    </Select.ItemIndicator>
                                                </Select.Item>
                                                {/* Dynamic roles */}
                                                {isDropdownLoading ? (
                                                    <div className="px-3 py-2 text-xs text-gray-400"> Loading roles... </div>
                                                ) : (
                                                    roles.map((role) => (
                                                        <Select.Item
                                                            key={role.id}
                                                            value={role.name}
                                                            className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                                        >
                                                            <Select.ItemText>{role.name}</Select.ItemText>
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
                            </div>
                        )}

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
                                    className="w-full h-10 px-3 text-sm flex items-center justify-between border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/40"
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
                                            <Select.Item
                                                value="all"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>All Status</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
                                            <Select.Item
                                                value="active"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>Active</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                            Tip: Click on <b>Name</b>, <b>Email</b> or <b>Created</b> to sort.
                        </p>
                        <span className="text-xs inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                            {orderColumn === 'name' ? 'Name' : orderColumn === 'email' ? 'Email' : 'Created'} •{' '}
                            {orderDirection === 'ASC' ? 'ASC' : 'DESC'}
                        </span>
                    </div>
                </div>

                {/* Error */}
                {isError && <Alert.Error className="mt-1">{error?.message || 'Failed to load users'}</Alert.Error>}

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
                                    <th
                                        onClick={() => {
                                            setOrderColumn('email');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Email {orderColumn === 'email' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-3 text-left font-semibold">Role</th>
                                    <th className="p-3 text-left font-semibold">Status</th>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('created_date');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Created {orderColumn === 'created_date' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-3 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center">
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
                                                Loading users...
                                            </div>
                                        </td>
                                    </tr>
                                ) : users.length > 0 ? (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{user.user_name}</td>
                                            <td className="p-3 text-gray-600">{user.email}</td>
                                            <td className="p-3 text-gray-600">{user.role || '-'}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600">{new Date(user.created_date).toLocaleDateString()}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    {canUpdate(permissions, 'USERMANAGEMENT') && (
                                                        <button
                                                            className="text-primary-dark hover:text-primary-dark/70 transition"
                                                            title="Edit"
                                                            onClick={(e) => handleEditClick(e, user)}
                                                        >
                                                            <FiEdit size={16} />
                                                        </button>
                                                    )}
                                                    {canDelete(permissions, 'USERMANAGEMENT') && (
                                                        <button
                                                            className="text-error hover:text-error/70 transition"
                                                            title="Delete"
                                                            onClick={() => setShowDeleteDialog(user)}
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-10">
                                            <div className="flex flex-col items-center text-gray-500">
                                                <div className="text-4xl mb-2">👥</div>
                                                <p className="font-semibold text-gray-600">No users found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
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

            {showFormModal && (
                <Model title={typeof showFormModal === 'string' ? 'Create User' : 'Edit User'} onClose={() => setShowFormModal(null)}>
                    <UserForm onClose={() => setShowFormModal(null)} userId={showFormModal.id} />
                </Model>
            )}

            <DeleteAlertDialog
                itemName={showDeleteDialog?.name}
                isOpen={Boolean(showDeleteDialog)}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={() => handleDeleteUser()}
                disabled={deleteMutation.isPending}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default UserManagement;
