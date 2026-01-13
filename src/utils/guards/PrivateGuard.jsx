import useAuth from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import PropTypes from 'prop-types';

/**
 * PrivateGuard
 *
 * A route guard component that protects routes from unauthenticated users.
 * If user is not logged in, redirects to /login. Otherwise, renders children.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elements to render if user is authenticated (required).
 * @returns {JSX.Element|null} Children if authenticated, null otherwise.
 *
 * Example:
 * <PrivateGuard>
 *   <Dashboard />
 * </PrivateGuard>
 */
const PrivateGuard = ({ children }) => {
    const { isLogin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLogin) {
            navigate('/login');
        } else if (location.pathname === '/') {
            navigate('/dashboard');
        }
    }, [isLogin, navigate, location.pathname]);

    if (!isLogin) return null;
    return children;
};

PrivateGuard.propTypes = {
    children: PropTypes.node.isRequired
};

PrivateGuard.displayName = 'PrivateGuard';

export default PrivateGuard;
// ...existing code...
