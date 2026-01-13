import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';
import PropTypes from 'prop-types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const OrgMonthlyTrends = ({ data = [] }) => {
    const labels = data.map((i) => i.month);

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Total',
                data: data.map((i) => i.total_org),
                borderColor: '#93C5FD',
                backgroundColor: '#93C5FD',
                tension: 0.4
            },
            {
                label: 'Active',
                data: data.map((i) => i.active_org),
                borderColor: '#86EFAC',
                backgroundColor: '#86EFAC',
                tension: 0.4
            },
            {
                label: 'New',
                data: data.map((i) => i.new_org),
                borderColor: '#C7D2FE',
                backgroundColor: '#C7D2FE',
                tension: 0.4
            },
            {
                label: 'Deleted',
                data: data.map((i) => i.deleted_org),
                borderColor: '#FCA5A5',
                backgroundColor: '#FCA5A5',
                tension: 0.4
            },
            {
                label: 'Inactive',
                data: data.map((i) => i.inactive_org),
                borderColor: '#FDE68A',
                backgroundColor: '#FDE68A',
                tension: 0.4
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 10
                }
            }
        },
        scales: {
            x: {
                grid: { display: false }
            },
            y: {
                beginAtZero: true,
                grid: { color: '#F3F4F6' }
            }
        }
    };

    return (
        <div className="rounded-2xl p-5 fl-card flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Organization Monthly Trends</h3>

            {data.length === 0 ? (
                <div className="h-[260px] flex items-center justify-center text-gray-400">No data available</div>
            ) : (
                <div className="h-[260px]">
                    <Line data={chartData} options={options} />
                </div>
            )}
        </div>
    );
};

OrgMonthlyTrends.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            month: PropTypes.string.isRequired,
            count: PropTypes.number.isRequired
        })
    )
};

export default OrgMonthlyTrends;
