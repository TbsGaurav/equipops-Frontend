import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const ApplicantsResourcesCard = () => {
    const data = {
        labels: ['Job Boards', 'Social Media', 'Employee Referrals', 'Recruitment Agencies'],
        datasets: [
            {
                data: [350, 300, 200, 150],
                backgroundColor: ['#B2FF59', '#D0D4FD', '#C5F5A4', '#E8F0FF'],
                borderWidth: 0,
                cutout: '75%'
            }
        ]
    };

    const totalApplicants = data.datasets[0].data.reduce((a, b) => a + b, 0);

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    return (
        <div className="bg-[#DDE3FF] rounded-2xl p-5 shadow-xs gap-5 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Applicants Resources</h2>
                <span className="text-gray-500 text-xl font-bold">...</span>
            </div>

            {/* Chart */}
            <div className="relative h-40 w-40 mx-auto">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{totalApplicants}</span>
                    <span className="text-xs font-medium text-gray-500">Total Applicants</span>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-y-2 text-sm mt-5">
                <div className="flex items-top gap-2">
                    <span className="w-3 h-3 mt-2 rounded-sm bg-[#B2FF59]" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">350</span>
                        <span className="text-sm text-gray-600">Job Boards</span>
                    </div>
                </div>
                <div className="flex items-top gap-2">
                    <span className="w-3 h-3 mt-2 rounded-sm bg-[#C5F5A4]" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">200</span>
                        <span className="text-sm text-gray-600">Employee Referrals</span>
                    </div>
                </div>
                <div className="flex items-top gap-2">
                    <span className="w-3 h-3 mt-2 rounded-sm bg-[#D0D4FD]" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">300</span>
                        <span className="text-sm text-gray-600">Social Media</span>
                    </div>
                </div>
                <div className="flex items-top gap-2">
                    <span className="w-3 h-3 mt-2 rounded-sm bg-[#E8F0FF]" />
                    <div className="flex flex-col">
                        <span className="font-bold text-lg text-gray-800">150</span>
                        <span className="text-sm text-gray-600">Recruitment Agencies</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicantsResourcesCard;
