import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApplicationsTrendApi, getDepartmentStatsApi } from '@/api/DashboardApi';
import { formatDateForApi } from '@/utils/Utils';
import ApplicationTrendsChart from './ApplicationTrendsChart';
import DepartmentDoughnutChart from './DepartmentDoughnutChart';

const OrgApplicationsContainer = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [deptDate, setDeptDate] = useState(new Date().toISOString().split('T')[0]);

    const trendStart = start ? formatDateForApi(start) : null;
    const trendEnd = end ? formatDateForApi(end) : null;
    const departmentDate = deptDate ? formatDateForApi(deptDate) : null;

    const { data: trends = [] } = useQuery({
        queryKey: ['org-trends', trendStart, trendEnd],
        queryFn: () => getApplicationsTrendApi({ startDate: trendStart, endDate: trendEnd }),
        enabled: !!trendStart && !!trendEnd,
        select: (res) => res?.data || []
    });

    const { data: departments = [] } = useQuery({
        queryKey: ['org-departments', departmentDate],
        queryFn: () => getDepartmentStatsApi({ date: departmentDate }),
        enabled: !!departmentDate,
        select: (res) => res?.data || []
    });

    return (
        <div className="grid md:grid-cols-2 gap-5">
            {/* Trends */}
            <div className="rounded-2xl p-5 fl-card flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-gray-800">Application Trends</h2>

                    <div
                        className="relative flex items-center gap-3 border border-gray-300 rounded-md px-3 py-1.5 text-sm
                    hover:border-gray-400 focus-within:border-gray-400 bg-white"
                    >
                        <input
                            type="date"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                            className="outline-none bg-transparent cursor-pointer w-[100px]"
                        />
                        <input
                            type="date"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                            className="outline-none bg-transparent cursor-pointer w-[100px]"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-center h-[240px]">
                    <ApplicationTrendsChart data={trends} />
                </div>
            </div>

            {/* Departments */}
            <div className="rounded-2xl p-5 fl-card relative">
                <div className="flex justify-between mb-4">
                    <h2 className="font-semibold">Applications By Department</h2>
                    <div className="absolute top-5 right-5">
                        <div className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white hover:border-gray-400 focus-within:border-gray-400">
                            <input
                                type="date"
                                value={deptDate}
                                onChange={(e) => setDeptDate(e.target.value)}
                                className="outline-none bg-transparent cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center h-[260px]">
                    <div className="flex items-center justify-center h-[260px]">
                        <DepartmentDoughnutChart data={departments} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrgApplicationsContainer;
