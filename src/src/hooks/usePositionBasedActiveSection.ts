import { useState, useEffect, useRef, useCallback } from 'react';

export const usePositionBasedActiveSection = (jobNodes: any[]) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const forceActiveSection = useCallback((id: string) => {
    setActiveId(id);
    // Clear any pending checks
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = null;
    }
  }, []);

  useEffect(() => {
    const checkH1Positions = () => {
      const targetPosition = 0; // Top of screen
      const tolerance = 10; // ±10px tolerance

      let activeSection: string | null = null;

      jobNodes.forEach((job) => {
        const h1Element = document.querySelector(`[data-section-id="${job._elementId}"]`) as HTMLElement;
        if (!h1Element) return;

        const h1Rect = h1Element.getBoundingClientRect();
        const h1Top = h1Rect.top;

        // If h1 is at top of screen (within tolerance), activate this section
        if (Math.abs(h1Top - targetPosition) <= tolerance) {
          activeSection = job._elementId;
        }
      });

      setActiveId(activeSection);
    };

    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

      scrollTimeout.current = setTimeout(checkH1Positions, 50);
    };

    checkH1Positions();

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [jobNodes]);

  return { activeId, forceActiveSection };
};
