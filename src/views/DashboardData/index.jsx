import { Fragment, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import Toast from '@/utils/toast';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import { canView, canUpdate } from '@/utils/Utils';
import { useSelector } from 'react-redux';
import { DashboardDataListApi, DashboardRebuildApi, DashboardAggregateApi, DashboardKpiSummaryApi } from '@/api/DashboardDataApi';

const ITEMS_PER_PAGE = 10;

const DashboardData = () => {
    const permissions = useSelector((state) => state.user.permissions);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('DESC');

    const queryClient = useQueryClient();

    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE,
        order_column: sortColumn,
        order_direction: sortDirection
    };

    const handleSort = (column) => {
        setCurrentPage(1);
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortColumn(column);
            setSortDirection('ASC');
        }
    };

    /* ---------- DATA ---------- */
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboard-data', currentPage, searchTerm, sortColumn, sortDirection],
        queryFn: () => DashboardDataListApi(params),
        keepPreviousData: true
    });

    const { data: kpiData, isLoading: kpiLoading } = useQuery({
        queryKey: ['dashboard-kpis'],
        enabled: canView(permissions, 'DASHBOARD'),
        queryFn: () => DashboardKpiSummaryApi({ organization_id: 1 })
    });

    /* ---------- MEMOS ---------- */
    const dashboards = useMemo(() => data?.value?.data?.dashboardData ?? [], [data]);

    const totalCount = data?.value?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    const kpis = useMemo(() => {
        const d = kpiData?.data;
        return {
            totalDowntime: d?.totalDowntime ?? 0,
            totalFailures: d?.totalFailures ?? 0,
            totalWorkOrders: d?.totalWorkOrders ?? 0,
            totalRecords: d?.totalRecords ?? 0
        };
    }, [kpiData]);

    /* ---------- MUTATIONS ---------- */
    const refreshMetricsMutation = useMutation({
        mutationFn: () =>
            DashboardRebuildApi({
                organization_id: 1
            }),
        onSuccess: () => {
            Toast.success('Metrics refreshed successfully');
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Metrics refresh failed');
        }
    });

    const rebuildDashboardMutation = useMutation({
        mutationFn: (payload) => DashboardAggregateApi(payload),
        onSuccess: () => {
            Toast.success('Dashboard rebuilt successfully');
            queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        },
        onError: (err) => {
            Toast.error(err?.response?.data?.message || 'Dashboard rebuild failed');
        }
    });

    return (
        <Fragment>
            <div className="space-y-8 pb-10">
                {/* ---------- HEADER ---------- */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                        <p className="mt-1 text-sm text-gray-600">Aggregated downtime and work order insights</p>
                    </div>

                    {canUpdate(permissions, 'DASHBOARD') && (
                        <div className="flex gap-3">
                            <Button
                                variant="outlined"
                                loading={refreshMetricsMutation.isPending}
                                className="rounded-full"
                                onClick={() => refreshMetricsMutation.mutate()}
                            >
                                Refresh Metrics
                            </Button>

                            <Button
                                variant="contained"
                                color="primary"
                                className="rounded-full"
                                onClick={() =>
                                    rebuildDashboardMutation.mutate({
                                        organization_id: 1
                                    })
                                }
                            >
                                Rebuild Dashboard
                            </Button>
                        </div>
                    )}
                </div>

                {/* ---------- KPI SECTION ---------- */}
                {canView(permissions, 'DASHBOARD') && (
                    <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                        {kpiLoading && <div className="mb-3 text-sm text-gray-400 animate-pulse">Loading KPIs…</div>}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KpiCard title="Total Downtime (min)" value={kpis.totalDowntime} color="rose" />
                            <KpiCard title="Total Failures" value={kpis.totalFailures} color="amber" />
                            <KpiCard title="Total Work Orders" value={kpis.totalWorkOrders} color="indigo" />
                            <KpiCard title="Total Records" value={kpis.totalRecords} color="emerald" />
                        </div>
                    </div>
                )}

                {/* ---------- SEARCH ---------- */}
                <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl shadow-sm p-4">
                    <InputField
                        placeholder="Search organization, equipment or subpart…"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-md"
                    />
                </div>

                {/* ---------- ERROR ---------- */}
                {isError && <Alert.Error>{error?.message || 'Failed to load dashboard data'}</Alert.Error>}

                {/* ---------- TABLE ---------- */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-fixed divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <Th onClick={() => handleSort('organization_name')}>Organization</Th>
                                    <Th>Equipment</Th>
                                    <Th>Subpart</Th>
                                    <Th align="right" onClick={() => handleSort('total_downtime_minutes')}>
                                        Downtime
                                    </Th>
                                    <Th align="right">Failures</Th>
                                    <Th align="right">Work Orders</Th>
                                    <Th onClick={() => handleSort('created_at')}>Created At</Th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <RotatingLines width="32" strokeColor="#6366f1" />
                                        </td>
                                    </tr>
                                ) : dashboards.length ? (
                                    dashboards.map((row) => (
                                        <tr key={row.dashboard_id} className="hover:bg-indigo-50/30 transition">
                                            <Td>{row.organization_name}</Td>
                                            <Td>{row.equipment_name}</Td>
                                            <Td>{row.subpart_name}</Td>
                                            <Td align="right">{row.total_downtime_minutes ?? 0}</Td>
                                            <Td align="right">{row.total_failures ?? 0}</Td>
                                            <Td align="right">{row.total_work_orders ?? 0}</Td>
                                            <Td>{new Date(row.created_at).toLocaleString()}</Td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-500">
                                            No dashboard data found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ---------- PAGINATION ---------- */}
                {totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-500">
                        <div>
                            Showing <span className="font-medium text-gray-700">{startIndex + 1}</span>–
                            <span className="font-medium text-gray-700">{endIndex}</span> of{' '}
                            <span className="font-medium text-gray-700">{totalCount}</span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                size="sm"
                                className="rounded-full"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => p - 1)}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outlined"
                                size="sm"
                                className="rounded-full"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => p + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

/* ---------- SMALL COMPONENTS ---------- */

const Th = ({ children, onClick, align = 'left' }) => (
    <th onClick={onClick} className={`px-6 py-3 text-xs font-bold uppercase cursor-pointer text-${align} text-black-600`}>
        {children}
    </th>
);

Th.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    align: PropTypes.oneOf(['left', 'center', 'right'])
};

const Td = ({ children, align = 'left' }) => <td className={`px-6 py-4 text-${align} text-black-700 tabular-nums`}>{children}</td>;

Td.propTypes = {
    children: PropTypes.node.isRequired,
    align: PropTypes.oneOf(['left', 'center', 'right'])
};

const colorMap = {
    rose: { bg: 'bg-rose-500', text: 'text-rose-600' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600' },
    indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600' }
};

const KpiCard = ({ title, value, color }) => {
    const bgColor = colorMap[color]?.bg || 'bg-gray-500';
    const textColor = colorMap[color]?.text || 'text-gray-600';

    return (
        <div className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            {/* Top colored border */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${bgColor}`} />

            {/* Heading in black */}
            <p className="text-sm font-medium text-gray-900">{title}</p>

            {/* Value with card color */}
            <p className={`mt-3 text-4xl font-semibold ${textColor}`}>{value}</p>
        </div>
    );
};

KpiCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    color: PropTypes.string.isRequired
};

export default DashboardData;
