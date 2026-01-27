import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import { FiEdit, FiArrowLeft } from 'react-icons/fi';
import PropTypes from 'prop-types';

import Button from '@/utils/components/ui/Button';
import Alert from '@/utils/components/ui/Alert';
import { DashboardCategoryByIdApi } from '@/api/DashboardCategoryApi';

/* ===== Temporary Hardcode ===== */
const ORG_MAP = { 1: 'FTP Solution' };

const DashboardCategoryDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['dashboard-category-details', id],
        queryFn: () => DashboardCategoryByIdApi(id),
        enabled: !!id
    });

    const cat = data?.data;

    if (isLoading) {
        return (
            <div className="flex justify-center py-10">
                <RotatingLines width="24" />
            </div>
        );
    }

    if (isError) return <Alert.Error>{error?.message || 'Failed to load category'}</Alert.Error>;
    if (!cat) return <Alert.Warning>No category found</Alert.Warning>;

    return (
        <div className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 px-4 py-8">
            <div className="w-full max-w-xl mx-auto">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900">Category Details</h1>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col gap-5">
                    <Grid>
                        <Field label="Category ID" value={cat.dashboard_category_id} />
                        <Field label="Organization" value={ORG_MAP[cat.organization_id] || cat.organization_id} />
                    </Grid>

                    <Grid>
                        <Field label="Name" value={cat.name} />
                        <Field label="Description" value={cat.description || '-'} />
                    </Grid>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <FiArrowLeft /> Back
                        </button>
                        <Button onClick={() => navigate(`/dashboard-category/edit/${id}`)}>
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
        <div className="w-full px-3 py-2.5 text-sm border rounded-lg bg-slate-50/60 border-slate-300">{value || '-'}</div>
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

export default DashboardCategoryDetails;
