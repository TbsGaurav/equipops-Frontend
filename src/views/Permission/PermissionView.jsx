import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import Alert from '@/utils/components/ui/Alert';
import { PermissionByIdApi } from '@/api/PermissionApi';

const PermissionView = () => {
    const { permission_id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['permission-by-id', permission_id],
        queryFn: () => PermissionByIdApi(permission_id),
        enabled: !!permission_id
    });

    const permission = data?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load permission details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Permission Details</h1>
                    <p className="mt-2 text-gray-500">View permission information</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ViewText label="Permission Code" value={permission?.permission_code} />
                    <ViewText label="Description" value={permission?.description} />
                    <ViewText
                        label="Status"
                        value={
                            <span
                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                    permission?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {permission?.is_active ? 'Active' : 'Inactive'}
                            </span>
                        }
                    />
                    <ViewText label="Created At" value={formatDate(permission?.created_at)} />
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/permission')}
                        className="px-6 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
};

const formatDate = (date) =>
    date
        ? new Date(date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
          })
        : '—';

const ViewText = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <div className="mt-1 text-sm text-gray-900">{value || '—'}</div>
    </div>
);

ViewText.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

export default PermissionView;
