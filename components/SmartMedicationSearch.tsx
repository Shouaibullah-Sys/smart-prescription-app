// components/SmartMedicationSearch.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Search,
  Sparkles,
  AlertCircle,
  History,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { aiMedicationService } from "@/services/aiMedicationService";
import { medicationDB } from "@/services/medicationDatabaseService";
import {
  Autocomplete,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteValue,
  AutocompleteContent,
  AutocompleteList,
  AutocompleteItem,
  AutocompleteEmpty,
  AutocompleteClear,
} from "@/components/ui/autocomplete";

// Type definitions for better type safety
interface Medication {
  id?: string | number;
  name?: string;
  generic_name?: string;
  category: string[] | string;
  dosage_forms?: string[];
  strengths?: string[];
  popular_score?: number;
  dosage_form?: string;
  strength?: string;
  precautions?: string[];
  route?: string[];
  contraindications?: string[];
}

interface AISuggestion {
  medication: Medication;
  reasoning?: string;
  confidence: number;
  precautions?: string[];
}

type SuggestionType = "ai_suggestion" | "fallback" | "completion";

interface SearchSuggestion {
  type: SuggestionType;
  data: AISuggestion | Medication | string;
  label: string;
  description: string;
  confidence: number;
  category: string;
  value: string;
}

interface SmartMedicationSearchProps {
  value?: string;
  onChange?: (value: string, medication?: any) => void;
  onSuggestionSelect?: (suggestion: any) => void;
  placeholder?: string;
  disabled?: boolean;
  context?: {
    symptoms?: string[];
    diagnosis?: string;
    allergies?: string[];
    age?: number;
    weight?: number;
  };
  className?: string;
  variant?: "lg" | "md" | "sm";
}

export function SmartMedicationSearch({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Search for medication...",
  disabled = false,
  context,
  className,
  variant = "md",
}: SmartMedicationSearchProps) {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("medication_search_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed.slice(0, 5));
        }
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
      setSearchHistory([]);
    }
  }, []);

  // Sync searchTerm with external value
  useEffect(() => {
    if (value !== undefined && value !== searchTerm) {
      setSearchTerm(value);
    }
  }, [value]);

  const saveToHistory = useCallback(
    (term: string) => {
      if (!term.trim()) return;

      const updated = [term, ...searchHistory.filter((h) => h !== term)].slice(
        0,
        5
      );
      setSearchHistory(updated);

      try {
        localStorage.setItem(
          "medication_search_history",
          JSON.stringify(updated)
        );
      } catch (error) {
        console.warn("Failed to save search history:", error);
      }
    },
    [searchHistory]
  );

  const searchMedications = useCallback(
    async (term: string): Promise<void> => {
      if (!term.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      try {
        let smartSuggestions: AISuggestion[] = [];

        // Try AI service first
        try {
          smartSuggestions = await aiMedicationService.smartAutocomplete(
            term,
            context
          );
        } catch (aiError) {
          console.error("AI service failed, using local database:", aiError);
        }

        // Always fall back to local database
        const localSuggestions = medicationDB.getSuggestions(term);

        let combined: SearchSuggestion[] = [];

        if (smartSuggestions.length > 0) {
          combined = smartSuggestions.map(
            (s): SearchSuggestion => ({
              type: "ai_suggestion" as const,
              data: s,
              label: s.medication.name || "Unknown medication",
              description:
                s.medication.generic_name || s.reasoning || "Medication",
              confidence: s.confidence,
              category: Array.isArray(s.medication.category)
                ? s.medication.category[0] || "General"
                : s.medication.category || "General",
              value: s.medication.name || "Unknown medication",
            })
          );
        } else if (localSuggestions.length > 0) {
          combined = localSuggestions.map(
            (f): SearchSuggestion => ({
              type: "fallback" as const,
              data: f,
              label: f.name || "Unknown",
              description: f.generic_name || "Medication",
              confidence: 0.6,
              category:
                typeof f.category === "string"
                  ? f.category
                  : Array.isArray(f.category)
                  ? f.category[0] || "General"
                  : "General",
              value: f.name || "Unknown",
            })
          );
        }

        // Get completions if no suggestions found
        if (combined.length === 0) {
          try {
            const completions = await aiMedicationService.suggestCompletions(
              term
            );
            if (completions.length > 0) {
              combined = completions.map(
                (c): SearchSuggestion => ({
                  type: "completion" as const,
                  data: c,
                  label: c,
                  description: "Auto-complete",
                  confidence: 0.5,
                  category: "General",
                  value: c,
                })
              );
            }
          } catch (completionError) {
            console.error("Completion service failed:", completionError);
          }
        }

        setSuggestions(combined.slice(0, 15));
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [context]
  );

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (searchTerm.trim()) {
      debounceTimer.current = setTimeout(() => {
        searchMedications(searchTerm);
      }, 300);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, searchMedications]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      // Find the matching suggestion by both value and label for better matching
      const suggestion = suggestions.find(
        (s) => s.value === selectedValue || s.label === selectedValue
      );

      console.log("Selected value:", selectedValue);
      console.log("Found suggestion:", suggestion);
      console.log("Suggestion data:", suggestion?.data);

      if (!suggestion) {
        // If no matching suggestion, just update the value
        setSearchTerm(selectedValue);
        if (onChange) {
          onChange(selectedValue);
        }
        return;
      }

      // Update search term with the value (actual medicine name) for consistency
      setSearchTerm(suggestion.value);

      // Clear suggestions
      setSuggestions([]);

      // Save to history using the actual value
      saveToHistory(suggestion.value);

      // Call onChange with the selected value and medication data
      if (onChange) {
        console.log(
          "Calling onChange with:",
          suggestion.value,
          suggestion.data
        );
        onChange(suggestion.value, suggestion.data);
      }

      if (onSuggestionSelect && suggestion.type === "ai_suggestion") {
        onSuggestionSelect(suggestion.data);
      }
    },
    [suggestions, onChange, onSuggestionSelect, saveToHistory]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setSuggestions([]);

    if (onChange) {
      onChange("", undefined);
    }
  }, [onChange]);

  // Helper functions for type-safe data access
  const getMedicationFromData = useCallback(
    (data: AISuggestion | Medication | string): Medication | null => {
      if (typeof data === "string") return null;
      if ("medication" in data) return data.medication;
      return data as Medication;
    },
    []
  );

  const getAISuggestionFromData = useCallback(
    (data: AISuggestion | Medication | string): AISuggestion | null => {
      if (typeof data === "string") return null;
      if ("medication" in data && "reasoning" in data)
        return data as AISuggestion;
      return null;
    },
    []
  );

  // Generate options for the Autocomplete component
  const autocompleteOptions = [
    // History items when no search term
    ...(searchTerm === ""
      ? searchHistory.map((term) => ({
          label: term,
          value: term,
          render: (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <History className="h-3 w-3 text-muted-foreground" />
                <span>{term}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchHistory((prev) => prev.filter((h) => h !== term));
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ),
        }))
      : []),

    // Suggestions
    ...suggestions.map((suggestion, index) => {
      const medication = getMedicationFromData(suggestion.data);
      const aiSuggestion = getAISuggestionFromData(suggestion.data);

      // Generate a truly unique key using medication ID or a hash of the content
      const medicationId =
        medication?.id || suggestion.label.replace(/\s+/g, "_").toLowerCase();
      const uniqueId = `${medicationId}-${suggestion.type}-${index}`;

      return {
        key: uniqueId,
        label: suggestion.label,
        value: suggestion.value, // Use actual medication value
        render: (
          <div className="w-full">
            <div className="flex items-center justify-between w-full mb-1">
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                <span className="font-medium">{suggestion.label}</span>
                {suggestion.description &&
                  suggestion.description !== "دارو" &&
                  suggestion.description !== "Medication" && (
                    <span className="text-xs text-muted-foreground">
                      ({suggestion.description})
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-2">
                {suggestion.type === "ai_suggestion" && (
                  <>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        suggestion.confidence > 0.8
                          ? "bg-green-50 text-green-700 border-green-200"
                          : suggestion.confidence > 0.6
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                          : "bg-red-50 text-red-700 border-red-200"
                      )}
                    >
                      {Math.round(suggestion.confidence * 100)}%
                    </Badge>
                    <Sparkles className="h-3 w-3 text-amber-500" />
                  </>
                )}
                {suggestion.type === "fallback" && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Local
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {suggestion.category}
              </Badge>
              {medication?.dosage_forms?.[0] && (
                <span>{medication.dosage_forms[0]}</span>
              )}
              {medication?.strengths?.[0] && (
                <span>• {medication.strengths[0]}</span>
              )}
              {medication &&
                "strength" in medication &&
                medication.strength && <span>• {medication.strength}</span>}
            </div>
            {aiSuggestion?.reasoning && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {aiSuggestion.reasoning}
              </p>
            )}
            {aiSuggestion?.precautions &&
              aiSuggestion.precautions.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-amber-600 line-clamp-1">
                    {aiSuggestion.precautions[0]}
                  </span>
                </div>
              )}
          </div>
        ),
      };
    }),
  ];

  // Popular medications for empty state
  const popularMedications =
    searchTerm === "" && suggestions.length === 0 && searchHistory.length === 0
      ? medicationDB
          .getAll()
          .sort((a, b) => (b.popular_score || 0) - (a.popular_score || 0))
          .slice(0, 5)
          .map((med) => ({
            label: med.name || "Unknown",
            value: med.name || "Unknown",
            render: (
              <div className="flex items-center gap-2">
                <Pill className="h-4 w-4 text-muted-foreground" />
                <span>{med.name}</span>
                {med.generic_name && (
                  <span className="text-xs text-muted-foreground">
                    ({med.generic_name})
                  </span>
                )}
              </div>
            ),
          }))
      : [];

  return (
    <div className={cn("space-y-2", className)}>
      <Autocomplete
        value={searchTerm}
        onValueChange={setSearchTerm}
        disabled={disabled}
      >
        <AutocompleteControl className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
          <AutocompleteInput
            placeholder={placeholder}
            variant={variant}
            className={cn("pr-10", isLoading && "pr-20")}
          />
          {isLoading && (
            <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {searchTerm && (
            <AutocompleteClear
              onClick={clearSearch}
              className="absolute left-2.5 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </AutocompleteClear>
          )}
          <AutocompleteValue />
        </AutocompleteControl>

        <AutocompleteContent showBackdrop={false} align="start" sideOffset={4}>
          {isLoading ? (
            <AutocompleteEmpty className="py-6 text-center text-sm text-muted-foreground">
              <Loader2 className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Searching...
            </AutocompleteEmpty>
          ) : autocompleteOptions.length > 0 ? (
            <AutocompleteList>
              {searchTerm === "" && searchHistory.length > 0 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                  Recent searches
                </div>
              )}
              {autocompleteOptions.map((option, index) => (
                <AutocompleteItem
                  key={option.value || `${option.label}-${index}`}
                  value={option.value}
                >
                  {option.render}
                </AutocompleteItem>
              ))}

              {popularMedications.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                    Popular medications
                  </div>
                  {popularMedications.map((med, index) => (
                    <AutocompleteItem
                      key={`popular-${index}-${med.value}`}
                      value={med.value}
                    >
                      {med.render}
                    </AutocompleteItem>
                  ))}
                </>
              )}
            </AutocompleteList>
          ) : searchTerm ? (
            <AutocompleteEmpty className="flex flex-col items-center py-6 text-center">
              <Search className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No medication found for "{searchTerm}"
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try entering the English or generic name
              </p>
            </AutocompleteEmpty>
          ) : popularMedications.length > 0 ? (
            <AutocompleteList>
              <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                Popular medications
              </div>
              {popularMedications.map((med, index) => (
                <AutocompleteItem
                  key={`popular-${index}-${med.value}`}
                  value={med.value}
                >
                  {med.render}
                </AutocompleteItem>
              ))}
            </AutocompleteList>
          ) : (
            <AutocompleteEmpty className="py-6 text-center text-sm text-muted-foreground">
              Start typing to search for medications
            </AutocompleteEmpty>
          )}
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}
