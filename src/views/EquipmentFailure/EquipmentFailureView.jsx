import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import Alert from '@/utils/components/ui/Alert';
import { EquipmentFailureByIdApi } from '@/api/EquipmentFailureApi';

const EquipmentFailureView = () => {
    const { failure_id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['equipment-failure-by-id', failure_id],
        queryFn: () => EquipmentFailureByIdApi(failure_id),
        enabled: !!failure_id
    });

    const failure = data?.value?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load equipment failure details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Equipment Failure Details</h1>
                    <p className="mt-2 text-gray-500">View equipment failure information</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ViewText label="Failure Type" value={failure?.failure_type} />
                    <ViewText label="Failure Date" value={formatDate(failure?.failure_date)} />
                    <ViewText label="Organization Name" value={failure?.organization_name} />
                    <ViewText label="Equipment Name" value={failure?.equipment_name} />
                    <ViewText label="Subpart Name" value={failure?.subpart_name} />
                    <ViewText label="Downtime (minutes)" value={failure?.downtime_minutes} />
                    <ViewText label="Description" value={failure?.description} />
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/EquipmentFailure')}
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

export default EquipmentFailureView;
