import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GREY = '#E5E7EB';

const buildChartData = (labels, values, colors) => {
    if (!labels?.length) {
        return {
            labels: ['No Data'],
            datasets: [
                {
                    data: [1],
                    backgroundColor: [GREY],
                    cutout: '70%',
                    borderWidth: 0
                }
            ]
        };
    }

    return {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                cutout: '70%',
                borderWidth: 0
            }
        ]
    };
};

const ScoreBoard = ({ title, labels = [], values = [], colors = [], date, onDateChange }) => {
    const chartData = buildChartData(labels, values, colors);

    const options = {
        plugins: { legend: { display: false } },
        maintainAspectRatio: false
    };
    const hasData = labels.length > 0 && values.some((v) => v > 0);
    const totalApplications = hasData ? values.reduce((a, b) => a + b, 0) : 0;

    return (
        <div className="rounded-2xl p-5 fl-card flex-col">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">{title}</h3>

                {onDateChange && (
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm
                                   outline-none bg-transparent cursor-pointer
                                   hover:border-gray-400 focus:border-gray-400"
                    />
                )}
            </div>

            {/* Content */}
            <div className="flex items-center justify-between gap-5">
                <div className="relative w-[140px] h-[140px]">
                    <Doughnut data={chartData} options={options} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {hasData && (
                            <>
                                <span className="text-2xl font-bold text-gray-800">{totalApplications}</span>
                                <span className="text-xs font-medium text-gray-500">Total</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {(labels.length ? labels : ['No Data']).map((label, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i] || GREY }} />
                            <span className="flex-1 text-gray-700">{label}</span>
                            <span className="font-semibold text-gray-900">{values[i] ?? 0}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

ScoreBoard.propTypes = {
    title: PropTypes.string.isRequired,
    labels: PropTypes.array,
    values: PropTypes.array,
    colors: PropTypes.array,
    date: PropTypes.string,
    onDateChange: PropTypes.func
};

export default ScoreBoard;
