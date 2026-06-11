import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Compact sidebar language switcher (DE/FR/IT/EN + any tenant-added language).
 * Reads/writes the LanguageContext, which persists the choice and re-renders
 * every component using t().
 */
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = availableLanguages.find((l) => l.code === language);

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 animate-in slide-in-from-bottom-2 duration-200">
          {availableLanguages.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLanguage(l.code); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${l.code === language ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <span className="flex items-center gap-2"><span className="text-xs font-mono uppercase w-6 text-slate-400">{l.code}</span>{l.label}</span>
              {l.code === language && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent"
        title={t('lang.switch')}
      >
        <Globe size={18} />
        <span className="flex-1 text-left">{t('lang.switch')}</span>
        <span className="text-xs font-mono uppercase text-slate-400">{current?.code ?? language}</span>
      </button>
    </div>
  );
};
