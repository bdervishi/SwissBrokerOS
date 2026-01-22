
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component listens to route changes and automatically scrolls the window to the top.
 * It ensures that when navigating between pages, the user always starts at the beginning of the content.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // "instant" behavior ensures it feels like a native page load
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' 
    });
  }, [pathname]);

  return null;
};
