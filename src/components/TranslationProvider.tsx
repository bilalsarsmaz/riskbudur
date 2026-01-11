
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type TranslationMap = Record<string, string>;

interface TranslationContextType {
    language: string;
    setLanguage: (lang: string) => Promise<void>;
    t: (key: string, fallback?: string) => string;
    translations: TranslationMap;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
    children: React.ReactNode;
    initialLanguage: string;
    initialTranslations: TranslationMap;
}

export function TranslationProvider({
    children,
    initialLanguage,
    initialTranslations
}: TranslationProviderProps) {
    const [language, setLanguageState] = useState(initialLanguage);
    const [translations, setTranslations] = useState(initialTranslations);
    const router = useRouter();

    // Sync with initial props if they change (e.g. server re-render)
    useEffect(() => {
        setLanguageState(initialLanguage);
        setTranslations(initialTranslations);
    }, [initialLanguage, initialTranslations]);

    const setLanguage = async (lang: string) => {
        try {
            // 1. Fetch new translations
            const res = await fetch(`/api/translations/${lang}`);
            if (!res.ok) throw new Error("Failed to fetch translations");
            const newTranslations = await res.json();

            // 2. Update state
            setTranslations(newTranslations);
            setLanguageState(lang);

            // 3. Persist (Cookie or LocalStorage)
            // Ideally set a cookie so the server knows next time
            document.cookie = `NEXT_LOCALE=${lang}; path=/; max-age=31536000; SameSite=Lax`;

            // 4. Refresh to update server components if needed
            router.refresh();

        } catch (error) {
            console.error("Language switch error:", error);
        }
    };

    const t = (key: string, fallback?: string) => {
        return translations[key] || fallback || key;
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage, t, translations }}>
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error("useTranslation must be used within a TranslationProvider");
    }
    return context;
}
