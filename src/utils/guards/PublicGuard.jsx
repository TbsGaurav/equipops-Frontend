import useAuth from '@/hooks/useAuth';
import { clearUser } from '@/store/userSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import PropTypes from 'prop-types';

/**
 * PublicGuard
 *
 * A route guard component that protects public routes from authenticated users.
 * If user is logged in, redirects to home (/). Otherwise, clears user state and renders children.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Elements to render if user is not authenticated (required).
 * @returns {JSX.Element|null} Children if not authenticated, null otherwise.
 *
 * Example:
 * <PublicGuard>
 *   <Login />
 * </PublicGuard>
 */
const PublicGuard = ({ children }) => {
    const { isLogin } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        if (isLogin) {
            navigate('/dashboard');
        } else {
            dispatch(clearUser());
        }
    }, [isLogin, location.pathname, navigate, dispatch]);

    if (isLogin) return null;
    return children;
};

PublicGuard.propTypes = {
    children: PropTypes.node.isRequired
};

PublicGuard.displayName = 'PublicGuard';

export default PublicGuard;
