import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-[100] p-3 rounded-full bg-brand-600 text-white shadow-2xl shadow-brand-600/30 hover:bg-brand-700 hover:scale-110 active:scale-95 transition-all duration-300 animate-in fade-in zoom-in slide-in-from-bottom-4"
      aria-label="Nach oben scrollen"
    >
      <ChevronUp size={24} strokeWidth={3} />
    </button>
  );
};