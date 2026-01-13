import { getSuperAdminDashboardReportApi } from '@/api/DashboardApi';
import StatCard from '@/utils/components/StatCard';
import OrgMonthlyTrends from '@/utils/components/ui/OrgMonthlyTrends';
import { ORG_STATUS } from '@/utils/Utils';
import { useQuery } from '@tanstack/react-query';
import { MdMoreHoriz } from 'react-icons/md';
import { useNavigate } from 'react-router';

export default function SuperAdminDashboard() {
    const { data } = useQuery({
        queryKey: ['org-dashboard-report'],
        queryFn: getSuperAdminDashboardReportApi,
        select: (res) => res?.data
    });
    const summary = data?.dashboardOrgSummary;
    const monthlySummary = data?.dashboardOrgMonthlySummary || [];

    const navigate = useNavigate();

    const goToOrgList = (status) => {
        navigate('/organization/org-by-status', {
            state: { status }
        });
    };
    return (
        <div className="flex flex-col gap-5 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex-1 flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                        <StatCard
                            title="Total"
                            value={summary?.total_org ?? 0}
                            color="bg-red-200/40 text-gray-700"
                            actionBody={<MdMoreHoriz />}
                            onClick={() => goToOrgList(ORG_STATUS.ALL)}
                        />
                        <StatCard
                            title="Active"
                            value={summary?.active_org ?? 0}
                            color="bg-green-100 text-gray-700"
                            actionBody={<MdMoreHoriz />}
                            onClick={() => goToOrgList(ORG_STATUS.ACTIVE)}
                        />
                        <StatCard
                            title="Deleted"
                            value={summary?.deleted_org ?? 0}
                            color="bg-orange-100 text-gray-700"
                            actionBody={<MdMoreHoriz />}
                            onClick={() => goToOrgList(ORG_STATUS.DELETED)}
                        />
                        <StatCard
                            title="InActive"
                            value={summary?.inactive_org ?? 0}
                            color="bg-pink-100 text-gray-700"
                            actionBody={<MdMoreHoriz />}
                            onClick={() => goToOrgList(ORG_STATUS.INACTIVE)}
                        />
                        <StatCard
                            title="New"
                            value={summary?.new_org ?? 0}
                            color="bg-blue-100 text-gray-700"
                            actionBody={<MdMoreHoriz />}
                            onClick={() => goToOrgList(ORG_STATUS.NEW)}
                        />
                    </div>
                </div>
            </div>

            <OrgMonthlyTrends data={monthlySummary} />
        </div>
    );
}
