// components/SmartMdedicatinSearch.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Pill, Search, Sparkles, AlertCircle, History, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiMedicationService } from "@/services/aiMedicationService";
import { medicationDB } from "@/services/medicationDatabaseService";

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
}

export function SmartMedicationSearch({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Search for medication...",
  disabled = false,
  context,
  className,
}: SmartMedicationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
        setOpen(false);
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

        // Open popover if we have suggestions
        if (combined.length > 0) {
          setOpen(true);
        }
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
      setOpen(false);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, searchMedications]);

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      console.log("Selected suggestion:", suggestion);

      const selectedValue = suggestion.label;

      // Mark that we're in selection mode to prevent popover from reopening
      setIsSelecting(true);

      // Update search term immediately
      setSearchTerm(selectedValue);

      // Force close popover
      setOpen(false);

      // Clear suggestions
      setSuggestions([]);

      // Save to history
      saveToHistory(selectedValue);

      // Call onChange with the selected value
      if (onChange) {
        onChange(selectedValue, suggestion.data);
      }

      if (onSuggestionSelect && suggestion.type === "ai_suggestion") {
        onSuggestionSelect(suggestion.data);
      }

      // Reset selection mode after a short delay
      setTimeout(() => {
        setIsSelecting(false);
      }, 100);

      // Focus back on input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    },
    [onChange, onSuggestionSelect, saveToHistory]
  );

  const clearSearch = useCallback(() => {
    setIsSelecting(true);

    setSearchTerm("");
    setSuggestions([]);
    setOpen(false);

    if (onChange) {
      onChange("", undefined);
    }

    setTimeout(() => {
      setIsSelecting(false);
    }, 100);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Update internal state
      setSearchTerm(inputValue);

      // Reset selection flag when user types
      setIsSelecting(false);

      // Call parent onChange
      if (onChange) {
        onChange(inputValue);
      }

      // Open popover when user types something
      if (inputValue.trim() && !open) {
        setOpen(true);
      }
    },
    [onChange, open]
  );

  const handleInputFocus = useCallback(() => {
    // Only open if we're not selecting and we have content
    if (!isSelecting && (searchTerm.trim() || searchHistory.length > 0)) {
      setOpen(true);
    }
  }, [isSelecting, searchTerm, searchHistory.length]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      // Prevent opening if we just selected something
      if (!isSelecting) {
        setOpen(newOpen);
      }
    },
    [isSelecting]
  );

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

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full pl-10 pr-10"
                aria-label="Medication search"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSearch();
                  }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isLoading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Searching...
                </div>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          ref={popoverContentRef}
          className="w-[400px] p-0"
          align="start"
          side="bottom"
          avoidCollisions={true}
          sideOffset={5}
          onPointerDownOutside={(e) => {
            // Prevent closing when clicking inside the popover
            if (popoverContentRef.current?.contains(e.target as Node)) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            // Allow closing when clicking outside
            if (!popoverContentRef.current?.contains(e.target as Node)) {
              setOpen(false);
            }
          }}
        >
          <Command className="rounded-lg border shadow-md" shouldFilter={false}>
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="mr-2">Searching...</span>
                </div>
              ) : suggestions.length === 0 && searchTerm ? (
                <CommandEmpty>
                  <div className="flex flex-col items-center py-6 text-center">
                    <Search className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No medication found for "{searchTerm}"
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try entering the English or generic name
                    </p>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  {/* Search History */}
                  {searchHistory.length > 0 && searchTerm === "" && (
                    <CommandGroup heading="Recent searches">
                      {searchHistory.map((term, index) => (
                        <CommandItem
                          key={`history-${index}-${term}`}
                          value={term}
                          onSelect={() => {
                            setSearchTerm(term);
                            searchMedications(term);
                          }}
                          className="flex items-center justify-between cursor-pointer"
                        >
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
                              e.preventDefault();
                              setSearchHistory((prev) =>
                                prev.filter((h) => h !== term)
                              );
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <CommandGroup heading="Search results">
                      {suggestions.map((suggestion, index) => {
                        const medication = getMedicationFromData(
                          suggestion.data
                        );
                        const aiSuggestion = getAISuggestionFromData(
                          suggestion.data
                        );

                        return (
                          <CommandItem
                            key={`${suggestion.type}-${index}-${suggestion.label}`}
                            value={suggestion.value}
                            onSelect={() => handleSelect(suggestion)}
                            className="flex flex-col items-start py-3 cursor-pointer hover:bg-accent"
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex items-center gap-2">
                                <Pill className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {suggestion.label}
                                </span>
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
                                medication.strength && (
                                  <span>• {medication.strength}</span>
                                )}
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
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  )}

                  {/* Popular medicines when no search term */}
                  {suggestions.length === 0 &&
                    searchTerm === "" &&
                    searchHistory.length === 0 && (
                      <CommandGroup heading="Popular medications">
                        {medicationDB
                          .getAll()
                          .sort(
                            (a, b) =>
                              (b.popular_score || 0) - (a.popular_score || 0)
                          )
                          .slice(0, 5)
                          .map((med, index) => (
                            <CommandItem
                              key={`popular-${index}-${med.id || med.name}`}
                              value={med.name || "Unknown"}
                              onSelect={() => {
                                const suggestion: SearchSuggestion = {
                                  type: "fallback",
                                  data: med,
                                  label: med.name || "Unknown",
                                  description: med.generic_name || "Medication",
                                  confidence: 0.8,
                                  category: Array.isArray(med.category)
                                    ? med.category[0] || "General"
                                    : med.category || "General",
                                  value: med.name || "Unknown",
                                };
                                handleSelect(suggestion);
                              }}
                              className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                              onPointerDown={(e) => e.stopPropagation()}
                            >
                              <Pill className="h-4 w-4 text-muted-foreground" />
                              <span>{med.name}</span>
                              {med.generic_name && (
                                <span className="text-xs text-muted-foreground">
                                  ({med.generic_name})
                                </span>
                              )}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
