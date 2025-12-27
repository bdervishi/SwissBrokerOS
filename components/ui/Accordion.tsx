
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ children, className = '' }) => {
  return <div className={`divide-y divide-slate-200 dark:divide-slate-800 ${className}`}>{children}</div>;
};

interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const AccordionContext = React.createContext<{
  openValue: string | null;
  setOpenValue: (v: string | null) => void;
}>({ openValue: null, setOpenValue: () => {} });

export const AccordionItem: React.FC<AccordionItemProps> = ({ value, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b border-slate-100 dark:border-slate-800 last:border-none ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { isOpen, setIsOpen });
        }
        return child;
      })}
    </div>
  );
};

export const AccordionTrigger: React.FC<{ children: React.ReactNode, isOpen?: boolean, setIsOpen?: (v: boolean) => void }> = ({ children, isOpen, setIsOpen }) => {
  return (
    <button
      onClick={() => setIsOpen?.(!isOpen)}
      className="flex w-full items-center justify-between py-4 text-left font-bold text-slate-900 dark:text-slate-100 transition-all hover:text-brand-600"
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600' : 'text-slate-400'}`} />
    </button>
  );
};

export const AccordionContent: React.FC<{ children: React.ReactNode, isOpen?: boolean }> = ({ children, isOpen }) => {
  if (!isOpen) return null;
  return (
    <div className="pb-4 text-sm text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-top-1 duration-200">
      {children}
    </div>
  );
};
