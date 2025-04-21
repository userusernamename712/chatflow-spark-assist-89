
import { useCallback, useEffect, useState } from "react";

const LANGUAGES = [
  { code: "ca", label: "Català" },
  { code: "en", label: "English" },
];

const LANGUAGE_KEY = "selected-language";

export function useLanguage() {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem(LANGUAGE_KEY) || "en";
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((code: string) => {
    setLanguageState(code);
  }, []);

  const languageLabel = LANGUAGES.find(l => l.code === language)?.label || "English";

  return {
    language,
    setLanguage,
    languageLabel,
    availableLanguages: LANGUAGES,
  };
}
