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
import { VendorListApi, VendorDeleteApi } from '@/api/VendorApi';

const Vendor = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

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
    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    const handleCreate = () => navigate('/vendor/create');

    const handleEdit = (e, ven) => {
        e.stopPropagation();
        navigate(`/vendor/edit/${ven.vendor_id}`);
    };

    const handleView = (e, ven) => {
        e.stopPropagation();
        navigate(`/vendor/view/${ven.vendor_id}`);
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
            <div className="space-y-6 pb-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Vendors</h2>
                        <p className="mt-1 text-sm text-gray-600">Manage, search, sort and organize your vendors</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} vendors
                        </span>

                        <Button variant="contained" color="primary" size="md" onClick={handleCreate} className="font-medium shadow-sm">
                            + New Vendor
                        </Button>
                    </div>
                </div>

                {/* Search & controls */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <InputField
                        placeholder="Search by name, email or service type..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-md"
                    />
                </div>

                {/* Error */}
                {isError && (
                    <Alert.Error className="rounded-xl border-l-4 border-l-red-500">
                        {error?.message || 'Failed to load vendors'}
                    </Alert.Error>
                )}

                {/* Table Card */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('name');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            Name
                                            {orderColumn === 'name' && (
                                                <span className="text-gray-400">{orderDirection === 'ASC' ? '↑' : '↓'}</span>
                                            )}
                                        </span>
                                    </th>

                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>

                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-black uppercase tracking-wider">
                                        Service Type
                                    </th>

                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Organization
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('created_at');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <span className="flex items-center gap-1">
                                            Created
                                            {orderColumn === 'created_at' && (
                                                <span className="text-gray-400">{orderDirection === 'ASC' ? '↑' : '↓'}</span>
                                            )}
                                        </span>
                                    </th>
                                    <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="flex justify-center">
                                                <RotatingLines strokeColor="#6366f1" strokeWidth="4" animationDuration="0.75" width="32" />
                                            </div>
                                        </td>
                                    </tr>
                                ) : vendors.length > 0 ? (
                                    vendors.map((ven) => (
                                        <tr key={ven.vendor_id} className="hover:bg-indigo-50/40 transition-colors duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-900">{ven.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {ven.email ?? <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {ven.service_type ?? <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {ven.organization_name ?? <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {ven.phone ?? <span className="text-gray-400">—</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                {new Date(ven.created_at).toLocaleDateString('en-GB', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={(e) => handleView(e, ven)}
                                                        className="text-emerald-600 hover:text-emerald-800 transition-colors p-1 rounded hover:bg-emerald-50"
                                                        title="View vendor"
                                                    >
                                                        <FiEye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleEdit(e, ven)}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors p-1 rounded hover:bg-indigo-50"
                                                        title="Edit vendor"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setShowDeleteDialog(ven)}
                                                        className="text-rose-600 hover:text-rose-800 transition-colors p-1 rounded hover:bg-rose-50"
                                                        title="Delete vendor"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <div className="text-gray-500 text-sm">
                                                No vendors found
                                                {searchTerm && <p className="mt-1">Try adjusting your search term</p>}
                                            </div>
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
