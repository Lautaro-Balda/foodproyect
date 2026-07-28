'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TextInput } from '@/components/inventory/form-fields';

interface Suggestion {
  id: string;
  name: string;
  isNew?: boolean;
}

export function IngredientAutocomplete({
  value,
  onChange,
  onSelectExisting,
  onSelectNew,
  placeholder = 'Busca o escribe un ingrediente...',
}: {
  value: string;
  onChange: (value: string) => void;
  onSelectExisting: (id: string, name: string) => void;
  onSelectNew: (name: string) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/ingredients/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();

      const newSuggestions: Suggestion[] = results.map((ing: { id: string; name: string }) => ({
        id: ing.id,
        name: ing.name,
      }));

      // Add "Create new" option if query doesn't match any existing ingredient
      if (!results.find((ing: { name: string }) => ing.name.toLowerCase() === query.toLowerCase())) {
        newSuggestions.push({
          id: `new_${query}`,
          name: `Crear ingrediente nuevo: ${query}`,
          isNew: true,
        });
      }

      setSuggestions(newSuggestions);
      setIsOpen(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (value.length > 0) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, fetchSuggestions]);

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    if (suggestion.isNew) {
      const newName = suggestion.name.replace('Crear ingrediente nuevo: ', '');
      onSelectNew(newName);
    } else {
      onSelectExisting(suggestion.id, suggestion.name);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <TextInput
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        onFocus={() => value.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      )}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-stone-100 ${
                suggestion.isNew
                  ? 'border-t border-border font-medium text-accent'
                  : 'text-foreground'
              }`}
            >
              {suggestion.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
