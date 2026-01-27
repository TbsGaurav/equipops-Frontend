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
import { EquipmentCategoryListApi, EquipmentCategoryDeleteApi } from '@/api/EquipmentCategoryApi';

const ITEMS_PER_PAGE = 10;

const EquipmentCategory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('category_name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();

    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE,
        orderColumn,
        orderDirection
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['equipmentCategories', currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => EquipmentCategoryListApi(params),
        keepPreviousData: true
    });

    const categories = data?.value?.data?.categoryData || [];
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    const handleCreate = () => navigate('/EquipmentCategory/create');
    const handleEdit = (cat) => navigate(`/EquipmentCategory/edit/${cat.category_id}`);
    const handleView = (e, cat) => {
        e.stopPropagation();
        navigate(`/EquipmentCategory/view/${cat.category_id}`);
    };

    const deleteMutation = useMutation({
        mutationFn: EquipmentCategoryDeleteApi,
        onSuccess: () => {
            Toast.success('Category deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to delete category');
        }
    });

    const handleDelete = () => {
        if (showDeleteDialog) deleteMutation.mutate({ category_id: showDeleteDialog.category_id });
    };

    return (
        <Fragment>
            <div className="space-y-6 pb-10">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Equipment Categories</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage, search and organize equipment categories</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} categories
                        </span>
                        <Button variant="contained" color="primary" size="md" onClick={handleCreate}>
                            + New Category
                        </Button>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <InputField
                        placeholder="Search category..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-md"
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load categories'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('category_name');
                                            setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                        }}
                                        className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        Category Name {orderColumn === 'category_name' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('created_at');
                                            setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                        }}
                                        className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        Created {orderColumn === 'created_at' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
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
                                ) : categories.length ? (
                                    categories.map((cat) => (
                                        <tr key={cat.category_id} className="hover:bg-indigo-50/40 transition-colors">
                                            <td className="px-6 py-4">{cat.category_name}</td>
                                            <td className="px-6 py-4">{cat.organization_name || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 break-words">{cat.description || '-'}</td>
                                            <td className="px-6 py-4">{new Date(cat.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={(e) => handleView(e, cat)}
                                                        className="cursor-pointer text-green-600 hover:text-green-800"
                                                        title="View Category"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                    <FiEdit
                                                        className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                                                        onClick={() => handleEdit(cat)}
                                                    />
                                                    <FiTrash2
                                                        className="cursor-pointer text-rose-600 hover:text-rose-800"
                                                        onClick={() => setShowDeleteDialog(cat)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-500">
                                            No categories found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* PAGINATION */}
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

            {/* DELETE DIALOG */}
            <DeleteAlertDialog
                isOpen={Boolean(showDeleteDialog)}
                itemName={showDeleteDialog?.category_name}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default EquipmentCategory;
