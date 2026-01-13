import { useQuery } from '@tanstack/react-query';
import { MenuByLanguageApi } from '@/api/SettingApi';
import useLanguage from './useLanguage';

const DEFAULT_LANGUAGE_ID = '0caf7266-d1e8-41f7-8840-be6095a3e0ef';

export const useTranslate = () => {
    const { language } = useLanguage();
    const languageId = language?.id || DEFAULT_LANGUAGE_ID;

    const { data } = useQuery({
        queryKey: ['menu-translation', languageId],
        queryFn: () => MenuByLanguageApi({ languageId }),
        enabled: !!languageId,
        staleTime: Infinity
    });

    const translations = data?.data || {};
    const t = (key) => translations[key] || key;

    return { t, languageId };
};
