//components/AutocompleteInput.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { getAutocompleteSuggestions } from "../utils/apiClient";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "",
  className = "",
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.trim().length > 1) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const newSuggestions = await getAutocompleteSuggestions(value);
          setSuggestions(newSuggestions);
          setShowSuggestions(true);
        } catch (err) {
          console.error("Autocomplete failed:", err);
        } finally {
          setLoading(false);
        }
      }, 250);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} min-h-[120px] pr-8`}
      />
      {loading && (
        <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-background border border-border border-t-0 rounded-b-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {suggestions.map((s, i) => (
            <Button
              key={i}
              variant="ghost"
              type="button"
              onClick={() => {
                onSuggestionSelect(s);
                setShowSuggestions(false);
              }}
              className="w-full justify-end text-right px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-none rounded-none"
            >
              {s}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
