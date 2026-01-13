import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobTypeStatsApi, getWorkModeStatsApi } from '@/api/DashboardApi';
import { formatDateForApi } from '@/utils/Utils';
import ScoreBoard from '../ScoreBoard';

const JobWorkDoghnutChart = () => {
    const [jobTypeDate, setJobTypeDate] = useState(new Date().toISOString().split('T')[0]);
    const [workModeDate, setWorkModeDate] = useState(new Date().toISOString().split('T')[0]);

    const jobTypeApiDate = formatDateForApi(jobTypeDate);
    const workModeApiDate = formatDateForApi(workModeDate);

    const { data: jobTypeRes = [] } = useQuery({
        queryKey: ['job-type-stats', jobTypeApiDate],
        queryFn: () => getJobTypeStatsApi(jobTypeApiDate),
        select: (res) => res?.data || []
    });

    const { data: workModeRes = [] } = useQuery({
        queryKey: ['work-mode-stats', workModeApiDate],
        queryFn: () => getWorkModeStatsApi(workModeApiDate),
        select: (res) => res?.data || []
    });

    return (
        <div className="flex flex-col gap-6">
            <ScoreBoard
                title="Job Types"
                labels={jobTypeRes.map((i) => i.job_type)}
                values={jobTypeRes.map((i) => i.total_count)}
                colors={['#B2C5FF', '#C5F5A4', '#FFD6A5']}
                date={jobTypeDate}
                onDateChange={setJobTypeDate}
            />

            <ScoreBoard
                title="Work Mode"
                labels={workModeRes.map((i) => i.work_mode)}
                values={workModeRes.map((i) => i.total_count)}
                colors={['#E8F0FF', '#D0F4DE', '#FDE2E4']}
                date={workModeDate}
                onDateChange={setWorkModeDate}
            />
        </div>
    );
};

export default JobWorkDoghnutChart;
