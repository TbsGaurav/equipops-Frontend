import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { FiEdit, FiArrowLeft } from 'react-icons/fi';
import PropTypes from 'prop-types';

import Button from '@/utils/components/ui/Button';
import Alert from '@/utils/components/ui/Alert';

import { SlaMetricsByIdApi } from '@/api/SlaMetricsApi';
import { Organization1DropdownApi1, EquipmentDropdownApi1 } from '@/api/DropdownApi';

/* ===== SLA Metrics Details ===== */

const SlaMetricsDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    /* ===== SLA DETAILS ===== */
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sla-metrics-details', id],
        queryFn: () => SlaMetricsByIdApi(id),
        enabled: !!id
    });

    const sla = data?.data;

    /* ===== ORGANIZATION DROPDOWN (FOR NAME MAPPING) ===== */
    const { data: orgData = [] } = useQuery({
        queryKey: ['organization-dropdown'],
        queryFn: async () => (await Organization1DropdownApi1())?.data || []
    });

    const orgMap = {};
    orgData.forEach((o) => {
        orgMap[o.organization_id] = o.name;
    });

    /* ===== EQUIPMENT DROPDOWN (FOR NAME MAPPING) ===== */
    const { data: equipmentData = [] } = useQuery({
        queryKey: ['equipment-dropdown'],
        queryFn: async () => (await EquipmentDropdownApi1())?.data || []
    });

    const equipmentMap = {};
    equipmentData.forEach((e) => {
        equipmentMap[e.equipment_id] = e.name;
    });

    /* ===== STATES ===== */
    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <RotatingLines width="24" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error>{error?.message || 'Failed to load SLA details'}</Alert.Error>;
    }

    if (!sla) {
        return <Alert.Warning>No SLA record found</Alert.Warning>;
    }

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900">SLA Metrics Details</h1>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                    <Grid>
                        <Field label="SLA ID" value={sla.sla_id} />
                        <Field label="Organization" value={orgMap[sla.organization_id] || sla.organization_id} />
                    </Grid>

                    <Grid>
                        <Field label="Equipment" value={equipmentMap[sla.equipment_id] || sla.equipment_id} />
                        <Field label="Subpart ID" value={sla.subpart_id || '-'} />
                    </Grid>

                    <Grid>
                        <Field label="Period Start" value={formatDate(sla.period_start)} />
                        <Field label="Period End" value={formatDate(sla.period_end)} />
                    </Grid>

                    <Grid>
                        <Field label="Downtime (minutes)" value={sla.downtime_minutes} />
                        <Field
                            label="SLA Breached"
                            value={
                                <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                        sla.sla_breached ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                    }`}
                                >
                                    {sla.sla_breached ? 'Yes' : 'No'}
                                </span>
                            }
                        />
                    </Grid>

                    <Grid>
                        <Field label="Created At" value={formatDateTime(sla.created_at)} />
                    </Grid>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <FiArrowLeft /> Back
                        </button>

                        <Button onClick={() => navigate(`/sla-metrics/edit/${id}`)}>
                            <FiEdit /> Edit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ===== Helper Functions ===== */

const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : '-');

const formatDateTime = (date) => (date ? new Date(date).toLocaleString() : '-');

/* ===== Components ===== */

const Grid = ({ children }) => <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;

const Field = ({ label, value }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        <div className="w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 border-slate-300">{value ?? '-'}</div>
    </div>
);

/* ===== PropTypes ===== */

Grid.propTypes = {
    children: PropTypes.node
};

Field.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

export default SlaMetricsDetails;
