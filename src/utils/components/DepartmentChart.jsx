import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export const DepartmentChart = () => {
    const data = {
        labels: ['Engineering', 'Marketing', 'Sales', 'Support', 'Finance', 'HR'],
        datasets: [
            {
                data: [120, 110, 95, 85, 65, 50],
                backgroundColor: ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#F87171', '#8B5CF6']
            }
        ]
    };

    return <Doughnut data={data} />;
};
