import PropTypes from 'prop-types';
import { cn } from '@/utils/Utils';

/**
 * Alert
 *
 * A reusable alert component with variants (success, error, warning, info).
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to display in the alert (required).
 * @param {'success'|'error'|'warning'|'info'} [props.variant='info'] - Alert type variant.
 * @param {string} [props.className] - Additional classes to apply.
 * @param {function} [props.onClose] - Callback when close button is clicked.
 * @returns {JSX.Element} The alert element.
 *
 * Example:
 * <Alert.Error>Something went wrong</Alert.Error>
 * <Alert.Success>Operation completed successfully</Alert.Success>
 */
function Alert({ children, variant = 'info', className, onClose }) {
    const variantStyles = {
        success: 'bg-success/10 text-success border border-success/30',
        error: 'bg-error/10 text-error border border-error/30',
        warning: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
        info: 'bg-blue-100 text-blue-800 border border-blue-300'
    };

    return (
        <div className={cn('w-full px-3 py-2 rounded-md flex items-center justify-between', variantStyles[variant], className)}>
            <span className="text-sm font-medium">{children}</span>
            {onClose && (
                <button onClick={onClose} className="ml-2 text-lg font-bold hover:opacity-70 transition-opacity" aria-label="Close alert">
                    ×
                </button>
            )}
        </div>
    );
}

Alert.propTypes = {
    children: PropTypes.node.isRequired,
    variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    className: PropTypes.string,
    onClose: PropTypes.func
};

Alert.displayName = 'Alert';

/**
 * Preset Alert components for quick usage
 */
Alert.Success = (props) => <Alert variant="success" {...props} />;
Alert.Error = (props) => <Alert variant="error" {...props} />;
Alert.Warning = (props) => <Alert variant="warning" {...props} />;
Alert.Info = (props) => <Alert variant="info" {...props} />;

Alert.Success.displayName = 'Alert.Success';
Alert.Error.displayName = 'Alert.Error';
Alert.Warning.displayName = 'Alert.Warning';
Alert.Info.displayName = 'Alert.Info';

export default Alert;
