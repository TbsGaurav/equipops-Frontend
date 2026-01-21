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
            <div className="min-h-screen flex items-center justify-center">
                <RotatingLines strokeColor="#6366f1" width="32" />
            </div>
        );
    }

    if (isError) {
        return <Alert.Error className="m-6">{error?.message || 'Failed to load equipment category details'}</Alert.Error>;
    }

    return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Category Details</h1>
                    <p className="mt-2 text-gray-500">View equipment category information</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ViewText label="Category Name" value={category?.category_name} />
                    <ViewText label="Organization Name" value={category?.organization_name} />
                    <ViewText label="Description" value={category?.description} />
                    <ViewText
                        label="Created At"
                        value={
                            category?.created_at
                                ? new Date(category.created_at).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                  })
                                : '—'
                        }
                    />
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate('/EquipmentCategory')}
                        className="px-6 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    >
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
};

const ViewText = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="mt-1 text-sm text-gray-900">{value || '—'}</p>
    </div>
);

ViewText.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])
};

export default EquipmentCategoryView;
