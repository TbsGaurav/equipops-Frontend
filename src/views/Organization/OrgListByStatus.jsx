import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Select from '@radix-ui/react-select';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { RotatingLines } from 'react-loader-spinner';
import Alert from '@/utils/components/ui/Alert';
import { getOrgListByStatusApi } from '@/api/OrganizationApi';
import { ORG_STATUS } from '@/utils/Utils';
import { useLocation, useNavigate } from 'react-router';
import InputField from '@/utils/components/ui/InputField';
import { LuChevronLeft } from 'react-icons/lu';

const OrgListByStatus = () => {
    const location = useLocation();
    const initialStatus = typeof location.state?.status === 'number' ? location.state.status : ORG_STATUS.ALL;
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');
    const itemsPerPage = 10;
    const [status, setStatus] = useState(initialStatus);
    const navigate = useNavigate();

    const commonParams = {
        Status: status,
        Search: searchTerm,
        Page: currentPage,
        Length: itemsPerPage,
        OrderColumn: orderColumn,
        OrderDirection: orderDirection
    };
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['org-by-status', status, currentPage, searchTerm, orderColumn, orderDirection],
        queryFn: () => getOrgListByStatusApi(commonParams),
        select: (res) => res
    });

    const organizations = data?.data?.organizationData || [];
    const totalCount = data?.data?.totalNumbers || 0;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

    return (
        <Fragment>
            <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center gap-3 ">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center rounded-full p-1.5 hover:bg-gray-100 transition"
                    >
                        <LuChevronLeft className="text-gray-700 text-xl" />
                    </button>
                </div>
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Organizations By Status</h1>
                    <p className="text-sm text-gray-500">View organizations filtered by their current status.</p>
                </div>

                {/* Search + Filter */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Search</label>
                            <div className="flex items-center gap-2">
                                <InputField
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full h-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-dark/40"
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setCurrentPage(1);
                                        }}
                                        className="text-sm px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full sm:w-60">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>

                            <Select.Root
                                value={String(status)}
                                onValueChange={(val) => {
                                    setStatus(Number(val));
                                    setCurrentPage(1);
                                }}
                            >
                                <Select.Trigger
                                    className="
                                    w-full h-10 px-3 text-sm
                                    flex items-center justify-between 
                                    border border-gray-300 rounded-md bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary-dark/40
                                "
                                >
                                    <Select.Value />
                                    <Select.Icon>
                                        <FiChevronDown />
                                    </Select.Icon>
                                </Select.Trigger>

                                <Select.Portal>
                                    <Select.Content className="bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                                        <Select.Viewport className="p-1">
                                            {Object.entries(ORG_STATUS).map(([label, value]) => (
                                                <Select.Item
                                                    key={value}
                                                    value={String(value)}
                                                    className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100"
                                                >
                                                    <Select.ItemText>{label}</Select.ItemText>
                                                    <Select.ItemIndicator className="absolute left-2">
                                                        <FiCheck className="text-primary-dark" />
                                                    </Select.ItemIndicator>
                                                </Select.Item>
                                            ))}
                                        </Select.Viewport>
                                    </Select.Content>
                                </Select.Portal>
                            </Select.Root>
                        </div>
                    </div>

                    {/* Sort helper */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <p className="text-xs text-gray-500">
                            Tip: Click on <b>Name</b> or <b>Created</b> column to sort.
                        </p>
                        <span className="text-xs inline-flex items-center rounded-full bg-gray-100 px-3 py-1">
                            {orderColumn === 'name' ? 'Name' : 'Created'} • {orderDirection === 'ASC' ? 'ASC' : 'DESC'}
                        </span>
                    </div>
                </div>

                {/* Error */}
                {isError && <Alert.Error>{error?.message || 'Failed to load organizations'}</Alert.Error>}

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('name');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Name {orderColumn === 'name' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th className="p-3 text-left font-semibold">Email</th>
                                    <th className="p-3 text-left font-semibold">Description</th>
                                    <th className="p-3 text-left font-semibold">Industry</th>
                                    <th className="p-3 text-left font-semibold">Phone No</th>
                                    <th className="p-3 text-left font-semibold">WebsiteUrl</th>
                                    <th className="p-3 text-left font-semibold">No Of Employees</th>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('created_date');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Created {orderColumn === 'created_date' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <RotatingLines height="24" width="24" />
                                                Loading organizations...
                                            </div>
                                        </td>
                                    </tr>
                                ) : organizations.length > 0 ? (
                                    organizations.map((org) => (
                                        <tr key={org.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{org.name}</td>
                                            <td className="p-3 text-gray-600">{org.email}</td>
                                            <td className="p-3 text-gray-600">{org.description}</td>
                                            <td className="p-3">{org.industry_Type || ''}</td>
                                            <td className="p-3 text-gray-600">{org.phone_No}</td>
                                            <td className="p-3 text-gray-600">{org.website_Url}</td>
                                            <td className="p-3 text-gray-600">{org.number_Of_Employees}</td>

                                            <td className="p-3 text-gray-600">{new Date(org.created_Date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-10">
                                            <div className="flex flex-col items-center text-gray-500">
                                                <div className="text-4xl mb-2">📂</div>
                                                <p className="font-semibold text-gray-600">No organizations found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try changing the status filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Pagination */}
                {!isLoading && totalPages > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <p className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {endIndex} of {totalCount}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                const page = i + 1;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 rounded-md border ${currentPage === page ? 'bg-primary-dark text-white' : 'border-gray-300 hover:bg-gray-100'}`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer count */}
                {!isLoading && <p className="text-sm text-gray-600">{totalCount} organizations found</p>}
            </div>
        </Fragment>
    );
};

export default OrgListByStatus;
