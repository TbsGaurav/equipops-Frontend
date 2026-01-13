import { cn } from '@/utils/Utils';
import { cva } from 'class-variance-authority';
import PropTypes from 'prop-types';

/**
 * InputField
 *
 * Small reusable input with size variants and an error state.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.className] - Additional classes to apply.
 * @param {string} [props.type='text'] - Native input type.
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Visual size variant.
 * @param {boolean} [props.error=false] - When true, applies the error style class "fl-input-error".
 * @returns {JSX.Element} The input element.
 *
 * Example:
 * import InputField from '@/utils/components/ui/InputField';
 * <InputField type="email" size="large" className="w-full" />
 */
const InputField = ({ className, placeholder, type, size, error, ...rest }) => {
    const InputVariants = cva('fl-input', {
        variants: {
            size: {
                small: 'p-1.5 text-sm',
                medium: 'p-2 text-base',
                large: 'p-2.5 text-lg'
            },
            error: {
                true: 'fl-input-error',
                false: ''
            }
        },
        defaultVariants: {
            size: 'medium',
            error: 'false'
        }
    });

    return (
        <input
            type={type || 'text'}
            placeholder={placeholder ?? 'Enter text here'}
            className={cn(InputVariants({ size, error }), className, error && 'fl-input-error')}
            {...rest}
        />
    );
};

InputField.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    error: PropTypes.bool,
    rest: PropTypes.object
};

InputField.displayName = 'InputField';
export default InputField;
