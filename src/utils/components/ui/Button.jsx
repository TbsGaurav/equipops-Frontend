import { cn } from '@/utils/Utils';
import { cva } from 'class-variance-authority';
import PropTypes from 'prop-types';
import { RotatingLines } from 'react-loader-spinner';

const Button = ({ children, className, type, size, variant, color, loading = false, ...rest }) => {
    const ButtonVariants = cva('ai-btn', {
        variants: {
            size: {
                small: 'text-sm px-2 py-1',
                medium: 'text-base px-4 py-1.5',
                large: 'text-lg px-6 py-2'
            },
            variant: {
                contained: 'ai-btn-contained',
                outline: 'ai-btn-outline',
                text: 'ai-btn-text'
            },
            color: {
                primary: 'ai-btn-primary',
                secondary: 'ai-btn-secondary',
                success: 'ai-btn-success',
                error: 'ai-btn-error'
            }
        },
        defaultVariants: {
            size: 'medium',
            variant: 'contained',
            color: 'primary'
        }
    });

    return (
        <button type={type || 'button'} className={cn(ButtonVariants({ size, variant, color }), className)} {...rest}>
            <RotatingLines
                visible={loading}
                height="1.2em"
                width="1.2em"
                color="currentColor"
                strokeWidth="5"
                animationDuration="0.75"
                ariaLabel="rotating-lines-loading"
                wrapperStyle={{}}
                wrapperClass=""
            />
            {children}
        </button>
    );
};

Button.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    type: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    variant: PropTypes.oneOf(['contained', 'outline', 'text']),
    color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error']),
    loading: PropTypes.bool,
    rest: PropTypes.object
};
Button.displayName = 'Button';

export default Button;
