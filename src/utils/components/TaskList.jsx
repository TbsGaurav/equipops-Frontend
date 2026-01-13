export const TaskList = () => {
    const tasks = [
        { name: 'Resume Screening', percent: 40, date: 'May 27, 2024' },
        { name: 'Interview Scheduling', percent: 60, date: 'May 29, 2024' },
        { name: 'Candidate Communication', percent: 30, date: 'May 23, 2024' },
        { name: 'Offer Management', percent: 50, date: 'May 25, 2024' }
    ];

    return (
        <div className="fl-card flex-col rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Task</h3>
                <button className="text-indigo-600 text-sm font-medium hover:underline">+</button>
            </div>

            <div className="space-y-3">
                {tasks.map((task, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                            <span>{task.name}</span>
                            <span>{task.percent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${task.percent}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-400">{task.date}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
