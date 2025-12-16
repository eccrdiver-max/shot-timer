import React, { createContext, useState, useCallback, ReactNode, useEffect } from 'react';

type Language = 'it' | 'en';
type Translations = Record<string, string>;
type TranslationKey = string;

// Cache to avoid re-fetching
const loadedTranslations: Partial<Record<Language, Translations>> = {};

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
    loading: boolean;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('it');
    const [currentTranslations, setCurrentTranslations] = useState<Translations>({});
    const [loading, setLoading] = useState(true);

    const loadLanguage = useCallback(async (lang: Language) => {
        if (loadedTranslations[lang]) {
            return loadedTranslations[lang];
        }
        try {
            // Paths are relative to the root where index.html is served
            const response = await fetch(`/i18n/locales/${lang}.json`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            loadedTranslations[lang] = data;
            return data;
        } catch (error) {
            console.error(`Failed to load translations for '${lang}':`, error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            try {
                // Load Italian as a fallback and the selected language in parallel
                const languagesToLoad: Language[] = ['it'];
                if (language !== 'it') {
                    languagesToLoad.push(language);
                }
                
                await Promise.all(languagesToLoad.map(lang => loadLanguage(lang)));

                // Set the current translations based on the selected language, or fallback to Italian
                setCurrentTranslations(loadedTranslations[language] || loadedTranslations.it!);

            } catch (error) {
                console.error("Initialization of translations failed. Using fallback.", error);
                if (loadedTranslations.it) {
                    setCurrentTranslations(loadedTranslations.it);
                }
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, [language, loadLanguage]);

    const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>): string => {
        const fallbackTranslations = loadedTranslations.it || {};
        const template = currentTranslations[key] || fallbackTranslations[key] || key;
        
        if (vars) {
            return Object.keys(vars).reduce((acc, varKey) => {
                const regex = new RegExp(`{{${varKey}}}`, 'g');
                return acc.replace(regex, String(vars[varKey]));
            }, template);
        }

        return template;
    }, [currentTranslations]);

    const value = {
        language,
        setLanguage,
        t,
        loading,
    };

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};
