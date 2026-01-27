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

/* ===== Temporary Hardcode ===== */
const ORG_MAP = { 1: 'FTP Solution' };

const DashboardCategoryIndex = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);
    const navigate = useNavigate();

    const params = {
        Search: search || null,
        Page: page,
        Length: 10,
        OrderColumn: 'name',
        OrderDirection: 'ASC'
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['dashboard-categories', page, search],
        queryFn: () => DashboardCategoryListApi(params)
    });

    const categories = data?.data?.data || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / 10);

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
            {/* Header */}
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-semibold">Dashboard Categories</h1>
                <Button onClick={() => navigate('/dashboard-category/create')}>+ Create</Button>
            </div>

            {/* Search */}
            <InputField
                placeholder="Search category..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                }}
            />

            {isError && <Alert.Error>{error?.response?.data?.message || error?.message || 'Failed to load categories'}</Alert.Error>}

            {/* Table */}
            <div className="bg-white rounded-lg mt-4 overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-left">Organization</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="p-6 text-center">
                                    <RotatingLines width="24" />
                                </td>
                            </tr>
                        ) : categories.length > 0 ? (
                            categories.map((c) => (
                                <tr key={c.dashboard_category_id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="p-3">{ORG_MAP[c.organization_id] || c.organization_id}</td>
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
                                <td colSpan={4} className="p-6 text-center text-gray-500">
                                    No categories found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                    <p className="text-sm text-gray-600">
                        Page {page} of {totalPages} (Total {totalCount})
                    </p>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="px-3 py-2 border rounded">
                            Previous
                        </button>
                        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-2 border rounded">
                            Next
                        </button>
                    </div>
                </div>
            )}

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
