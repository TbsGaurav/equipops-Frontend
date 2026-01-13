// src/utils/toast.js
import toast from 'react-hot-toast';

const Toast = {
    success(message, options = {}) {
        toast.success(message, {
            duration: 2000,
            ...options
        });
    },

    error(message, options = {}) {
        toast.error(message, {
            duration: 3000,
            ...options
        });
    },

    warning(message, options = {}) {
        toast(message, {
            icon: '⚠️',
            duration: 3000,
            ...options
        });
    },

    info(message, options = {}) {
        toast(message, {
            icon: 'ℹ️',
            duration: 2500,
            ...options
        });
    }
};

export default Toast;
