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
import { EquipmentSubpartListApi, EquipmentSubpartDeleteApi } from '@/api/EquipmentSubpartApi';

const ITEMS_PER_PAGE = 10;

const EquipmentSubpart = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();

    const params = {
        search: searchTerm,
        status: statusFilter === '' ? null : statusFilter === 'true',
        page: currentPage,
        length: ITEMS_PER_PAGE
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['equipmentSubparts', currentPage, searchTerm, statusFilter],
        queryFn: () => EquipmentSubpartListApi(params),
        keepPreviousData: true
    });

    const subparts = data?.value?.data?.subpartData || [];
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    const handleCreate = () => navigate('/EquipmentSubpart/create');
    const handleEdit = (row) => navigate(`/EquipmentSubpart/edit/${row.subpart_id}`);
    const handleView = (e, row) => {
        e.stopPropagation();
        navigate(`/EquipmentSubpart/view/${row.subpart_id}`);
    };

    const deleteMutation = useMutation({
        mutationFn: EquipmentSubpartDeleteApi,
        onSuccess: () => {
            Toast.success('Subpart deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to delete subpart');
        }
    });

    const handleDelete = () => {
        if (showDeleteDialog) deleteMutation.mutate({ subpart_id: showDeleteDialog.subpart_id });
    };

    return (
        <Fragment>
            <div className="space-y-6 pb-10">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Equipment Subparts</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage, search and organize equipment subparts</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} subparts
                        </span>
                        <Button variant="contained" color="primary" size="md" onClick={handleCreate}>
                            + New Subpart
                        </Button>
                    </div>
                </div>

                {/* SEARCH + STATUS FILTER */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex gap-4">
                    <InputField
                        placeholder="Search subpart..."
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
                        className="border rounded-md px-3 py-2 text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load subparts'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Equipment</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Subpart Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">QR Code</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Created At</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <RotatingLines width="32" strokeColor="#6366f1" />
                                        </td>
                                    </tr>
                                ) : subparts.length ? (
                                    subparts.map((row) => (
                                        <tr key={row.subpart_id} className="hover:bg-indigo-50/40 transition-colors">
                                            <td className="px-6 py-4">{row.equipment_name}</td>
                                            <td className="px-6 py-4">{row.subpart_name}</td>
                                            <td className="px-6 py-4 break-words">{row.description}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${row.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                >
                                                    {row.status ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 break-all">{row.qr_code}</td>
                                            <td className="px-6 py-4">{new Date(row.created_at).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <button
                                                        onClick={(e) => handleView(e, row)}
                                                        className="cursor-pointer text-green-600 hover:text-green-800"
                                                        title="View Failure"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                    <FiEdit
                                                        className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                                                        onClick={() => handleEdit(row)}
                                                    />
                                                    <FiTrash2
                                                        className="cursor-pointer text-rose-600 hover:text-rose-800"
                                                        onClick={() => setShowDeleteDialog(row)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-500">
                                            No subparts found
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

            <DeleteAlertDialog
                isOpen={Boolean(showDeleteDialog)}
                itemName={showDeleteDialog?.subpart_name}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default EquipmentSubpart;
