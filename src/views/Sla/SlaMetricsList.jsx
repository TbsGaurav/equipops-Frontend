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

import { SlaMetricsListApi, SlaMetricsDeleteApi } from '@/api/SlaMetricsApi';

import { Organization1DropdownApi, EquipmentDropdownApi } from '@/api/DropdownApi';
import { useDebounce } from '@/hooks/useDebounce';

const SlaMetrics = () => {
    /* ===================== STATE ===================== */
    const [currentPage, setCurrentPage] = useState(1);
    const [slaBreached, setSlaBreached] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('created_at');
    const [orderDirection, setOrderDirection] = useState('DESC');
    const [showDeleteDialog, setShowDeleteDialog] = useState(null);

    const [startDate, setStartDate] = useState('2026-01-01');
    const [endDate, setEndDate] = useState('2026-01-31');

    const debouncedSearch = useDebounce(searchTerm, 500);

    const navigate = useNavigate();
    const itemsPerPage = 10;

    /* ===================== API PARAMS ===================== */
    const params = {
        organizationId: 1,
        startDate,
        endDate,
        slaBreached: slaBreached === '' ? null : slaBreached === 'true',
        search: debouncedSearch || null,
        page: currentPage,
        length: itemsPerPage,
        orderColumn,
        orderDirection
    };

    /* ===================== LIST ===================== */
    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['sla-metrics', currentPage, slaBreached, debouncedSearch, startDate, endDate, orderColumn, orderDirection],
        queryFn: () => SlaMetricsListApi(params),
        keepPreviousData: true
    });

    const slaList = data?.data || [];
    const totalCount = slaList.length; // backend can enhance later
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    /* ===================== ORGANIZATION ===================== */
    const { data: orgData = [] } = useQuery({
        queryKey: ['organization-dropdown'],
        queryFn: async () => {
            const res = await Organization1DropdownApi();
            return res?.data || [];
        }
    });
    const { data: equipmentData = [] } = useQuery({
        queryKey: ['equipment-dropdown'],
        queryFn: async () => {
            const res = await EquipmentDropdownApi();
            return res?.data || [];
        }
    });

    const orgMap = {};
    orgData.forEach((o) => {
        orgMap[o.organization_id] = o.name;
    });
    const equipmentMap = {};
    equipmentData.forEach((e) => {
        equipmentMap[e.equipment_id] = e.name;
    });

    /* ===================== DELETE ===================== */
    const deleteMutation = useMutation({
        mutationFn: SlaMetricsDeleteApi,
        onSuccess: () => {
            Toast.success('SLA record deleted successfully');
            refetch();
            setShowDeleteDialog(null);
        },
        onError: (error) => {
            Toast.error(error?.response?.data?.message || 'Failed to delete SLA');
        }
    });

    const handleDelete = () => {
        deleteMutation.mutate(showDeleteDialog.sla_id);
    };

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* ===================== HEADER ===================== */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">SLA Metrics</h1>
                        <p className="text-sm text-gray-500">Monitor SLA performance and downtime.</p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100">{totalCount} total records</span>
                        <Button onClick={() => navigate('/sla-metrics/create')}>+ Create SLA</Button>
                    </div>
                </div>

                {/* ===================== FILTERS ===================== */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
                        <InputField
                            placeholder="Search by SLA ID or Equipment ID"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* SLA Breached */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">SLA Breached</label>
                        <select
                            value={slaBreached}
                            onChange={(e) => {
                                setSlaBreached(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md"
                        >
                            <option value="">All</option>
                            <option value="true">Breached</option>
                            <option value="false">Not Breached</option>
                        </select>
                    </div>
                </div>

                {isError && <Alert.Error>{error?.response?.data?.message || 'Failed to load SLA metrics'}</Alert.Error>}

                {/* ===================== TABLE ===================== */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-left font-semibold">Organization</th>
                                <th className="p-3 text-left font-semibold">Equipment</th>

                                <th
                                    className="p-3 text-left font-semibold cursor-pointer"
                                    onClick={() => {
                                        setOrderColumn('period_start');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                        setCurrentPage(1);
                                    }}
                                >
                                    Period {orderColumn === 'period_start' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>

                                <th
                                    className="p-3 text-left font-semibold cursor-pointer"
                                    onClick={() => {
                                        setOrderColumn('downtime_minutes');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                        setCurrentPage(1);
                                    }}
                                >
                                    Downtime (min) {orderColumn === 'downtime_minutes' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>

                                <th className="p-3 text-left font-semibold">Breached</th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <RotatingLines width="24" />
                                    </td>
                                </tr>
                            ) : slaList.length > 0 ? (
                                slaList.map((sla) => (
                                    <tr key={sla.sla_id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-3">{orgMap[sla.organization_id] || '-'}</td>
                                        <td className="p-3">{equipmentMap[sla.equipment_id] || '-'}</td>
                                        <td className="p-3">
                                            {sla.period_start} → {sla.period_end}
                                        </td>
                                        <td className="p-3">{sla.downtime_minutes}</td>
                                        <td className="p-3">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full ${
                                                    sla.sla_breached ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}
                                            >
                                                {sla.sla_breached ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex justify-center gap-3">
                                                <FiEye
                                                    className="cursor-pointer text-blue-600"
                                                    onClick={() => navigate(`/sla-metrics/view/${sla.sla_id}`)}
                                                />
                                                <FiEdit
                                                    className="cursor-pointer text-indigo-600"
                                                    onClick={() => navigate(`/sla-metrics/edit/${sla.sla_id}`)}
                                                />
                                                <FiTrash2
                                                    className="cursor-pointer text-red-500"
                                                    onClick={() => setShowDeleteDialog(sla)}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-500">
                                        No SLA records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ===================== PAGINATION ===================== */}
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

            {/* ===================== DELETE DIALOG ===================== */}
            <DeleteAlertDialog
                itemName={`SLA #${showDeleteDialog?.sla_id}`}
                isOpen={Boolean(showDeleteDialog)}
                onCancel={() => setShowDeleteDialog(null)}
                onConfirm={handleDelete}
                loading={deleteMutation.isPending}
            />
        </Fragment>
    );
};

export default SlaMetrics;
