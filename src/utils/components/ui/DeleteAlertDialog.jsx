import PropTypes from 'prop-types';
import Button from './Button';

const DeleteAlertDialog = ({ isOpen, itemName, onCancel, onConfirm, disabled, loading }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
        >
            {/* Overlay click to close */}
            <div className="absolute inset-0" onClick={onCancel} />

            {/* Dialog */}
            <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-50 dark:bg-slate-900 px-7 py-6 shadow-2xl animate-fadeIn scale-95 animate-grow">
                {/* Centered icon */}
                <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-red-500/10">
                        <div className="h-7 w-7 flex items-center justify-center rounded-full border-2 border-red-500 text-red-400 font-bold text-base">
                            !
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mt-1 mb-3">
                    <div className="text-center w-full">
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-700">Danger Action</p>
                        <h2 className="mt-1 text-[19px] font-semibold text-slate-900 dark:text-slate-50  tracking-wide">
                            Delete {itemName ? `"${itemName}"` : 'this record'}?
                        </h2>
                    </div>
                </div>

                {/* Body text */}
                <p className="text-center text-sm leading-relaxed text-slate-600">
                    This action is <span className="text-red-400 font-semibold">permanent </span>
                    and cannot be undone. Any workflows, reports, or linked records may be affected.
                </p>

                <p className="mt-2 text-center text-sm text-slate-500">
                    {`If you're unsure, choose`} <span className="text-slate-900 font-medium">Cancel</span>.
                </p>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-center gap-3">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                        color="secondary"
                        disabled={disabled}
                        className="rounded-full border border-slate-600 text-sm font-medium text-slate-800 dark:text-slate-100 transition hover:text-slate-100 hover:bg-slate-800"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={onConfirm}
                        variant="contained"
                        color="error"
                        className="rounded-full bg-gradient-to-r from-red-500 via-red-600 to-rose-700 text-sm font-semibold text-white shadow-lg shadow-red-900/40 transition hover:brightness-110 active:scale-[0.97] "
                        loading={loading}
                        disabled={disabled}
                    >
                        <span>Delete</span>
                        <span className="text-sm opacity-80">⟶</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

DeleteAlertDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    itemName: PropTypes.string,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    loading: PropTypes.bool
};

export default DeleteAlertDialog;
