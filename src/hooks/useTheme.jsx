import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('Context must be use inside provider.');
    return context;
};

export default useTheme;
