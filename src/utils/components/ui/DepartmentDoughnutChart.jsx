import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

const GREY = '#E5E7EB';
const COLORS = ['#B2C5FF', '#C5F5A4', '#E8F0FF'];

const DepartmentDoughnutChart = ({ data = [] }) => {
    const labels = data.map((d) => d.department);
    const values = data.map((d) => d.total_count);

    const chartData =
        labels.length === 0
            ? {
                  labels: ['No Data'],
                  datasets: [{ data: [1], backgroundColor: [GREY], cutout: '75%' }]
              }
            : {
                  labels,
                  datasets: [
                      {
                          data: values,
                          backgroundColor: COLORS,
                          cutout: '75%'
                      }
                  ]
              };

    const total = values.reduce((a, b) => a + b, 0);

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-[190px] h-[190px]">
                <Doughnut data={chartData} />
                {labels.length > 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{total}</span>
                        <span className="text-xs">Total</span>
                    </div>
                )}
            </div>
            {/* Content */}
            <div className="flex items-center justify-between gap-5">
                <div className="space-y-2">
                    {(labels.length ? labels : ['No Data']).map((label, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i] || GREY }} />
                            <span className="flex-1 text-gray-700">{label}</span>
                            <span className="font-semibold text-gray-900">{values[i] ?? 0}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

DepartmentDoughnutChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            department: PropTypes.string.isRequired,
            total_count: PropTypes.number.isRequired
        })
    )
};

export default DepartmentDoughnutChart;
