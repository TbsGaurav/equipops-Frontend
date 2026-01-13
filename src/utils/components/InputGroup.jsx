import PropTypes from 'prop-types';
import { cn } from '../Utils';

/**
 * InputGroup
 *
 * Simple wrapper that groups input-related elements (inputs, addons, icons, labels)
 * and applies shared layout and error styling.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elements to render inside the group (required).
 * @param {string} [props.className] - Additional classes applied to the wrapper.
 * @param {boolean} [props.error=false] - When true, adds the "fl-input-error" class.
 * @returns {JSX.Element} A div element with the "fl-input-group" base class wrapping children.
 *
 * Example:
 * <InputGroup className="w-full" error={hasError}>
 *   <InputField />
 *   <InputAddon>USD</InputAddon>
 * </InputGroup>
 */
const InputGroup = ({ children, className, error }) => {
    return <div className={cn('fl-input-group', className, error && 'fl-input-error')}>{children}</div>;
};

InputGroup.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    error: PropTypes.bool
};

InputGroup.displayName = 'InputGroup';
export default InputGroup;
