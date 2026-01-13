import { RxCross2 } from 'react-icons/rx';
import PropTypes from 'prop-types';

const Model = ({ children, onClose, title = 'Untitled', widthClass = 'max-w-2xl' }) => {
    const handleClose = () => {
        if (onClose) onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className={`relative w-full ${widthClass} max-h-[90vh] rounded-2xl  shadow-2xl overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-3">
                    <div className="min-w-0">
                        <h2 id="modal-title" className="text-base sm:text-lg font-semibold text-white truncate">
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center rounded-full p-1.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-indigo-500 transition"
                        aria-label="Close dialog"
                    >
                        <RxCross2 size={20} className="text-white" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 bg-white text-slate-900 overflow-y-auto max-h-[calc(90vh-3.5rem)]">{children}</div>
            </div>
        </div>
    );
};

Model.propTypes = {
    children: PropTypes.node.isRequired,
    onClose: PropTypes.func,
    title: PropTypes.string,
    widthClass: PropTypes.string
};

export default Model;
