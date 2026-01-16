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

import { EquipmentFailureListApi, EquipmentFailureDeleteApi } from '@/api/EquipmentFailureApi';

const ITEMS_PER_PAGE = 10;

const EquipmentFailure = () => {
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
        queryKey: ['equipmentFailures', currentPage, searchTerm],
        queryFn: () => EquipmentFailureListApi(params),
        keepPreviousData: true
    });

    /* ================= DATA ================= */
    const failures = data?.value?.data?.failureData || [];
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    /* ================= ACTIONS ================= */
    const handleCreate = () => navigate('/EquipmentFailure/create');

    const handleEdit = (failure) => {
        navigate(`/EquipmentFailure/edit/${failure.failure_id}`);
    };

    /* ================= DELETE ================= */
    const deleteMutation = useMutation({
        mutationFn: EquipmentFailureDeleteApi,
        onSuccess: () => {
            Toast.success('Failure deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to delete failure');
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate({ failure_id: showDeleteDialog.failure_id });
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-semibold">Equipment Failures</h1>
                        <p className="text-sm text-gray-500">Manage equipment failures</p>
                    </div>

                    <Button onClick={handleCreate}>+ Create Failure</Button>
                </div>

                {/* SEARCH */}
                <div className="bg-white border rounded-lg p-4">
                    <InputField
                        placeholder="Search failure"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load failures'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3">Failure Type</th>
                                <th className="p-3">Equipment Name</th>
                                <th className="p-3">Subpart</th>
                                <th className="p-3">Organization</th>
                                <th className="p-3">Description</th>
                                <th className="p-3">Failure Date</th>
                                <th className="p-3">Downtime (min)</th>
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
                            ) : failures.length ? (
                                failures.map((failure) => (
                                    <tr key={failure.failure_id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{failure.failure_type}</td>
                                        <td className="p-3">{failure.equipment_name}</td>
                                        <td className="p-3">{failure.subpart_name}</td>
                                        <td className="p-3">{failure.organization_name}</td>
                                        <td className="p-3">{failure.description}</td>
                                        <td className="p-3">{new Date(failure.failure_date).toLocaleString()}</td>
                                        <td className="p-3">{failure.downtime_minutes}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <FiEdit className="cursor-pointer text-primary-dark" onClick={() => handleEdit(failure)} />
                                                <FiTrash2
                                                    className="cursor-pointer text-error"
                                                    onClick={() => setShowDeleteDialog(failure)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-gray-500">
                                        No failures found
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
                itemName={showDeleteDialog?.failure_type}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default EquipmentFailure;
