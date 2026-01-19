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
import { EquipmentCategoryListApi, EquipmentCategoryDeleteApi } from '@/api/EquipmentCategoryApi';

const ITEMS_PER_PAGE = 10;

const EquipmentCategory = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('category_name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();

    /* ================= QUERY PARAMS ================= */
    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE,
        orderColumn,
        orderDirection
    };

    /* ================= FETCH ================= */
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['equipmentCategories', currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => EquipmentCategoryListApi(params),
        keepPreviousData: true
    });

    /* ================= DATA ================= */
    const categories = data?.value?.data?.categoryData || [];
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    /* ================= NAVIGATION ================= */
    const handleCreate = () => navigate('/EquipmentCategory/create');

    const handleEdit = (e, cat) => {
        e.stopPropagation();
        navigate(`/EquipmentCategory/edit/${cat.category_id}`);
    };

    /* ================= DELETE ================= */
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
        deleteMutation.mutate({ category_id: showDeleteDialog.category_id });
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* HEADER */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Equipment Categories</h1>
                        <p className="text-sm text-gray-500">Manage equipment categories</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100">{totalCount} total categories</span>
                        <Button onClick={handleCreate}>+ Create Category</Button>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="bg-white border rounded-lg p-4">
                    <InputField
                        placeholder="Search category"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load categories'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full text-sm table-fixed">
                        {/* ✅ COLUMN WIDTH FIX */}
                        <colgroup>
                            <col className="w-[25%]" /> {/* Category Name */}
                            <col className="w-[15%]" /> {/* Organization */}
                            <col className="w-[35%]" /> {/* Description */}
                            <col className="w-[15%]" /> {/* Created */}
                            <col className="w-[10%]" /> {/* Actions */}
                        </colgroup>

                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th
                                    className="p-3 cursor-pointer text-left"
                                    onClick={() => {
                                        setOrderColumn('category_name');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                >
                                    Category Name {orderColumn === 'category_name' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th className="p-3 text-left">Organization</th>
                                <th className="p-3 text-left">Description</th>
                                <th
                                    className="p-3 cursor-pointer text-left"
                                    onClick={() => {
                                        setOrderColumn('created_at');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                >
                                    Created {orderColumn === 'created_at' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center">
                                        <RotatingLines width="24" />
                                    </td>
                                </tr>
                            ) : categories.length ? (
                                categories.map((cat) => (
                                    <tr key={cat.category_id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{cat.category_name}</td>
                                        <td className="p-3">{cat.organization_name || '-'}</td>
                                        <td className="p-3 break-words">{cat.description || '-'}</td>
                                        <td className="p-3">{new Date(cat.created_at).toLocaleDateString()}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <FiEdit className="cursor-pointer text-primary-dark" onClick={(e) => handleEdit(e, cat)} />
                                                <FiTrash2 className="cursor-pointer text-error" onClick={() => setShowDeleteDialog(cat)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No categories found
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
