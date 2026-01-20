import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import { AuditLogListApi } from '@/api/AuditLogApi';

const ITEMS_PER_PAGE = 10;

const AuditLog = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('created_at');
    const [orderDirection, setOrderDirection] = useState('DESC');

    /* ================= QUERY PARAMS ================= */
    const params = {
        search: searchTerm,
        page: currentPage,
        length: ITEMS_PER_PAGE,
        orderColumn,
        orderDirection
    };

    /* ================= FETCH ================= */
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['auditlogs', currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => AuditLogListApi(params),
        keepPreviousData: true
    });

    /* ================= DATA ================= */
    const auditlogs = data?.value?.data?.auditData || [];
    const totalCount = data?.value?.data?.totalRecords || 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCount);

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                {/* HEADER */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Audit Logs</h1>
                        <p className="text-sm text-gray-500">System activity tracking</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <span className="px-3 py-1 text-xs rounded-full bg-gray-100">{totalCount} total logs</span>
                    </div>
                </div>

                {/* SEARCH */}
                <div className="bg-white border rounded-lg p-4">
                    <InputField
                        placeholder="Search entity, action, user..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                {/* ERROR */}
                {isError && <Alert.Error>{error?.message || 'Failed to load audit logs'}</Alert.Error>}

                {/* TABLE */}
                <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <colgroup>
                            <col className="w-[15%]" /> {/* Entity */}
                            <col className="w-[15%]" /> {/* Action */}
                            <col className="w-[15%]" /> {/* Entity ID */}
                            <col className="w-[20%]" /> {/* Old Data */}
                            <col className="w-[22%]" /> {/* New Data */}
                        </colgroup>
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left">Entity</th>
                                <th className="p-3 text-left">Action</th>
                                <th className="p-3 text-left">Entity ID</th>
                                <th className="p-3 text-left">Old Data</th>
                                <th className="p-3 text-left">New Data</th>
                                <th
                                    className="p-3 text-left cursor-pointer"
                                    onClick={() => {
                                        setOrderColumn('created_at');
                                        setOrderDirection(orderDirection === 'ASC' ? 'DESC' : 'ASC');
                                    }}
                                >
                                    Created {orderColumn === 'created_at' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center">
                                        <RotatingLines width="24" />
                                    </td>
                                </tr>
                            ) : auditlogs.length ? (
                                auditlogs.map((log) => (
                                    <tr key={log.audit_id} className="border-b hover:bg-gray-50 align-top">
                                        <td className="p-3">{log.entity_name}</td>
                                        <td className="p-3 font-medium">{log.action}</td>
                                        <td className="p-3">{log.entity_id}</td>
                                        <td className="p-3 text-xs whitespace-pre-wrap max-w-xs">
                                            {log.old_data ? JSON.stringify(JSON.parse(log.old_data), null, 2) : '-'}
                                        </td>
                                        <td className="p-3 text-xs whitespace-pre-wrap max-w-xs">
                                            {log.new_data ? JSON.stringify(JSON.parse(log.new_data), null, 2) : '-'}
                                        </td>
                                        <td className="p-3">{new Date(log.created_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">
                                        No audit logs found
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
        </Fragment>
    );
};

export default AuditLog;
