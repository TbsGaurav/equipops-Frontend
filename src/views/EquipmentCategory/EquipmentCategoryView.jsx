import { useParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { RotatingLines } from 'react-loader-spinner';
import PropTypes from 'prop-types';
import Alert from '@/utils/components/ui/Alert';
import { EquipmentCategoryByIdApi } from '@/api/EquipmentCategoryApi';

const EquipmentCategoryView = () => {
    const { category_id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['equipment-category-by-id', category_id],
        queryFn: () => EquipmentCategoryByIdApi(category_id),
        enabled: !!category_id
    });

    const category = data?.value?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load equipment category details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl">
                <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-500 px-5 py-4 sm:px-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Category Details</h1>
                        <p className="mt-1 text-blue-100 text-sm">View equipment category information</p>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 sm:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ViewText label="Category Name" value={category?.category_name} />
                            <ViewText label="Organization Name" value={category?.organization_name} />
                            <ViewText label="Description" value={category?.description} />
                            <ViewText label="Created At" value={formatDate(category?.created_at)} />
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={() => navigate('/EquipmentCategory')}
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

export default EquipmentCategoryView;
