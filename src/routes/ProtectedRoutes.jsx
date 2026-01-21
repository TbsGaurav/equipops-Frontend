import ProtectedLayout from '@/utils/layouts/ProtectedLayout';
import Setting from '@/views/Setting';
import Profile from '@/views/Profile';
import Interviews from '@/views/Interviews';
import Interviewers from '@/views/Interviewers';
import InterviewInfo from '@/views/Interviews/Details';
import EditInterview from '@/views/Interviews/EditInterview';
import CandidateInfo from '@/views/Interviews/Details/Candidate';
import ChangePassword from '@/views/Profile/ChangePassword';
import InterviewCall from '@/views/InterviewCall';
import PrivateGuard from '@/utils/guards/PrivateGuard';
import InterviewerVoiceList from '@/views/Interviewers/InterviewerVoiceList';
import CreateInterviewer from '@/views/Interviewers/CreateInterviewer';
import UserManagement from '@/views/UserManagement';
import UserForm from '@/views/UserManagement/UserForm';
import Language from '@/views/Language';
import Subscription from '@/views/Subscription';
import CreateInterview from '@/views/Interviews/CreateInterview/Index';
import ApplicationForm from '@/views/Interviews/ApplicationForm';
import EmailTemplate from '@/views/EmailTemplate';
import MenuType from '@/views/MenuType';
import MenuPermission from '@/views/MenuPermission';
import Candidate from '@/views/Candidate';
import InterviewType from '@/views/Interviews/InterviewType';
import JobTemplate from '@/views/JobTemplate';
import OrganizationDetails from '@/views/Organization/OrganizationDetails';
import LanguageView from '@/views/Language/LanguageView';
import OrganizationForm from '@/views/Organization/OrganizationForm';
import Organization from '@/views/Organization';
import Dashboard from '@/views/Dashboard';
import RoleGuard from './RoleGuard';
import OrgListByStatus from '@/views/Organization/OrgListByStatus';
import JobApplicationForm from '@/views/JobApplicationForm';
import Equipment from '@/views/Equipment';
import EquipmentForm from '@/views/Equipment/EquipmentForm';
import Vendor from '@/views/Vendor';
import EquipmentCategory from '@/views/EquipmentCategory';
import EquipmentCategoryForm from '@/views/EquipmentCategory/EquipmentCategoryForm';
import VendorForm from '@/views/Vendor/VendorForm';
import EquipmentFailure from '@/views/EquipmentFailure';
import EquipmentFailureForm from '@/views/EquipmentFailure/EquipmentFailureForm';
import EquipmentSubpart from '@/views/EquipmentSubpart';
import EquipmentSubpartForm from '@/views/EquipmentSubpart/EquipmentSubpartForm';
import EquipmentDetails from '@/views/Equipment/EquipmentDetails';
import AuditLog from '@/views/AuditLog';
import Permission from '@/views/Permission';
import PermissionForm from '@/views/Permission/PermissionForm';
import VendorView from '@/views/Vendor/VendorView';
import EquipmentCategoryView from '@/views/EquipmentCategory/EquipmentCategoryView';
import EquipmentFailureView from '@/views/EquipmentFailure/EquipmentFailureView';
import EquipmentSubpartView from '@/views/EquipmentSubpart/EquipmentSubpartView';
import PermissionView from '@/views/Permission/PermissionView';

const ProtectedRoutes = [
    {
        element: (
            <PrivateGuard>
                <ProtectedLayout />
            </PrivateGuard>
        ),
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'job',
                children: [
                    { path: '', element: <Interviews /> },
                    { path: 'create', element: <CreateInterview /> },
                    {
                        path: 'detail/:id',
                        element: <InterviewInfo />
                    },
                    {
                        path: 'candidate-details/:candidateId?',
                        element: <CandidateInfo />
                    },
                    {
                        path: 'edit/:id',
                        element: <EditInterview />
                    },
                    {
                        path: ':id/application-form/:formId?',
                        element: <ApplicationForm />
                    }
                ]
            },
            {
                path: 'interviewers',
                children: [
                    {
                        path: '',
                        element: <Interviewers />
                    },
                    {
                        path: 'create',
                        element: <CreateInterviewer />
                    },
                    {
                        path: 'edit/:id',
                        element: <CreateInterviewer />
                    },
                    {
                        path: 'voices',
                        element: <InterviewerVoiceList />
                    }
                ]
            },
            {
                path: 'interview-types',
                children: [
                    {
                        path: '',
                        element: <InterviewType />
                    }
                ]
            },
            {
                path: 'setting',
                element: <Setting />
            },
            {
                path: 'profile',
                children: [
                    { path: '', element: <Profile /> },
                    { path: 'change-password', element: <ChangePassword /> }
                ]
            },

            {
                path: 'organization',
                children: [
                    { path: '', element: <Organization /> },
                    { path: 'create', element: <OrganizationForm /> },
                    { path: 'edit/:organizationId', element: <OrganizationForm /> },
                    {
                        path: 'org-by-status',
                        element: (
                            <RoleGuard allow={['Super Admin']}>
                                <OrgListByStatus />
                            </RoleGuard>
                        )
                    }
                ]
            },
            {
                path: 'equipment',
                children: [
                    { path: '', element: <Equipment /> },
                    { path: 'create', element: <EquipmentForm /> },
                    { path: 'edit/:id', element: <EquipmentForm /> },
                    { path: '/equipment/view/:id', element: <EquipmentDetails /> }
                ]
            },
            {
                path: 'vendor',
                children: [
                    { path: '', element: <Vendor /> },
                    { path: 'create', element: <VendorForm /> },
                    { path: 'edit/:vendor_id', element: <VendorForm /> },
                    { path: '/vendor/view/:vendor_id', element: <VendorView /> }
                ]
            },
            {
                path: 'equipmentcategory',
                children: [
                    { path: '', element: <EquipmentCategory /> },
                    { path: 'create', element: <EquipmentCategoryForm /> },
                    { path: 'edit/:category_id', element: <EquipmentCategoryForm /> },
                    { path: '/equipmentcategory/view/:category_id', element: <EquipmentCategoryView /> }
                ]
            },
            {
                path: 'equipmentfailure',
                children: [
                    { path: '', element: <EquipmentFailure /> },
                    { path: 'create', element: <EquipmentFailureForm /> },
                    { path: 'edit/:failure_id', element: <EquipmentFailureForm /> },
                    { path: '/equipmentfailure/view/:failure_id', element: <EquipmentFailureView /> }
                ]
            },
            {
                path: 'equipmentsubpart',
                children: [
                    { path: '', element: <EquipmentSubpart /> },
                    { path: 'create', element: <EquipmentSubpartForm /> },
                    { path: 'edit/:subpart_id', element: <EquipmentSubpartForm /> },
                    { path: '/equipmentsubpart/view/:subpart_id', element: <EquipmentSubpartView /> }
                ]
            },
            {
                path: 'auditlog',
                children: [
                    { path: '', element: <AuditLog /> }
                    // { path: 'create', element: <EquipmentSubpartForm /> },
                    // { path: 'edit/:subpart_id', element: <EquipmentSubpartForm /> }
                ]
            },
            {
                path: 'permission',
                children: [
                    { path: '', element: <Permission /> },
                    { path: 'create', element: <PermissionForm /> },
                    { path: 'edit/:permission_id', element: <PermissionForm /> },
                    { path: '/permission/view/:permission_id', element: <PermissionView /> }
                ]
            },
            {
                path: 'organization/:orgId/users',
                element: <OrganizationDetails />
            },

            {
                path: 'user-management',
                children: [
                    { path: '', element: <UserManagement /> },
                    { path: 'create', element: <UserForm /> },
                    { path: 'edit/:userId', element: <UserForm /> }
                ]
            },
            {
                path: 'language',
                children: [
                    { path: '', element: <Language /> },
                    { path: 'view/:languageId', element: <LanguageView /> }
                ]
            },
            {
                path: 'subscription',
                children: [{ path: '', element: <Subscription /> }]
            },
            {
                path: 'email-template',
                children: [{ path: '', element: <EmailTemplate /> }]
            },
            {
                path: 'menu-type',
                children: [{ path: '', element: <MenuType /> }]
            },
            {
                path: 'menu-permission',
                children: [{ path: '', element: <MenuPermission /> }]
            },
            {
                path: 'candidate',
                children: [{ path: '', element: <Candidate /> }]
            },
            {
                path: 'job-template',
                children: [{ path: '', element: <JobTemplate /> }]
            }
        ]
    },
    { path: 'call/:token?', element: <InterviewCall /> },
    { path: 'job-application/:applicationID', element: <JobApplicationForm /> }
];
export default ProtectedRoutes;
