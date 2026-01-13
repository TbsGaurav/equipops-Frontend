import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';

const ApplicationTrendsChart = ({ data = [] }) => {
    const chartData = {
        labels: data.map((i) => i.reportDate),
        datasets: [
            {
                label: 'Applied',
                data: data.map((i) => i.applied),
                backgroundColor: '#C7CEFF',
                borderRadius: 6,
                barThickness: 18
            },
            {
                label: 'Shortlisted',
                data: data.map((i) => i.shortlisted),
                backgroundColor: '#C5F5A4',
                borderRadius: 6,
                barThickness: 18
            }
        ]
    };
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { usePointStyle: true, boxWidth: 10, font: { size: 12 } }
            }
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: '#f0f0f0' } }
        }
    };

    return (
        <div className="h-[190px] w-full md:h-full">
            <Bar data={chartData} options={barOptions} />
        </div>
    );
};

ApplicationTrendsChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            reportDate: PropTypes.string.isRequired,
            applied: PropTypes.number.isRequired,
            shortlisted: PropTypes.number.isRequired
        })
    )
};
export default ApplicationTrendsChart;
