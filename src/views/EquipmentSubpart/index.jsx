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

import { EquipmentSubpartListApi, EquipmentSubpartDeleteApi } from '@/api/EquipmentSubpartApi';

const ITEMS_PER_PAGE = 10;

const EquipmentSubpart = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();

    /* ================= QUERY PARAMS ================= */
    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE
    };

    /* ================= FETCH ================= */
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['equipment-subparts', currentPage, searchTerm],
        queryFn: () => EquipmentSubpartListApi(params),
        keepPreviousData: true
    });

    /* ================= DATA ================= */
    const subparts = data?.value?.data?.subpartData || [];
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    /* ================= ACTIONS ================= */
    const handleCreate = () => navigate('/EquipmentSubpart/create');

    const handleEdit = (row) => {
        navigate(`/EquipmentSubpart/edit/${row.subpart_id}`);
    };

    /* ================= DELETE ================= */
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
        deleteMutation.mutate({ subpart_id: showDeleteDialog.subpart_id });
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold">Equipment Subparts</h1>
                        <p className="text-sm text-gray-500">Manage equipment subparts</p>
                    </div>

                    <Button onClick={handleCreate}>+ Create Subpart</Button>
                </div>

                {/* SEARCH */}
                <div className="bg-white border rounded-lg p-4">
                    <InputField
                        placeholder="Search subpart"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load subparts'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3">Equipment</th>
                                <th className="p-3">Subpart Name</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">QR Code</th>
                                <th className="p-3">Created At</th>
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
                            ) : subparts.length ? (
                                subparts.map((row) => (
                                    <tr key={row.subpart_id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{row.equipment_name}</td>
                                        <td className="p-3">{row.subpart_name}</td>
                                        <td className="p-3">{row.description}</td>
                                        <td className="p-3">{row.status}</td>
                                        <td className="p-3">{row.qr_code}</td>
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
                                        No subparts found
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
                itemName={showDeleteDialog?.subpart_name}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default EquipmentSubpart;
