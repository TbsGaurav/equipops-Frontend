import ApplicantsResourcesCard from '@/utils/components/ApplicantsResourcesCard';
import ApplicationsDashboard from '@/utils/components/ApplicationsChart';
import { ScheduleList } from '@/utils/components/ScheduleList';
import StatCard from '@/utils/components/StatCard';
import { TaskList } from '@/utils/components/TaskList';

import { MdMoreHoriz } from 'react-icons/md';

export default function UserDashboard() {
    return (
        <div className="flex flex-col gap-5 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-5">
                <div className="flex-1 flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <>
                            <StatCard
                                title="Applications"
                                value="1,534"
                                change="+12.7%"
                                color="bg-red-200/40 text-gray-700"
                                actionBody={<MdMoreHoriz />}
                            />
                            <StatCard
                                title="Shortlisted"
                                value="869"
                                change="+1.9%"
                                color="bg-blue-100 text-gray-700"
                                actionBody={<MdMoreHoriz />}
                            />
                            <StatCard
                                title="Hired"
                                value="236"
                                change="+8.3%"
                                color="bg-green-100 text-gray-700"
                                actionBody={<MdMoreHoriz />}
                            />
                            <StatCard
                                title="Rejected"
                                value="429"
                                change="-2.8%"
                                color="bg-pink-100 text-gray-700"
                                actionBody={<MdMoreHoriz />}
                            />
                        </>
                    </div>
                    <ApplicationsDashboard />
                </div>
                <ApplicantsResourcesCard />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 flex flex-col h-full">
                    <h3 className="font-semibold text-xl text-gray-800 mb-3">
                        Current Vacancies <span className="text-sm">(103)</span>
                    </h3>
                    <div className="flex-1 grid md:grid-cols-2 gap-4">
                        {[
                            { title: 'Software Developer', type: 'Full-time', mode: 'Remote', range: '$70K–$90K', applicants: 120 },
                            { title: 'Graphic Designer', type: 'Part-time', mode: 'Hybrid', range: '$40K–$55K', applicants: 75 },
                            { title: 'Sales Manager', type: 'Full-time', mode: 'On-site', range: '$70K–$90K', applicants: 75 },
                            { title: 'HR Coordinator', type: 'Contract', mode: 'Remote', range: '$50K–$60K', applicants: 60 }
                        ].map((job, i) => (
                            <div key={i} className="rounded-xl p-4 gap-5 hover:shadow-md transition fl-card flex-col">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-800">{job.title}</h4>
                                    <MdMoreHoriz />
                                </div>
                                <div className="text-sm space-x-3">
                                    <span className="px-2 p-1 bg-indigo-100 rounded-lg">{job.type}</span>
                                    <span className="px-2 p-1 bg-indigo-100 rounded-lg">{job.mode}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">{job.range}</div>
                                    <div className="text-sm text-gray-500">{job.applicants} Applicants</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <TaskList />
                <ScheduleList />
            </div>
            <div className="flex flex-col md:flex-row gap-5">
                <div className="flex-1">{/* <ApplicantsTable /> */}</div>
                {/* <ScoreBoard /> */}
            </div>
        </div>
    );
}
