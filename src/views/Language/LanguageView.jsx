import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MenuByLanguageApi, MenuByLanguageUpdateApi } from '@/api/SettingApi';
import { RotatingLines } from 'react-loader-spinner';
import { useNavigate, useParams } from 'react-router';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdKeyboardArrowLeft } from 'react-icons/md';
import { useTranslate } from '@/hooks/useTranslate';

const LanguageView = () => {
    const { languageId } = useParams();
    const [editableTranslations, setEditableTranslations] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { t } = useTranslate();

    const { data, isLoading } = useQuery({
        queryKey: ['menu-translation', languageId],
        queryFn: () => MenuByLanguageApi({ languageId }),
        enabled: !!languageId,
        staleTime: Infinity
    });

    const translations = data?.data ? Object.entries(data.data) : [];

    useEffect(() => {
        if (data?.data) {
            setEditableTranslations(data.data);
        }
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex justify-center p-6">
                <RotatingLines height="24" width="24" />
            </div>
        );
    }

    const handleUpdate = async () => {
        if (!languageId) return;

        const payload = {
            languageId,
            data: Object.entries(editableTranslations).map(([key, value]) => ({
                key_Name: key,
                translate_Text: value
            }))
        };

        try {
            setIsUpdating(true);
            await MenuByLanguageUpdateApi(payload);
            toast.success('Translations updated successfully');

            await queryClient.invalidateQueries({
                queryKey: ['menu-translation', languageId]
            });
        } catch (error) {
            console.error(error);
            toast.error('Failed to update translations');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Fragment>
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <button className="fl-button fl-button-secondary pl-2 flex items-center" onClick={() => navigate('/language')}>
                        <MdKeyboardArrowLeft className="size-5" />
                        {t('back_btn')}
                    </button>
                    <button
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md
                                hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isUpdating ? 'Updating...' : 'Update'}
                    </button>
                </div>
                {/* ================= Table ================= */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm mt-4">
                    {/* ---------- TABLE HEADER (STATIC) ---------- */}
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-3 text-left font-semibold w-1/2">Key Name</th>
                                <th className="p-3 text-left font-semibold w-1/2">Translation Text</th>
                            </tr>
                        </thead>
                    </table>
                    {/* ---------- TABLE BODY (SCROLLS) ---------- */}
                    <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                        <table className="w-full text-sm">
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={2} className="p-10 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <RotatingLines height="24" width="24" />
                                                Loading texts...
                                            </div>
                                        </td>
                                    </tr>
                                ) : translations.length > 0 ? (
                                    translations.map(([key]) => (
                                        <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 font-medium text-gray-800 w-1/2">{key}</td>
                                            <td className="p-3 w-1/2">
                                                <input
                                                    type="text"
                                                    value={editableTranslations[key] ?? ''}
                                                    onChange={(e) =>
                                                        setEditableTranslations((prev) => ({
                                                            ...prev,
                                                            [key]: e.target.value
                                                        }))
                                                    }
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="p-10">
                                            <div className="flex flex-col items-center text-gray-500">
                                                <div className="text-4xl mb-2">📂</div>
                                                <p className="font-semibold text-gray-600">No Texts found</p>
                                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default LanguageView;
