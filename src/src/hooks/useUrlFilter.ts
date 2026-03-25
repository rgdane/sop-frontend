import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface UseUrlFilterOptions {
  defaultValue?: Record<string, any>;
}

export function useUrlFilter({ defaultValue = {} }: UseUrlFilterOptions = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Parse current URL parameters only once on mount
  const [filter, setFilter] = useState<Record<string, any>>(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      // Try to parse JSON values, fallback to string
      try {
        params[key] = JSON.parse(value);
      } catch {
        params[key] = value;
      }
    });
    return { ...defaultValue, ...params };
  });

  const setUrlFilter = useCallback((update: Record<string, any>) => {
    const newFilter = { ...filter, ...update };
    setFilter(newFilter);
    
    // Update URL without triggering re-render loop
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    // Add non-empty filter values to URL
    Object.entries(newFilter).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Convert objects/arrays to JSON string
        const stringValue = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
        params.set(key, stringValue);
      }
    });

    // Update URL without page reload
    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [filter, router]);

  const resetUrlFilter = useCallback(() => {
    setFilter(defaultValue);
    
    // Clear URL parameters
    const url = new URL(window.location.href);
    const newUrl = url.pathname;
    router.replace(newUrl, { scroll: false });
  }, [defaultValue, router]);

  const removeFilter = useCallback((key: string) => {
    const newFilter = { ...filter };
    delete newFilter[key];
    setFilter(newFilter);
    
    // Update URL without the removed key
    const url = new URL(window.location.href);
    const params = new URLSearchParams();

    Object.entries(newFilter).forEach(([filterKey, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const stringValue = typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
        params.set(filterKey, stringValue);
      }
    });

    const newUrl = `${url.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    router.replace(newUrl, { scroll: false });
  }, [filter, router]);

  return {
    filter,
    setUrlFilter,
    resetUrlFilter,
    removeFilter,
  };
}