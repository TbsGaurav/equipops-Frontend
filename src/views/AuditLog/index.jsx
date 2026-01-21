import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import Button from '@/utils/components/ui/Button';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import { AuditLogListApi } from '@/api/AuditLogApi';

const ITEMS_PER_PAGE = 10;

const AuditLog = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('created_at');
    const [orderDirection, setOrderDirection] = useState('DESC');

    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE,
        orderColumn,
        orderDirection
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['auditlogs', currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => AuditLogListApi(params),
        keepPreviousData: true
    });

    const auditlogs = data?.value?.data?.auditData || [];
    const totalCount = data?.value?.data?.totalRecords || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    return (
        <Fragment>
            <div className="space-y-6 pb-10">
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
                        <p className="mt-1 text-sm text-gray-600">System activity tracking</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {totalCount} logs
                        </span>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                    <InputField
                        placeholder="Search entity, action, user..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="max-w-md"
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load audit logs'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <colgroup>
                            <col className="w-[15%]" />
                            <col className="w-[15%]" />
                            <col className="w-[15%]" />
                            <col className="w-[20%]" />
                            <col className="w-[22%]" />
                        </colgroup>

                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Action</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Entity ID</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">Old Data</th>
                                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider">New Data</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider cursor-pointer"
                                    onClick={() => {
                                        setOrderColumn('created_at');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                >
                                    Created {orderColumn === 'created_at' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <RotatingLines width="32" strokeColor="#6366f1" />
                                    </td>
                                </tr>
                            ) : auditlogs.length ? (
                                auditlogs.map((log) => (
                                    <tr key={log.audit_id} className="hover:bg-indigo-50/40 transition-colors align-top">
                                        <td className="px-6 py-4">{log.entity_name}</td>
                                        <td className="px-6 py-4 font-medium">{log.action}</td>
                                        <td className="px-6 py-4">{log.entity_id}</td>
                                        <td className="px-6 py-4 text-xs whitespace-pre-wrap max-w-xs">
                                            {log.old_data ? JSON.stringify(JSON.parse(log.old_data), null, 2) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-xs whitespace-pre-wrap max-w-xs">
                                            {log.new_data ? JSON.stringify(JSON.parse(log.new_data), null, 2) : '-'}
                                        </td>
                                        <td className="px-6 py-4">{new Date(log.created_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-500">
                                        No audit logs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
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
        </Fragment>
    );
};

export default AuditLog;
