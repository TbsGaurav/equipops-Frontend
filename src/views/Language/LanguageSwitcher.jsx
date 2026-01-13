import * as Select from '@radix-ui/react-select';
import { FiCheck } from 'react-icons/fi';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MasterDropdownListApi } from '@/api/MasterDropdownApi';
import useLanguage from '@/hooks/useLanguage';
import { LuLanguages } from 'react-icons/lu';

const LanguageSwitcher = () => {
    const { language, changeLanguage } = useLanguage();

    const { data } = useQuery({
        queryKey: ['master-dropdowns'],
        queryFn: MasterDropdownListApi,
        select: (res) => res.data
    });

    const languages = useMemo(() => data?.languages ?? [], [data]);

    useEffect(() => {
        if (!language && languages.length > 0) {
            const defaultLang = languages[0];
            changeLanguage(defaultLang);
        }
    }, [languages, language, changeLanguage]);

    const handleChange = (langId) => {
        const selected = languages.find((l) => l.id === langId);
        if (!selected) return;
        changeLanguage({ id: selected.id, code: selected.code, dir: selected.direction });
    };

    return (
        <Select.Root value={language?.id ?? ''} onValueChange={handleChange}>
            <Select.Trigger aria-label="Select language" className="flex items-center justify-center">
                <LuLanguages size={20} />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    side="bottom"
                    align="center"
                    sideOffset={8}
                    position="popper"
                    className="mt-3 bg-white border border-gray-200 rounded-md shadow-lg min-w-[180px]"
                >
                    <Select.Viewport className="p-1">
                        {languages.map((lang) => (
                            <Select.Item
                                key={lang.id}
                                value={lang.id}
                                className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer text-gray-700 hover:bg-gray-100"
                            >
                                <Select.ItemText>
                                    {lang.name} ({lang.code})
                                </Select.ItemText>
                                <Select.ItemIndicator className="absolute left-2">
                                    <FiCheck className="text-primary-dark" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

export default LanguageSwitcher;
