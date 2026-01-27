import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import Alert from '@/utils/components/ui/Alert';
import { EquipmentSubpartByIdApi } from '@/api/EquipmentSubpartApi';
import { QRCodeCanvas } from 'qrcode.react';

const EquipmentSubpartView = () => {
    const { subpart_id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['equipment-subpart-by-id', subpart_id],
        queryFn: () => EquipmentSubpartByIdApi(subpart_id),
        enabled: !!subpart_id
    });

    const sub = data?.value?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load equipment subpart details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-500 px-5 py-4 sm:px-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Equipment Subpart Details</h1>
                        <p className="mt-1 text-blue-100 text-sm">View equipment subpart information</p>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ViewText label="Subpart Name" value={sub?.subpart_name} />
                            <ViewText label="Equipment Name" value={sub?.equipment_name} />
                            <ViewText
                                label="QR Code"
                                value={
                                    <div className="relative inline-block group">
                                        {/* QR Code */}
                                        <QRCodeCanvas
                                            value={`${window.location.origin}/DowntimeLog/create/${sub?.subpart_id}`}
                                            size={120}
                                        />

                                        {/* Tooltip */}
                                        <div
                                            className="
                                                       absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                                                       hidden group-hover:block
                                                       whitespace-nowrap
                                                       max-w-none
                                                       bg-gray-900 text-white text-xs
                                                       px-3 py-2 rounded-md shadow-lg
                                                       z-50"
                                        >
                                            {`${window.location.origin}/DowntimeLog/create/${sub?.subpart_id}`}
                                        </div>
                                    </div>
                                }
                            />

                            <ViewText label="Description" value={sub?.description} />
                            <ViewText
                                label="Status"
                                value={
                                    <span
                                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                            sub?.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}
                                    >
                                        {sub?.status ? 'Active' : 'Inactive'}
                                    </span>
                                }
                            />
                            <ViewText label="Created Date" value={formatDate(sub?.created_at)} />
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => navigate('/equipmentsubpart')}
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

export default EquipmentSubpartView;
