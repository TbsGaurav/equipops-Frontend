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

    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['equipmentFailures', currentPage, searchTerm],
        queryFn: () => EquipmentFailureListApi(params),
        keepPreviousData: true
    });

    const failures = data?.value?.data?.failureData || [];
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    const handleCreate = () => navigate('/EquipmentFailure/create');
    const handleEdit = (failure) => navigate(`/EquipmentFailure/edit/${failure.failure_id}`);

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
        if (showDeleteDialog) deleteMutation.mutate({ failure_id: showDeleteDialog.failure_id });
    };

    return (
        <Fragment>
            <div className="space-y-6 pb-10">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Equipment Failures</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage, search and organize equipment failures</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} failures
                        </span>
                        <Button variant="contained" color="primary" size="md" onClick={handleCreate}>
                            + New Failure
                        </Button>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <InputField
                        placeholder="Search failure..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-md"
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load failures'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Failure Type</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Equipment Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Subpart</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Failure Date</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider">Downtime (min)</th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center">
                                            <RotatingLines width="32" strokeColor="#6366f1" />
                                        </td>
                                    </tr>
                                ) : failures.length ? (
                                    failures.map((failure) => (
                                        <tr key={failure.failure_id} className="hover:bg-indigo-50/40 transition-colors">
                                            <td className="px-6 py-4">{failure.failure_type}</td>
                                            <td className="px-6 py-4">{failure.equipment_name}</td>
                                            <td className="px-6 py-4">{failure.subpart_name}</td>
                                            <td className="px-6 py-4">{failure.organization_name}</td>
                                            <td className="px-6 py-4 break-words">{failure.description}</td>
                                            <td className="px-6 py-4">{new Date(failure.failure_date).toLocaleString()}</td>
                                            <td className="px-6 py-4">{failure.downtime_minutes}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-3">
                                                    <FiEdit
                                                        className="cursor-pointer text-indigo-600 hover:text-indigo-800"
                                                        onClick={() => handleEdit(failure)}
                                                    />
                                                    <FiTrash2
                                                        className="cursor-pointer text-rose-600 hover:text-rose-800"
                                                        onClick={() => setShowDeleteDialog(failure)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="py-16 text-center text-gray-500">
                                            No failures found
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
                itemName={showDeleteDialog?.failure_type}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default EquipmentFailure;
