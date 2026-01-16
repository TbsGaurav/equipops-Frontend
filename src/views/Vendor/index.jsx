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
import { VendorListApi, VendorDeleteApi } from '@/api/VendorApi';

const Vendor = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    // const permissions = useSelector((state) => state.user.permissions);
    const navigate = useNavigate();
    const itemsPerPage = 10;

    const params = {
        search: searchTerm,
        page: currentPage,
        length: itemsPerPage,
        orderColumn,
        orderDirection
    };

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['vendors', currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => VendorListApi(params),
        keepPreviousData: true
    });

    const vendors = data?.value?.data?.vendorData || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    const handleCreate = () => navigate('/vendor/create');

    const handleEdit = (v, ven) => {
        v.stopPropagation();
        navigate(`/vendor/edit/${ven.vendor_id}`);
    };

    const deleteMutation = useMutation({
        mutationFn: VendorDeleteApi,
        onSuccess: () => {
            Toast.success('Vendor deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Failed to delete vendor');
        }
    });

    const handleDelete = () => {
        if (showDeleteDialog) deleteMutation.mutate({ vendor_id: showDeleteDialog.vendor_id });
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Vendors</h1>
                        <p className="text-sm text-gray-500">Manage vendors, search, sort and organize them.</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100">{totalCount} total vendors</span>
                        {/* {canUpdate(permissions, 'VENDOR') && ( */}
                        <Button variant="contained" color="primary" onClick={handleCreate}>
                            + Create Vendor
                        </Button>
                        {/* )} */}
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <InputField
                        placeholder="Search by name, email or service type"
                        value={searchTerm}
                        onChange={(v) => {
                            setSearchTerm(v.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* Error */}
                {isError && <Alert.Error>{error?.message || 'Failed to load vendors'}</Alert.Error>}

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th
                                    onClick={() => {
                                        setOrderColumn('name');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                    className="p-3 text-left font-semibold cursor-pointer"
                                >
                                    Name {orderColumn === 'name' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                                <th className="p-3 text-left font-semibold">Email</th>
                                <th className="p-3 text-left font-semibold">Service Type</th>
                                <th className="p-3 text-left font-semibold">Organization</th>
                                <th className="p-3 text-left font-semibold">Phone</th>
                                {/* <th className="p-3 text-left font-semibold">Status</th> */}
                                <th
                                    onClick={() => {
                                        setOrderColumn('created_at');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                    className="p-3 text-left font-semibold cursor-pointer"
                                >
                                    Created {orderColumn === 'created_at' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
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
                            ) : vendors.length > 0 ? (
                                vendors.map((ven) => (
                                    <tr key={ven.vendor_id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{ven.name}</td>
                                        <td className="p-3">{ven.email ?? '-'}</td>
                                        <td className="p-3">{ven.service_type ?? '-'}</td>
                                        <td className="p-3">{ven.organization_name ?? '-'}</td>
                                        <td className="p-3">{ven.phone ?? '-'}</td>
                                        {/* <td className="p-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    ven.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {ven.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td> */}
                                        <td className="p-3">{new Date(ven.created_at).toLocaleDateString()}</td>
                                        <td className="p-3 text-center flex justify-center gap-2">
                                            {/* {canUpdate(permissions, 'VENDOR') && ( */}
                                            <FiEdit className="cursor-pointer text-primary-dark" onClick={(v) => handleEdit(v, ven)} />
                                            {/* )}
                                            {canDelete(permissions, 'VENDOR') && ( */}
                                            <FiTrash2 className="cursor-pointer text-error" onClick={() => setShowDeleteDialog(ven)} />
                                            {/* )} */}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-10 text-center text-gray-500">
                                        No vendors found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 0 && (
                    <div className="flex justify-between items-center mt-4">
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
                itemName={showDeleteDialog?.name}
                isOpen={Boolean(showDeleteDialog)}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default Vendor;
