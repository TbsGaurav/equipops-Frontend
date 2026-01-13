import { useRef, useState } from 'react';
import PropTypes from 'prop-types';

const Popover = ({ trigger, children, position = 'bottom' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);
    const triggerRef = useRef(null);
    const closeTimeout = useRef(null);

    const positionClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 right-0',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2'
    };

    const handleMouseEnter = () => {
        clearTimeout(closeTimeout.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeout.current = setTimeout(() => setIsOpen(false), 300);
    };

    return (
        <div className="relative inline-block">
            <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    ref={popoverRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={`absolute z-99 ${positionClasses[position]} transition-all duration-150 ease-out animate-in fade-in zoom-in-95`}
                >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[220px]">{children}</div>
                </div>
            )}
        </div>
    );
};

Popover.propTypes = {
    children: PropTypes.node,
    trigger: PropTypes.node,
    position: PropTypes.string
};

export default Popover;
