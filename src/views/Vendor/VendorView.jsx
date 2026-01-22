import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import Alert from '@/utils/components/ui/Alert';
import { VendorByIdApi } from '@/api/VendorApi';

const VendorView = () => {
    const { vendor_id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['vendor-by-id', vendor_id],
        queryFn: () => VendorByIdApi(vendor_id),
        enabled: !!vendor_id
    });

    const vendor = data?.value?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load vendor details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-500 px-5 py-4 sm:px-8">
                        <h1 className="text-3xl font-bold text-white">Vendor Details</h1>
                        <p className="mt-1 text-blue-100 text-sm">View vendor information</p>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ViewText label="Vendor Name" value={vendor?.name} />
                            <ViewText label="Service Type" value={vendor?.service_type} />
                            <ViewText label="Organization" value={vendor?.organization_name} />
                            <ViewText label="Email" value={vendor?.email} />
                            <ViewText label="Phone" value={vendor?.phone} />
                            <ViewText label="Created At" value={formatDate(vendor?.created_at)} />
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => navigate('/vendor')}
                                className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-all"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
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

export default VendorView;
