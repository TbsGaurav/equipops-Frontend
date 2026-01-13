import { Fragment, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import InputField from '@/utils/components/ui/InputField';
import Alert from '@/utils/components/ui/Alert';
import { CandidateListApi } from '@/api/Candidate';

const Candidate = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [orderColumn, setOrderColumn] = useState('name');
    const [orderDirection, setOrderDirection] = useState('ASC');

    const itemsPerPage = 10;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['candidate', currentPage, searchTerm, filterStatus, orderColumn, orderDirection],
        queryFn: () =>
            CandidateListApi({
                Search: searchTerm,
                Page: currentPage,
                Length: itemsPerPage,
                OrderColumn: orderColumn,
                OrderDirection: orderDirection,
                IsActive: filterStatus === 'all' ? null : filterStatus === 'active'
            }),
        keepPreviousData: true
    });

    const candidates = data?.data?.candidateData || [];
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
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Title + Subtitle */}
                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Candidates</h1>
                        <p className="text-sm text-gray-500 max-w-xl">
                            Manage all candidates, search by name or code, and filter by status.
                        </p>
                    </div>

                    {/* Count + Button */}
                    <div className="flex flex-col-reverse gap-2 w-full sm:flex-row sm:items-center sm:justify-end md:w-auto">
                        <span className="inline-flex items-center justify-center sm:justify-start rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
                            {totalCount} total candidates
                        </span>
                    </div>
                </div>

                {/* Search + Filter */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="flex-1">
                            <label htmlFor="search" className="block text-xs font-semibold text-gray-500 mb-1">
                                Search
                            </label>
                            <div className="flex items-center gap-2">
                                <InputField
                                    id="search"
                                    type="text"
                                    placeholder="Search by name or email.."
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

                        {/* Status Filter - Radix Select */}
                        <div className="w-full sm:w-48">
                            <label htmlFor="status" className="block text-xs font-semibold text-gray-500 mb-1">
                                Status
                            </label>

                            <Select.Root
                                value={filterStatus}
                                onValueChange={(val) => {
                                    setFilterStatus(val);
                                    setCurrentPage(1);
                                }}
                            >
                                <Select.Trigger
                                    id="status"
                                    className="
                                    w-full h-10 px-3 text-sm
                                    flex items-center justify-between 
                                    border border-gray-300 rounded-md bg-white
                                    focus:outline-none focus:ring-2 focus:ring-primary-dark/40
                                "
                                    aria-label="Status"
                                >
                                    <Select.Value placeholder="All Status" />
                                    <Select.Icon>
                                        <FiChevronDown />
                                    </Select.Icon>
                                </Select.Trigger>

                                <Select.Portal>
                                    <Select.Content
                                        side="bottom"
                                        position="popper"
                                        className="bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[var(--radix-select-trigger-width)]"
                                    >
                                        <Select.Viewport className="p-1">
                                            {/* All */}
                                            <Select.Item
                                                value="all"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>All Status</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>

                                            {/* Active */}
                                            <Select.Item
                                                value="active"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>Active</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>

                                            {/* Inactive */}
                                            <Select.Item
                                                value="inactive"
                                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                                            >
                                                <Select.ItemText>Inactive</Select.ItemText>
                                                <Select.ItemIndicator className="absolute left-2">
                                                    <FiCheck className="text-primary-dark" />
                                                </Select.ItemIndicator>
                                            </Select.Item>
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
                {isError && <Alert.Error className="mt-1">{error?.message || 'Failed to load candidates'}</Alert.Error>}

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
                                    <th className="p-3 text-left font-semibold">Experience</th>
                                    <th className="p-3 text-left font-semibold">Skills</th>
                                    <th className="p-3 text-left font-semibold">Description</th>
                                    <th className="p-3 text-left font-semibold">Status</th>
                                    <th
                                        onClick={() => {
                                            setOrderColumn('created_Date');
                                            setOrderDirection((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                                        }}
                                        className="p-3 text-left font-semibold cursor-pointer hover:bg-gray-100"
                                    >
                                        Created {orderColumn === 'created_Date' && (orderDirection === 'ASC' ? '↑' : '↓')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="p-10 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <RotatingLines
                                                    visible={true}
                                                    height="24"
                                                    width="24"
                                                    color="currentColor"
                                                    strokeWidth="5"
                                                    animationDuration="0.75"
                                                    ariaLabel="rotating-lines-loading"
                                                />
                                                Loading candidates...
                                            </div>
                                        </td>
                                    </tr>
                                ) : candidates.length > 0 ? (
                                    candidates.map((can) => (
                                        <tr key={can.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium">{can.name}</td>
                                            <td className="p-3 text-gray-600">{can.email}</td>
                                            <td className="p-3 text-gray-600">{can.experience}</td>
                                            <td className="p-3 text-gray-600">{can.skill}</td>
                                            <td className="p-3 text-gray-600">{can.description}</td>
                                            <td className="p-3">
                                                <span
                                                    className={`px-2 py-1 text-xs rounded-full font-medium 
                                                        ${can.is_Active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}
                                                >
                                                    {can.is_Active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-gray-600">{new Date(can.created_Date).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-10">
                                            <div className="flex flex-col items-center text-gray-500">
                                                <div className="text-4xl mb-2">📂</div>
                                                <p className="font-semibold text-gray-600">No Candidate found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
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
                                        className={`px-3 py-2 rounded-md border 
                                            ${currentPage === page ? 'bg-primary-dark text-white' : 'border-gray-300 hover:bg-gray-100'}`}
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
            </div>
        </Fragment>
    );
};

export default Candidate;
