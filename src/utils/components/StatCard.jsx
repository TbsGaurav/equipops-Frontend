import PropTypes from 'prop-types';
import { AiOutlineRise } from 'react-icons/ai';
import { cn } from '../Utils';

function StatCard({ title, value, color, icon: Icon, change, actionBody, onClick }) {
    const isClickable = typeof onClick === 'function';

    return (
        <div
            tabIndex={isClickable ? 0 : undefined}
            onClick={onClick}
            className={cn(
                'flex flex-col gap-2 p-4 rounded-lg shadow-sm',
                color,
                isClickable && 'cursor-pointer hover:shadow-md hover:scale-[1.01] focus:outline-none'
            )}
        >
            <div className="flex items-center">
                {Icon && (
                    <div className={`p-2 rounded-lg w-fit ${color}`}>
                        <Icon size={18} />
                    </div>
                )}
                <h4 className="flex-1 text-gray-700 font-medium">{title}</h4>
                {actionBody && (
                    <div className="px-1" onClick={(e) => e.stopPropagation()}>
                        {actionBody}
                    </div>
                )}
            </div>
            <div className="flex justify-between items-end">
                <p className="text-2xl font-bold">{value ?? 0}</p>

                {change && (
                    <div className="flex rounded-full items-center gap-1 text-xs font-semibold py-0.5 px-2 bg-white/70">
                        {change}
                        <AiOutlineRise />
                    </div>
                )}
            </div>
        </div>
    );
}

StatCard.propTypes = {
    title: PropTypes.string,
    value: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
    change: PropTypes.string,
    actionBody: PropTypes.node,
    onClick: PropTypes.node
};
export default StatCard;
