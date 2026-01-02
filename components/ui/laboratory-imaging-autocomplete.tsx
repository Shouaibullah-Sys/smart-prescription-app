// components/ui/laboratory-imaging-autocomplete.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteGroupLabel,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompleteIcon,
  AutocompleteClear,
} from "@/components/ui/base-autocomplete";
import { Badge } from "@/components/ui/badge";
import { Clock, TestTube, Camera, Zap, Plus } from "lucide-react";

export interface TestSuggestion {
  id: string;
  name: string;
  category: string[];
  type: "Laboratory" | "Imaging" | "Special Test" | "Procedure";
  preparation?: string[];
  fasting_required?: boolean;
  insurance_coverage?: boolean;
  cost_estimate?: number;
  turnaround_time?: string;
  sample_type?: string;
}

export interface LaboratoryImagingAutocompleteProps {
  value?: TestSuggestion | null;
  onValueChange?: (value: TestSuggestion | null) => void;
  onCustomValueAdd?: (value: string) => void; // New prop for custom values
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  limit?: number;
  filterByType?: ("Laboratory" | "Imaging" | "Special Test" | "Procedure")[];
  showPreparationInfo?: boolean;
  showFastingIndicator?: boolean;
  allowCustomEntries?: boolean; // New prop to enable custom entries
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Laboratory":
      return <TestTube className="h-4 w-4" />;
    case "Imaging":
      return <Camera className="h-4 w-4" />;
    case "Special Test":
      return <Zap className="h-4 w-4" />;
    default:
      return <TestTube className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Laboratory":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "Imaging":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "Special Test":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

export function LaboratoryImagingAutocomplete({
  value,
  onValueChange,
  onCustomValueAdd,
  placeholder = "Search Laboratory Tests and Imaging...",
  className,
  disabled = false,
  limit = 15,
  filterByType,
  showPreparationInfo = true,
  showFastingIndicator = true,
  allowCustomEntries = true, // Default to true
}: LaboratoryImagingAutocompleteProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<TestSuggestion[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Debug logging
  React.useEffect(() => {
    console.log("LaboratoryImagingAutocomplete state:", {
      inputValue,
      suggestionsCount: suggestions.length,
      value,
      isLoading,
    });
  }, [inputValue, suggestions, value, isLoading]);

  // Debounced search function
  const searchTests = React.useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/autocomplete/tests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: query,
            limit,
          }),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data = await response.json();
        let filteredSuggestions = data.suggestions || [];

        // Apply type filter if specified
        if (filterByType && filterByType.length > 0) {
          filteredSuggestions = filteredSuggestions.filter(
            (suggestion: TestSuggestion) =>
              filterByType.includes(suggestion.type)
          );
        }

        setSuggestions(filteredSuggestions);
      } catch (err) {
        console.error("Laboratory/Imaging search error:", err);
        setError(err instanceof Error ? err.message : "Search failed");
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [limit, filterByType]
  );

  // Debounce search
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue) {
        searchTests(inputValue);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchTests]);

  // Update input when value prop changes
  React.useEffect(() => {
    if (value) {
      setInputValue(value.name);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Group suggestions by type
  const groupedSuggestions = React.useMemo(() => {
    const groups: Record<string, TestSuggestion[]> = {};
    suggestions.forEach((suggestion) => {
      if (!groups[suggestion.type]) {
        groups[suggestion.type] = [];
      }
      groups[suggestion.type].push(suggestion);
    });
    return groups;
  }, [suggestions]);

  const handleValueChange = (selectedId: string) => {
    console.log("Autocomplete value changed:", selectedId);
    const selectedSuggestion = suggestions.find((s) => s.id === selectedId);
    if (selectedSuggestion) {
      console.log("Selected suggestion:", selectedSuggestion);
      onValueChange?.(selectedSuggestion);
      setInputValue(selectedSuggestion.name);
      setSuggestions([]);
    } else {
      console.log("No suggestion found for ID:", selectedId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log("Input changed to:", newValue);
    setInputValue(newValue);

    // Clear selection when user types
    if (value && newValue !== value.name) {
      console.log("Clearing previous selection");
      onValueChange?.(null);
    }
  };

  const handleClear = () => {
    console.log("Clearing input");
    setInputValue("");
    onValueChange?.(null);
    setSuggestions([]);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log("Key pressed:", e.key, "Input value:", inputValue);

    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Enter pressed with value:", inputValue);

      // If there are suggestions, select the first one
      if (suggestions.length > 0) {
        const firstSuggestion = suggestions[0];
        console.log("Selecting first suggestion:", firstSuggestion);
        onValueChange?.(firstSuggestion);
        setInputValue(firstSuggestion.name);
        setSuggestions([]);
      } else if (allowCustomEntries) {
        // Only add custom value if allowCustomEntries is true
        console.log("Adding custom value:", inputValue);
        onCustomValueAdd?.(inputValue.trim());
        setInputValue("");
        setSuggestions([]);
      }
    }
  };

  const handleItemClick = (test: TestSuggestion) => {
    console.log("Item clicked:", test);
    onValueChange?.(test);
    setInputValue(test.name);
    setSuggestions([]);
  };

  const formatPreparation = (preparation?: string[]) => {
    if (!preparation || preparation.length === 0) return null;
    return preparation.slice(0, 2).join(", "); // Show first 2 preparation items
  };

  return (
    <div className={cn("relative", className)}>
      <Autocomplete
        value={value?.id}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <AutocompleteControl>
          <div className="relative flex items-center">
            <AutocompleteInput
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                // Prevent default form submission behavior
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
                handleKeyDown(e);
              }}
              onKeyPress={(e) => {
                // Additional prevention for older browsers
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              disabled={disabled}
              className="pr-20"
              data-testid="autocomplete-input"
            />
            <AutocompleteIcon className="absolute right-12 h-4 w-4 text-muted-foreground" />
            {inputValue && (
              <AutocompleteClear onClick={handleClear} className="right-2" />
            )}
          </div>
        </AutocompleteControl>

        <AutocompleteContent
          showBackdrop={false}
          className="w-[var(--anchor-width)]"
        >
          {isLoading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Searching tests...
            </div>
          )}

          {error && (
            <div className="px-4 py-3 text-sm text-destructive">{error}</div>
          )}

          {!isLoading && !error && suggestions.length === 0 && inputValue && (
            <div className="space-y-1">
              <AutocompleteEmpty>
                No tests found for "{inputValue}"
              </AutocompleteEmpty>
              {allowCustomEntries && (
                <div className="px-4 py-3 border-t">
                  <div className="text-sm text-muted-foreground mb-2">
                    Press Enter to add as custom test:
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <Plus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">{inputValue}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Or click a suggestion above to select from existing tests
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && suggestions.length > 0 && (
            <AutocompleteList>
              {Object.entries(groupedSuggestions).map(([type, tests]) => (
                <AutocompleteGroup key={type}>
                  <AutocompleteGroupLabel className="flex items-center gap-2">
                    {getTypeIcon(type)}
                    {type}
                  </AutocompleteGroupLabel>
                  {tests.map((test) => (
                    <AutocompleteItem
                      key={test.id}
                      value={test.id}
                      onClick={() => handleItemClick(test)}
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {test.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs px-1.5 py-0.5",
                                  getTypeColor(test.type)
                                )}
                              >
                                {test.type}
                              </Badge>

                              {showFastingIndicator &&
                                test.fasting_required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5"
                                  >
                                    <Clock className="h-3 w-3 mr-1" />
                                    Fasting
                                  </Badge>
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {test.category.slice(0, 3).map((cat) => (
                            <Badge
                              key={cat}
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 opacity-70"
                            >
                              {cat}
                            </Badge>
                          ))}
                          {test.category.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0.5 opacity-50"
                            >
                              +{test.category.length - 3} more
                            </Badge>
                          )}
                        </div>

                        {/* Preparation info */}
                        {showPreparationInfo &&
                          test.preparation &&
                          test.preparation.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span className="font-medium">Prep: </span>
                              {formatPreparation(test.preparation)}
                              {test.preparation.length > 2 && "..."}
                            </div>
                          )}

                        {/* Additional info */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {test.sample_type && (
                            <span>Sample: {test.sample_type}</span>
                          )}
                          {test.turnaround_time && (
                            <span>• {test.turnaround_time}</span>
                          )}
                          {test.cost_estimate && (
                            <span>• ${test.cost_estimate}</span>
                          )}
                        </div>
                      </div>
                    </AutocompleteItem>
                  ))}
                </AutocompleteGroup>
              ))}
            </AutocompleteList>
          )}
        </AutocompleteContent>
      </Autocomplete>
    </div>
  );
}

export default LaboratoryImagingAutocomplete;
