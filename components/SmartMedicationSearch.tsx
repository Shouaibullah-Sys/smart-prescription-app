"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
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
  name?: string; // Alternative property for local database
  generic_name?: string; // Alternative property for local database
  category: string[] | string;
  dosage_forms?: string[];
  strengths?: string[];
  popular_score?: number;
  dosage_form?: string; // Alternative property for local database
  strength?: string; // Alternative property for local database
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
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Test database on mount
  useEffect(() => {
    console.log("Testing medication database...");
    console.log("Total medications:", medicationDB.getAll().length);
    console.log(
      "Search test 'acetaminophen':",
      medicationDB.search("acetaminophen")
    );
  }, []);

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

  const saveToHistory = (term: string) => {
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
  };

  const searchMedications = async (term: string): Promise<void> => {
    console.log("Searching medications for:", term);

    if (!term.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // Try AI service first
      let smartSuggestions: AISuggestion[] = [];

      try {
        smartSuggestions = await aiMedicationService.smartAutocomplete(
          term,
          context
        );
        console.log("AI suggestions:", smartSuggestions.length);
      } catch (aiError) {
        console.error("AI service failed, using local database:", aiError);
      }

      // Always fall back to local database
      const localSuggestions = medicationDB.getSuggestions(term);
      console.log("Local suggestions:", localSuggestions.length);

      // Combine results - prefer AI if available
      let combined = [];

      if (smartSuggestions.length > 0) {
        // Format AI suggestions
        combined = smartSuggestions.map(
          (s): SearchSuggestion => ({
            type: "ai_suggestion" as const,
            data: s,
            label: s.medication.name || "Unknown medication",
            description:
              s.medication.generic_name || s.reasoning || "Medication",
            confidence: s.confidence,
            category: s.medication.category?.[0] || "General",
          })
        );
      } else {
        // Use local suggestions
        combined = localSuggestions.map(
          (f): SearchSuggestion => ({
            type: "fallback" as const,
            data: f,
            label: f.name,
            description: f.generic_name || "Medication",
            confidence: 0.6,
            category: f.category,
          })
        );
      }

      // Also get completions for display
      const completions = await aiMedicationService.suggestCompletions(term);
      if (completions.length > 0 && combined.length === 0) {
        combined = completions.map(
          (c): SearchSuggestion => ({
            type: "completion" as const,
            data: c,
            label: c,
            description: "Auto-complete",
            confidence: 0.5,
            category: "General",
          })
        );
      }

      console.log("Final combined suggestions:", combined.length);
      setSuggestions(combined.slice(0, 15));

      // Auto-open popover if we have suggestions
      if (combined.length > 0 && !open) {
        setOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchMedications(searchTerm);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  const handleSelect = (suggestion: any) => {
    console.log("Selected suggestion:", suggestion);
    const selectedValue = suggestion.label;
    setSearchTerm(selectedValue);
    setOpen(false);
    saveToHistory(selectedValue);

    if (onChange) {
      onChange(selectedValue, suggestion.data);
    }

    if (onSuggestionSelect && suggestion.type === "ai_suggestion") {
      onSuggestionSelect(suggestion.data);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setOpen(false);
    if (onChange) {
      onChange("", undefined);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Open popover when user starts typing
    if (value.trim() && !open) {
      setOpen(true);
    }
  };

  const handleFocus = () => {
    if (searchTerm.trim()) {
      setOpen(true);
    }
  };

  // Helper functions for type-safe data access
  const getMedicationFromData = (
    data: AISuggestion | Medication | string
  ): Medication | null => {
    if (typeof data === "string") return null;
    if ("medication" in data) return data.medication;
    return data;
  };

  const getAISuggestionFromData = (
    data: AISuggestion | Medication | string
  ): AISuggestion | null => {
    if (typeof data === "string") return null;
    if ("medication" in data && "reasoning" in data)
      return data as AISuggestion;
    return null;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={handleFocus}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full pl-10 pr-10 text-right"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 h-5 w-5 p-0 hover:bg-transparent"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isLoading && (
              <div className="absolute left-12 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Searching...
                </div>
              </div>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start" side="bottom">
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Type medication name..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="border-none"
            />
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
                      No medication found
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
                      {searchHistory.map((term) => (
                        <CommandItem
                          key={`history-${term}`}
                          value={term}
                          onSelect={() => {
                            setSearchTerm(term);
                            searchMedications(term);
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <History className="h-3 w-3 text-muted-foreground" />
                            <span>{term}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
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
                      {suggestions.map((suggestion, index) => (
                        <CommandItem
                          key={`${suggestion.type}-${index}`}
                          value={suggestion.label}
                          onSelect={() => handleSelect(suggestion)}
                          className="flex flex-col items-start py-3 cursor-pointer hover:bg-accent"
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {suggestion.label}
                              </span>
                              {suggestion.description &&
                                suggestion.description !== "دارو" && (
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
                                  className="text-xs bg-blue-50"
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
                            {(() => {
                              const medication = getMedicationFromData(
                                suggestion.data
                              );
                              const aiSuggestion = getAISuggestionFromData(
                                suggestion.data
                              );
                              return (
                                <>
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
                                </>
                              );
                            })()}
                          </div>
                          {(() => {
                            const aiSuggestion = getAISuggestionFromData(
                              suggestion.data
                            );
                            return (
                              aiSuggestion?.reasoning && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  {aiSuggestion.reasoning}
                                </p>
                              )
                            );
                          })()}
                          {(() => {
                            const aiSuggestion = getAISuggestionFromData(
                              suggestion.data
                            );
                            return (
                              aiSuggestion &&
                              aiSuggestion.precautions &&
                              aiSuggestion.precautions.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3 text-amber-500" />
                                  <span className="text-xs text-amber-600">
                                    {aiSuggestion.precautions[0]}
                                  </span>
                                </div>
                              )
                            );
                          })()}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Popular medicines when no search term */}
                  {suggestions.length === 0 && searchTerm === "" && (
                    <CommandGroup heading="Popular medications">
                      {medicationDB
                        .getAll()
                        .sort((a, b) => b.popular_score - a.popular_score)
                        .slice(0, 5)
                        .map((med, index) => (
                          <CommandItem
                            key={`popular-${index}`}
                            value={med.name}
                            onSelect={() =>
                              handleSelect({
                                type: "fallback",
                                data: {
                                  id: med.id,
                                  name: med.name,
                                  generic_name: med.generic_name,
                                  category: med.category[0],
                                  dosage_form: med.dosage_forms[0],
                                  strength: med.strengths[0],
                                },
                                label: med.name,
                                description: med.generic_name || "Medication",
                                confidence: 0.8,
                                category: med.category[0],
                              })
                            }
                            className="flex items-center gap-2 py-2 px-3"
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
