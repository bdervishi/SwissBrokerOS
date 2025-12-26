import React, { createContext, useContext, useState, useEffect } from 'react';

// Use string to allow dynamic languages, but keep strict typing for defaults where helpful
export type LanguageCode = 'de' | 'fr' | 'it' | 'en' | string;

export interface LanguageDefinition {
  code: string;
  label: string;
  isSystem: boolean; // System languages cannot be deleted
  translations: Record<string, string>;
}

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  availableLanguages: LanguageDefinition[];
  addLanguage: (code: string, label: string) => void;
  updateTranslation: (code: string, key: string, value: string) => void;
  deleteLanguage: (code: string) => void;
}

const defaultTranslations: Record<string, Record<string, string>> = {
  de: {
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Klienten',
    'nav.policies': 'Policen',
    'nav.mortgages': 'Hypotheken',
    'nav.commissions': 'Provisionen',
    'nav.calendar': 'Kalender',
    'nav.partners': 'Partner Hub',
    'nav.analytics': 'Analytics',
    'nav.plans': 'Angebote & Pakete',
    'nav.integrations': 'Integrationen',
    'nav.settings': 'Einstellungen',
    'nav.tenants': 'Tenants (Makler)',
    'nav.revenue': 'Umsatz',
    'nav.my_policies': 'Meine Policen',
    'nav.languages': 'Sprachen & L10n',
    
    'ui.privacy_mode': 'Privacy Modus',
    'ui.dark_mode': 'Dunkelmodus',
    'ui.light_mode': 'Hellmodus',
    'ui.switch_role': 'Rolle wechseln',
    'ui.logout': 'Abmelden',
    'ui.language': 'Sprache',
    'ui.save': 'Speichern',
    'ui.cancel': 'Abbrechen',
    'ui.edit': 'Bearbeiten',
    
    'role.broker': 'Broker',
    'role.client': 'Klient',
    'role.admin': 'Admin',
    'role.saas': 'SaaS'
  },
  fr: {
    'nav.dashboard': 'Tableau de bord',
    'nav.clients': 'Clients',
    'nav.policies': 'Polices',
    'nav.mortgages': 'Hypothèques',
    'nav.commissions': 'Commissions',
    'nav.calendar': 'Calendrier',
    'nav.partners': 'Partenaires',
    'nav.analytics': 'Analyses',
    'nav.plans': 'Offres & Forfaits',
    'nav.integrations': 'Intégrations',
    'nav.settings': 'Paramètres',
    'nav.tenants': 'Courtiers',
    'nav.revenue': 'Revenus',
    'nav.my_policies': 'Mes Polices',
    'nav.languages': 'Langues & L10n',

    'ui.privacy_mode': 'Mode Privé',
    'ui.dark_mode': 'Mode Sombre',
    'ui.light_mode': 'Mode Clair',
    'ui.switch_role': 'Changer de rôle',
    'ui.logout': 'Se déconnecter',
    'ui.language': 'Langue',
    'ui.save': 'Enregistrer',
    'ui.cancel': 'Annuler',
    'ui.edit': 'Modifier',

    'role.broker': 'Courtier',
    'role.client': 'Client',
    'role.admin': 'Admin',
    'role.saas': 'SaaS'
  },
  it: {
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clienti',
    'nav.policies': 'Polizze',
    'nav.mortgages': 'Ipoteche',
    'nav.commissions': 'Commissioni',
    'nav.calendar': 'Calendario',
    'nav.partners': 'Partner',
    'nav.analytics': 'Analisi',
    'nav.plans': 'Offerte & Pacchetti',
    'nav.integrations': 'Integrazioni',
    'nav.settings': 'Impostazioni',
    'nav.tenants': 'Tenants',
    'nav.revenue': 'Fatturato',
    'nav.my_policies': 'Le mie polizze',
    'nav.languages': 'Lingue & L10n',

    'ui.privacy_mode': 'Modalità Privacy',
    'ui.dark_mode': 'Modalità Scura',
    'ui.light_mode': 'Modalità Chiara',
    'ui.switch_role': 'Cambia ruolo',
    'ui.logout': 'Disconnettersi',
    'ui.language': 'Lingua',
    'ui.save': 'Salva',
    'ui.cancel': 'Annulla',
    'ui.edit': 'Modifica',

    'role.broker': 'Broker',
    'role.client': 'Cliente',
    'role.admin': 'Admin',
    'role.saas': 'SaaS'
  },
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.clients': 'Clients',
    'nav.policies': 'Policies',
    'nav.mortgages': 'Mortgages',
    'nav.commissions': 'Commissions',
    'nav.calendar': 'Calendar',
    'nav.partners': 'Partner Hub',
    'nav.analytics': 'Analytics',
    'nav.plans': 'Plans & Offers',
    'nav.integrations': 'Integrations',
    'nav.settings': 'Settings',
    'nav.tenants': 'Tenants',
    'nav.revenue': 'Revenue',
    'nav.my_policies': 'My Policies',
    'nav.languages': 'Languages & L10n',

    'ui.privacy_mode': 'Privacy Mode',
    'ui.dark_mode': 'Dark Mode',
    'ui.light_mode': 'Light Mode',
    'ui.switch_role': 'Switch Role',
    'ui.logout': 'Logout',
    'ui.language': 'Language',
    'ui.save': 'Save',
    'ui.cancel': 'Cancel',
    'ui.edit': 'Edit',

    'role.broker': 'Broker',
    'role.client': 'Client',
    'role.admin': 'Admin',
    'role.saas': 'SaaS'
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'de',
  setLanguage: () => {},
  t: (key) => key,
  availableLanguages: [],
  addLanguage: () => {},
  updateTranslation: () => {},
  deleteLanguage: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize available languages from localStorage or defaults
  const [availableLanguages, setAvailableLanguages] = useState<LanguageDefinition[]>(() => {
    const saved = localStorage.getItem('app_languages_defs');
    if (saved) {
      return JSON.parse(saved);
    }
    // Default initialization
    return [
      { code: 'de', label: 'Deutsch', isSystem: true, translations: defaultTranslations.de },
      { code: 'fr', label: 'Français', isSystem: true, translations: defaultTranslations.fr },
      { code: 'it', label: 'Italiano', isSystem: true, translations: defaultTranslations.it },
      { code: 'en', label: 'English', isSystem: true, translations: defaultTranslations.en },
    ];
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app_language');
    // Check if saved language still exists in available languages
    return saved ? saved : 'de';
  });

  // Persist languages when they change
  useEffect(() => {
    localStorage.setItem('app_languages_defs', JSON.stringify(availableLanguages));
  }, [availableLanguages]);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const currentLangDef = availableLanguages.find(l => l.code === language);
    if (currentLangDef && currentLangDef.translations[key]) {
      return currentLangDef.translations[key];
    }
    // Fallback to English if key missing
    const fallback = availableLanguages.find(l => l.code === 'en');
    return fallback?.translations[key] || key;
  };

  const addLanguage = (code: string, label: string) => {
    // Clone translations from English as a base
    const baseTranslations = availableLanguages.find(l => l.code === 'en')?.translations || {};
    
    const newLang: LanguageDefinition = {
      code,
      label,
      isSystem: false,
      translations: { ...baseTranslations } // Shallow copy keys
    };

    setAvailableLanguages(prev => [...prev, newLang]);
  };

  const updateTranslation = (code: string, key: string, value: string) => {
    setAvailableLanguages(prev => prev.map(lang => {
      if (lang.code === code) {
        return {
          ...lang,
          translations: {
            ...lang.translations,
            [key]: value
          }
        };
      }
      return lang;
    }));
  };

  const deleteLanguage = (code: string) => {
    setAvailableLanguages(prev => prev.filter(l => l.code !== code));
    if (language === code) {
      setLanguage('de');
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      availableLanguages,
      addLanguage,
      updateTranslation,
      deleteLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};