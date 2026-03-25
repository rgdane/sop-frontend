"use client";
import { useEffect, useState, useRef } from "react";

/**
 * Hook untuk mendeteksi section mana yang sedang terlihat di viewport
 */
export function useHeadsObserver(
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>
) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if refs are ready
  useEffect(() => {
    const checkRefsReady = () => {
      const elements = Object.values(sectionRefs.current).filter(
        (el): el is HTMLElement => !!el
      );

      if (elements.length > 0) {
        setIsReady(true);
      } else {
        // Retry after a short delay
        const timeoutId = setTimeout(checkRefsReady, 50);
        return () => clearTimeout(timeoutId);
      }
    };

    checkRefsReady();
  }, [sectionRefs]);

  useEffect(() => {
    if (!isReady) return;

    const elements = Object.values(sectionRefs.current).filter(
      (el): el is HTMLElement => !!el
    );

    if (elements.length === 0) return;

    // Set initial active section to first element immediately
    const firstElement = elements[0];
    if (firstElement?.id) {
      setActiveId(firstElement.id);
    }

    const callback = (entries: IntersectionObserverEntry[]) => {
      // Create a map of all currently intersecting entries
      const visibleSections: { id: string; top: number; ratio: number }[] = [];

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibleSections.push({
            id: entry.target.id,
            top: entry.boundingClientRect.top,
            ratio: entry.intersectionRatio,
          });
        }
      });

      if (visibleSections.length === 0) return;

      // Find the section that is most visible and closest to the top
      // Prioritize sections that are in the upper portion of the viewport
      const bestSection = visibleSections.reduce((best, current) => {
        // If current is above the fold (top < viewport height / 3), prefer it
        const viewportThird = window.innerHeight / 3;

        if (current.top < viewportThird && current.top >= 0) {
          if (best.top < viewportThird && best.top >= 0) {
            // Both in upper third, choose the one with higher intersection ratio
            return current.ratio > best.ratio ? current : best;
          }
          return current;
        }

        if (best.top < viewportThird && best.top >= 0) {
          return best;
        }

        // Otherwise, choose the one closest to top
        return Math.abs(current.top) < Math.abs(best.top) ? current : best;
      });

      if (bestSection.id) {
        setActiveId(bestSection.id);
      }
    };

    // Disconnect previous observer if exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with better settings
    observerRef.current = new IntersectionObserver(callback, {
      rootMargin: "-80px 0px -60% 0px", // Top offset matches scroll offset
      threshold: Array.from({ length: 21 }, (_, i) => i / 20), // More granular thresholds
    });

    // Observe all elements
    elements.forEach((el) => {
      if (el && observerRef.current) {
        observerRef.current.observe(el);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isReady, sectionRefs]);

  return activeId;
}
