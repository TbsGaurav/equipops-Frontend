import { cn } from '@/utils/Utils';
import { cva } from 'class-variance-authority';
import PropTypes from 'prop-types';

const Dropdown = ({ options, className, size, ...rest }) => {
    const InputVariants = cva('fl-input', {
        variants: {
            size: {
                small: 'p-1.5 text-sm',
                medium: 'p-2.5 text-sm',
                large: 'p-2.5 text-base'
            }
        },
        defaultVariants: {
            size: 'medium'
        }
    });
    return (
        <select
            className={cn(
                InputVariants({ size }),
                'bg-gray-100 w-full border border-gray-200 rounded-lg focus:border-2 focus:border-indigo-500',
                className
            )}
            {...rest}
        >
            {options.map((i, idx) => (
                <option key={idx} value={i.val}>
                    {i.title}
                </option>
            ))}
        </select>
    );
};

Dropdown.propTypes = {
    options: PropTypes.array.isRequired,
    className: PropTypes.string,
    size: PropTypes.string
};

export default Dropdown;
