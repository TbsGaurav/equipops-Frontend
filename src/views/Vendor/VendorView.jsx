import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';

import Button from '@/utils/components/ui/Button';
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
            <div className="min-h-screen flex items-center justify-center">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load vendor details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Vendor Details</h1>
                    <p className="mt-2 text-gray-500">View vendor information</p>
                </div>

                {/* TEXT-ONLY VIEW */}
                <div className="space-y-6">
                    <ViewText label="Vendor Name" value={vendor?.name} />
                    <ViewText label="Service Type" value={vendor?.service_type} />
                    <ViewText label="Organization Name" value={vendor?.organization_name} />
                    <ViewText label="Email" value={vendor?.email} />
                    <ViewText label="Phone" value={vendor?.phone} />
                    <ViewText
                        label="Created At"
                        value={
                            vendor?.created_at
                                ? new Date(vendor.created_at).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                  })
                                : '—'
                        }
                    />

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button variant="outlined" onClick={() => navigate('/vendor')} className="flex-1">
                            Back
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ViewText = ({ label, value }) => (
    <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="mt-1 text-sm text-gray-700">{value || '—'}</p>
    </div>
);

ViewText.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

export default VendorView;
