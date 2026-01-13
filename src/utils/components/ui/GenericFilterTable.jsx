import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

const GenericFilterTable = ({
    title,
    data = [],
    columns = [],
    filters = [],
    statusKey,
    statusColorMap = {},
    emptyMessage = 'No records found'
}) => {
    const [activeFilter, setActiveFilter] = useState(filters[0] || 'All');

    /* =========================
       FILTER LOGIC
    ========================= */
    const filteredData = useMemo(() => {
        if (!statusKey || activeFilter === 'All') return data;
        return data.filter((row) => row?.[statusKey]?.toLowerCase() === activeFilter.toLowerCase());
    }, [data, activeFilter, statusKey]);

    return (
        <div className="rounded-2xl flex-col p-4 fl-card">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">{title}</h3>

                {/* Filters */}
                {filters.length > 0 && (
                    <div className="flex gap-3 text-sm">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`font-medium transition ${
                                    activeFilter === filter
                                        ? 'text-indigo-600 border-b border-indigo-600'
                                        : 'text-gray-500 hover:text-gray-800'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Empty State */}
            {filteredData.length === 0 && (
                <p className="text-sm text-gray-500">
                    {emptyMessage}
                    {activeFilter !== 'All' && ` for ${activeFilter}`}
                </p>
            )}

            {/* Table */}
            {filteredData.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-t border-gray-100">
                        <thead className="text-gray-500 bg-gray-200">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className="py-2 px-4">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((row, i) => (
                                <tr key={i} className="border-b border-gray-200 hover:bg-gray-100 transition">
                                    {columns.map((col) => (
                                        <td key={col.key} className="py-2 px-4">
                                            {col.render ? (
                                                col.render(row)
                                            ) : col.isStatus ? (
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        statusColorMap[row[statusKey]] ?? 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {row[statusKey]}
                                                </span>
                                            ) : (
                                                row[col.key]
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

GenericFilterTable.propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.array,
    columns: PropTypes.array.isRequired,
    filters: PropTypes.array,
    statusKey: PropTypes.string,
    statusColorMap: PropTypes.object,
    emptyMessage: PropTypes.string
};

export default GenericFilterTable;
