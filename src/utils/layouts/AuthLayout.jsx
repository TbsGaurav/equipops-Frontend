import { Outlet } from 'react-router';

const AuthLayout = () => {
    return (
        <div className="flex min-h-dvh items-center justify-center p-2">
            <Outlet />
        </div>
    );
};

export default AuthLayout;
