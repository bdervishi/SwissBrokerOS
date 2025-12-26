import React from 'react';
import { useSecurity } from '../../contexts/SecurityContext';
import { Lock } from 'lucide-react';

interface SensitiveDataProps {
  children: React.ReactNode;
  className?: string;
  blurIntensity?: 'sm' | 'md' | 'lg';
  allowHoverReveal?: boolean;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({ 
  children, 
  className = '', 
  blurIntensity = 'md',
  allowHoverReveal = true
}) => {
  const { isPrivacyMode } = useSecurity();

  if (!isPrivacyMode) {
    return <span className={className}>{children}</span>;
  }

  const blurClass = {
    sm: 'blur-[2px]',
    md: 'blur-[4px]',
    lg: 'blur-[8px]'
  };

  return (
    <span 
      className={`relative inline-block cursor-default group select-none transition-all duration-300 ${className}`}
      title="Wert verborgen (Privacy Mode)"
    >
      <span className={`${blurClass[blurIntensity]} opacity-60 group-hover:opacity-100 transition-opacity`}>
        {children}
      </span>
      
      {/* Overlay Icon */}
      <span className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-0 transition-opacity">
        <Lock size={12} className="text-slate-900 dark:text-slate-100" />
      </span>

      {/* Hover Reveal (optional) */}
      {allowHoverReveal && (
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white text-xs rounded px-1 -translate-y-full -top-1 pointer-events-none whitespace-nowrap z-50">
             {children}
          </span>
      )}
    </span>
  );
};