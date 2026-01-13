import { useQuery } from '@tanstack/react-query';
import { getOrgDashboardReportApi } from '@/api/DashboardApi';
import StatCard from '@/utils/components/StatCard';
import { MdMoreHoriz } from 'react-icons/md';
import { ScheduleList } from '@/utils/components/ScheduleList';
import OrgApplicationsContainer from '@/utils/components/ui/OrgApplicationsContainer';
import JobWorkDoghnutChart from '@/utils/components/ui/JobWorkDoghnutChart';
import ApplicantsTable from '@/utils/components/ApplicantsTable';

export default function OrganizationDashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['org-dashboard-report'],
        queryFn: () => getOrgDashboardReportApi(),
        select: (res) => res?.data
    });

    const summary = data?.summary;
    const vacanciesData = data?.currentVacancies;
    const vacancies = vacanciesData?.vacancies || [];
    const totalVacancies = vacanciesData?.totalVacancies ?? 0;
    const schedules = data?.todaySchedule || [];
    const applicants = data?.applicants || [];

    return (
        <div className="flex flex-col gap-6 overflow-x-hidden">
            {/* ===== STAT CARDS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Applications"
                    value={summary?.total_applications ?? 0}
                    loading={isLoading}
                    color="bg-red-200/40 text-gray-700"
                />
                <StatCard title="Shortlisted" value={summary?.shortlisted ?? 0} loading={isLoading} color="bg-blue-100 text-gray-700" />
                <StatCard title="Hired" value={summary?.hired ?? 0} loading={isLoading} color="bg-green-100 text-gray-700" />
                <StatCard title="Rejected" value={summary?.rejected ?? 0} loading={isLoading} color="bg-pink-100 text-gray-700" />
            </div>

            {/* ===== CHARTS ===== */}
            <div className="w-full">
                <OrgApplicationsContainer />
            </div>

            {/* ===== VACANCIES + SIDE PANELS ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 flex flex-col h-full">
                    <h3 className="font-semibold text-xl text-gray-800 mb-3">
                        Current Vacancies <span className="text-sm">({totalVacancies})</span>
                    </h3>

                    {vacancies.length === 0 && <p className="text-sm text-gray-500">No vacancies available</p>}

                    <div className="grid md:grid-cols-2 gap-4">
                        {vacancies.map((job) => (
                            <div key={job.interview_id} className="rounded-xl p-4 gap-8 hover:shadow-md transition fl-card flex-col">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">{job.job_title}</h4>
                                    <MdMoreHoriz />
                                </div>

                                <div className="text-sm space-x-3">
                                    <span className="px-2 p-1 bg-indigo-100 rounded-lg">{job.job_type}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-500">{job.applicant_count} Applicants</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <ScheduleList schedules={schedules} />
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    <JobWorkDoghnutChart />
                </div>
            </div>

            <div>
                <ApplicantsTable applicants={applicants} />
            </div>
        </div>
    );
}
