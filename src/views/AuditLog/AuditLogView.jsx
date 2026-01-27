import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import Alert from '@/utils/components/ui/Alert';
import { AuditLogByIdApi } from '@/api/AuditLogApi';
import PropTypes from 'prop-types';

const formatJson = (jsonString) => {
    if (!jsonString) return '—';
    try {
        const obj = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        return JSON.stringify(obj, null, 2);
    } catch {
        return jsonString || '—';
    }
};

const InfoItem = ({ label, value }) => (
    <div className="space-y-1">
        <dt className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
        <dd className="text-base text-gray-900 font-medium break-words">{value || '—'}</dd>
    </div>
);

InfoItem.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

const DataCard = ({ title, content, bgColor, textColor }) => (
    <div className={`rounded-xl border p-6 ${bgColor}`}>
        <h3 className={`text-lg font-semibold mb-4 ${textColor}`}>{title}</h3>
        <pre className="text-sm bg-white/70 p-4 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap border border-gray-200/70">
            {formatJson(content)}
        </pre>
    </div>
);

DataCard.propTypes = {
    title: PropTypes.string.isRequired,
    content: PropTypes.any,
    bgColor: PropTypes.string,
    textColor: PropTypes.string
};

const AuditLogView = () => {
    const { audit_id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['audit-log-by-id', audit_id],
        queryFn: () => AuditLogByIdApi(audit_id),
        enabled: !!audit_id
    });

    const auditLog = data?.value?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <RotatingLines strokeColor="#4f46e5" width="40" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Alert.Error>{error?.message || 'Failed to load audit log details'}</Alert.Error>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                {' '}
                {/* smaller width */}
                <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-600 px-5 py-4 sm:px-8 text-center">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">Audit Log Details</h1>
                        <p className="mt-1 text-indigo-100 text-sm">Track changes • {auditLog?.entity_name || '—'}</p>
                    </div>

                    {/* Main Content */}
                    <div className="p-4 sm:p-6">
                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem label="Organization" value={auditLog?.organization_name} />
                            <InfoItem label="User" value={auditLog?.user_name} />
                            <InfoItem label="Entity" value={auditLog?.entity_name} />
                            <InfoItem label="Action" value={auditLog?.action} />
                            <InfoItem label="IP Address" value={auditLog?.ip_address} />
                            <InfoItem
                                label="Created At"
                                value={
                                    auditLog?.created_at
                                        ? new Date(auditLog.created_at).toLocaleString('en-GB', {
                                              dateStyle: 'medium',
                                              timeStyle: 'short'
                                          })
                                        : '—'
                                }
                            />
                        </div>

                        {/* Old/New Data */}
                        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <DataCard
                                title="Old Data"
                                content={auditLog?.old_data}
                                bgColor="bg-amber-50 border-amber-200"
                                textColor="text-amber-800"
                            />
                            <DataCard
                                title="New Data"
                                content={auditLog?.new_data}
                                bgColor="bg-emerald-50 border-emerald-200"
                                textColor="text-emerald-800"
                            />
                        </div>

                        {/* Back Button */}
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => navigate('/AuditLog')}
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

export default AuditLogView;
