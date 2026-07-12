import { useCallback, useState } from 'react';
import { computeNextContactFilters } from 'lob/AudienceMessaging';

// Shared filter-state controller for both Access Management's Advanced Search
// and Messaging's Audience tab. updateField mirrors the offset-resetting
// behavior both panels relied on before this was a shared hook.
export default function useContactFilterState(getDefaultFilters) {
  const [filters, setFilters] = useState(getDefaultFilters);

  const updateField = useCallback((fieldName, value) => {
    setFilters(previousFilters => computeNextContactFilters(previousFilters, fieldName, value));
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters = getDefaultFilters();
    setFilters(defaultFilters);
    return defaultFilters;
  }, [getDefaultFilters]);

  return [filters, setFilters, updateField, resetFilters];
}
