// utils/guards/RoleGuard.tsx
import useAuth from '@/hooks/useAuth';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router';

const RoleGuard = ({ allow, children }) => {
    const auth = useAuth();
    if (!allow.includes(auth?.user?.roleName)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

RoleGuard.propTypes = {
    allow: PropTypes.arrayOf(PropTypes.string).isRequired,
    children: PropTypes.node.isRequired
};

export default RoleGuard;
