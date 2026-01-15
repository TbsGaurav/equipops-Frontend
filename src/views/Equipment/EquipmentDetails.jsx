import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { FiEdit, FiArrowLeft } from 'react-icons/fi';
import PropTypes from 'prop-types';

import Button from '@/utils/components/ui/Button';
import Alert from '@/utils/components/ui/Alert';
import { EquipmentByIdApi } from '@/api/EquipmentApi';

/* ===== Hardcode (temporary) ===== */
const CATEGORY_MAP = {
    1: 'MRI Machines',
    2: 'CT Scanners',
    3: 'X-Ray Machines',
    4: 'Ventilators',
    5: 'Ultrasound Machines'
};

const ORG_MAP = {
    1: 'FTP Solution'
};

const EquipmentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['equipment-details', id],
        queryFn: () => EquipmentByIdApi(id),
        enabled: !!id
    });

    const eq = data?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <RotatingLines width="24" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error>{error?.message || 'Failed to load equipment details'}</Alert.Error>;
    }

    if (!eq) {
        return <Alert.Warning>No equipment found</Alert.Warning>;
    }

    const purchaseDate = eq.PurchaseDate || eq.purchaseDate ? new Date(eq.PurchaseDate || eq.purchaseDate).toLocaleDateString() : '-';

    const statusValue = eq.Status ?? eq.status;
    const orgId = eq.OrganizationId ?? eq.organizationId;
    const catId = eq.CategoryId ?? eq.categoryId;

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-2xl mx-auto">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900">Equipment Details</h1>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                    <Grid>
                        <Field label="Equipment ID" value={eq.EquipmentId ?? eq.equipmentId ?? '-'} />
                        <Field label="Organization" value={ORG_MAP[orgId] || orgId || '-'} />
                    </Grid>

                    <Grid>
                        <Field label="Category" value={CATEGORY_MAP[catId] || catId || '-'} />
                        <Field label="Status" value={statusValue == 1 ? 'Active' : 'Inactive'} />
                    </Grid>

                    <Grid>
                        <Field label="Equipment Name" value={eq.Name ?? eq.name ?? '-'} />
                        <Field label="Type" value={eq.Type ?? eq.type ?? '-'} />
                    </Grid>

                    <Grid>
                        <Field label="Location" value={eq.Location ?? eq.location ?? '-'} />
                        <Field label="QR Code" value={eq.QrCode ?? eq.qrCode ?? '-'} />
                    </Grid>

                    <Grid>
                        <Field label="Purchase Date" value={purchaseDate} />
                    </Grid>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <FiArrowLeft /> Back
                        </button>
                        <Button onClick={() => navigate(`/equipment/edit/${id}`)}>
                            <FiEdit /> Edit
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ===== Components ===== */

const Grid = ({ children }) => <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;

const Field = ({ label, value }) => (
    <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
        <div className="w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 border-slate-300">{value}</div>
    </div>
);

/* ===== PropTypes Fix ===== */
Grid.propTypes = {
    children: PropTypes.node
};

Field.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

export default EquipmentDetails;
