import { createContext, useCallback, useMemo, useState } from 'react';
import { getLanguage, setLanguage, setLanguageId } from '@/utils/Utils';
import PropTypes from 'prop-types';

const LanguageContext = createContext(null);

const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => getLanguage());

    const changeLanguage = useCallback((lang) => {
        setLanguage(lang);
        setLanguageId(lang.id);
        setLanguageState(lang);

        document.documentElement.setAttribute('dir', lang.dir || 'ltr');
    }, []);

    const contextValue = useMemo(() => ({ language, changeLanguage }), [language, changeLanguage]);

    return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

LanguageProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export { LanguageContext, LanguageProvider };
