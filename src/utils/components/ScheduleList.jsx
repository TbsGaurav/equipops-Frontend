import PropTypes from 'prop-types';

export const ScheduleList = ({ schedules = [] }) => {
    return (
        <div className="fl-card flex-col rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">Schedule</h3>
                <span className="text-xs text-gray-400">Today</span>
            </div>

            {/* Empty state */}
            {schedules.length === 0 && <p className="text-xs text-gray-500">No schedules for today</p>}

            <div className="space-y-3">
                {schedules.map((s, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between border border-gray-100 rounded-xl p-3 hover:shadow-md transition bg-indigo-50 text-indigo-700"
                    >
                        <div>
                            <h4 className="text-sm font-semibold">{s.jobTitle}</h4>
                            <p className="text-xs text-gray-600">{s.applicants}Applicants</p>
                        </div>

                        <span className="text-xs font-medium text-gray-700">{s.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

ScheduleList.propTypes = {
    schedules: PropTypes.arrayOf(
        PropTypes.shape({
            jobTitle: PropTypes.string,
            applicants: PropTypes.string,
            time: PropTypes.string
        })
    )
};
