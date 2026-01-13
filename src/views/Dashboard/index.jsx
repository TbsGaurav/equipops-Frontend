import UserDashboard from './UserDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import OrganizationDashboard from './OrganizationDashboard';
import { useUserRole } from '@/utils/Utils';

export default function Dashboard() {
    const role = useUserRole();

    if (!role) return null;

    switch (role) {
        case 'Organization Admin':
            return <OrganizationDashboard />;

        case 'Super Admin':
            return <SuperAdminDashboard />;

        default:
            return <UserDashboard />;
    }
}
