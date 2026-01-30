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

import { DashboardCategoryListApi, DashboardCategoryDeleteApi } from '@/api/DashboardCategoryApi';
import { Organization1DropdownApi1 } from '@/api/DropdownApi';

const ITEMS_PER_PAGE = 10;

const DashboardCategoryIndex = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);
    const navigate = useNavigate();

    /* ===================== LIST API ===================== */
    const params = {
        Search: search || null,
        Page: currentPage,
        Length: ITEMS_PER_PAGE,
        OrderColumn: 'name',
        OrderDirection: 'ASC'
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['dashboard-categories', currentPage, search],
        queryFn: () => DashboardCategoryListApi(params),
        keepPreviousData: true
    });

    const categories = data?.data?.data || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    /* ===================== ORGANIZATION (DYNAMIC) ===================== */
    const { data: orgData = [] } = useQuery({
        queryKey: ['organization-dropdown'],
        queryFn: async () => {
            const res = await Organization1DropdownApi1();
            return res?.data || [];
        }
    });

    const orgMap = {};
    orgData.forEach((o) => {
        orgMap[o.organization_id] = o.name;
    });

    /* ===================== DELETE ===================== */
    const deleteMutation = useMutation({
        mutationFn: DashboardCategoryDeleteApi,
        onSuccess: () => {
            Toast.success('Category deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: () => Toast.error('Failed to delete category')
    });

    const handleDelete = () => {
        deleteMutation.mutate(showDeleteDialog.dashboard_category_id);
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Dashboard Categories</h1>
                        <p className="text-sm text-gray-500">Manage dashboard categories easily.</p>
                    </div>
                    <Button onClick={() => navigate('/dashboard-category/create')}>+ Create</Button>
                </div>

                {/* Search */}
                <InputField
                    placeholder="Search category..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                {isError && <Alert.Error>{error?.response?.data?.message || error?.message || 'Failed to load categories'}</Alert.Error>}

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-left font-semibold">Organization</th>
                                <th className="p-3 text-left font-semibold">Name</th>
                                <th className="p-3 text-left font-semibold">Description</th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center">
                                        <RotatingLines width="24" />
                                    </td>
                                </tr>
                            ) : categories.length > 0 ? (
                                categories.map((c) => (
                                    <tr key={c.dashboard_category_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3">{orgMap[c.organization_id] || '-'}</td>
                                        <td className="p-3 font-medium">{c.name}</td>
                                        <td className="p-3">{c.description || '-'}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <FiEye
                                                    className="cursor-pointer text-blue-600"
                                                    onClick={() => navigate(`/dashboard-category/view/${c.dashboard_category_id}`)}
                                                />
                                                <FiEdit
                                                    className="cursor-pointer text-indigo-600"
                                                    onClick={() => navigate(`/dashboard-category/edit/${c.dashboard_category_id}`)}
                                                />
                                                <FiTrash2 className="cursor-pointer text-red-500" onClick={() => setShowDeleteDialog(c)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-10 text-center text-gray-500">
                                        No categories found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (SAME AS EQUIPMENT) */}
                {totalPages > 0 && (
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {endIndex} of {totalCount}
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                                className="px-3 py-2 border rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                                className="px-3 py-2 border rounded-md disabled:opacity-50"
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
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default DashboardCategoryIndex;
