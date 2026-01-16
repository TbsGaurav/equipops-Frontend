import { Fragment, useState } from 'react';
import { FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';

import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import DeleteAlertDialog from '@/utils/components/ui/DeleteAlertDialog';
import Toast from '@/utils/toast';

import { EquipmentApiUrl, EquipmentDeleteApi } from '@/api/EquipmentApi';
import { useNavigate } from 'react-router';

/* ===== Hardcode (temporary) ===== */
const CATEGORY_MAP = {
    1: 'MRI Machines',
    2: 'CT Scanners',
    3: 'X-Ray Machines',
    4: 'Ventilators',
    5: 'Ultrasound Machines'
};

const ORG_MAP = {
    1: 'FTP Solution'
};

const Equipment = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const navigate = useNavigate();
    const itemsPerPage = 10;

    const params = {
        Search: searchTerm,
        Page: currentPage,
        Length: itemsPerPage,
        OrderColumn: orderColumn,
        OrderDirection: orderDirection
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['equipments', currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => EquipmentApiUrl(params),
        keepPreviousData: true
    });

    const equipments = data?.data?.equipmentData || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    const handleCreate = () => navigate('/equipment/create');

    const handleEdit = (e, eq) => {
        e.stopPropagation();
        navigate(`/equipment/edit/${eq.EquipmentId}`);
    };

    const deleteMutation = useMutation({
        mutationFn: EquipmentDeleteApi,
        onSuccess: () => {
            Toast.success('Equipment deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (error) => {
            Toast.error(error?.response?.data?.message || error?.message || 'Failed to delete equipment');
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate(showDeleteDialog.EquipmentId);
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Equipments</h1>
                        <p className="text-sm text-gray-500">Manage equipments, search and organize them easily.</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100">{totalCount} total equipments</span>
                        <Button onClick={handleCreate}>+ Create Equipment</Button>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <InputField
                        placeholder="Search by name, QR code or location"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Error */}
                {isError && <Alert.Error>{error?.message || 'Failed to load equipments'}</Alert.Error>}

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-left font-semibold">Organization</th>
                                <th className="p-3 text-left font-semibold">Category</th>
                                <th
                                    onClick={() => {
                                        setOrderColumn('name');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                    className="p-3 text-left font-semibold cursor-pointer"
                                >
                                    Name {orderColumn === 'name' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th className="p-3 text-left font-semibold">Type</th>
                                <th className="p-3 text-left font-semibold">Location</th>
                                <th className="p-3 text-left font-semibold">Purchase Date</th>
                                <th className="p-3 text-left font-semibold">Status</th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center">
                                        <RotatingLines width="24" strokeWidth="5" />
                                    </td>
                                </tr>
                            ) : equipments.length > 0 ? (
                                equipments.map((eq) => (
                                    <tr key={eq.EquipmentId} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{ORG_MAP[eq.OrganizationId] || eq.OrganizationId || '-'}</td>
                                        <td className="p-3">{CATEGORY_MAP[eq.CategoryId] || eq.CategoryId || '-'}</td>
                                        <td className="p-3 font-medium">{eq.Name}</td>
                                        <td className="p-3">{eq.Type ?? '-'}</td>
                                        <td className="p-3">{eq.Location ?? '-'}</td>
                                        <td className="p-3">{eq.PurchaseDate ? new Date(eq.PurchaseDate).toLocaleDateString() : '-'}</td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    eq.Status === 1 || eq.Status === '1'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {eq.Status === 1 || eq.Status === '1' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-3">
                                                <FiEye
                                                    className="cursor-pointer text-blue-600"
                                                    onClick={() => navigate(`/equipment/view/${eq.EquipmentId}`)}
                                                />
                                                <FiEdit className="cursor-pointer text-primary-dark" onClick={(e) => handleEdit(e, eq)} />
                                                <FiTrash2 className="cursor-pointer text-error" onClick={() => setShowDeleteDialog(eq)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-gray-500">
                                        No equipments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
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

            <DeleteAlertDialog
                itemName={showDeleteDialog?.Name}
                isOpen={Boolean(showDeleteDialog)}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default Equipment;
