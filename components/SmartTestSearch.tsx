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
import {
  FlaskConical,
  Image as ImageIcon,
  Search,
  Sparkles,
  AlertCircle,
  History,
  X,
  Clock,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { testDB } from "@/services/testDatabaseService";

// Type definitions for better type safety
interface Test {
  id: string;
  name: string;
  category: string[];
  type: "Laboratory" | "Imaging" | "Special Test";
  preparation?: string[];
  fasting_required?: boolean;
  description?: string;
  normal_range?: string;
  popular_score: number;
}

interface TestSuggestion {
  id: string;
  name: string;
  category: string;
  type: string;
  preparation?: string[];
  fasting_required?: boolean;
}

interface SearchSuggestion {
  type: "local" | "popular";
  data: TestSuggestion;
  label: string;
  description: string;
  confidence: number;
  category: string;
  typeLabel: string;
}

interface SmartTestSearchProps {
  value?: string;
  onChange?: (value: string, test?: any) => void;
  onSuggestionSelect?: (suggestion: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SmartTestSearch({
  value,
  onChange,
  onSuggestionSelect,
  placeholder = "Search for tests and imaging...",
  disabled = false,
  className,
}: SmartTestSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("test_search_history");
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
      localStorage.setItem("test_search_history", JSON.stringify(updated));
    } catch (error) {
      console.warn("Failed to save search history:", error);
    }
  };

  const searchTests = async (term: string): Promise<void> => {
    console.log("Searching tests for:", term);

    if (!term.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setIsLoading(true);

    try {
      // Get local suggestions from database
      const localSuggestions = testDB.getSuggestions(term);
      console.log("Local test suggestions:", localSuggestions.length);

      // Format suggestions
      const combined = localSuggestions.map(
        (suggestion): SearchSuggestion => ({
          type: "local" as const,
          data: suggestion,
          label: suggestion.name,
          description: suggestion.type,
          confidence: 0.8,
          category: suggestion.category,
          typeLabel: suggestion.type,
        })
      );

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
      searchTests(searchTerm);
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

    if (onSuggestionSelect) {
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

  // Get icon for test type
  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case "Laboratory":
        return <FlaskConical className="h-4 w-4 text-blue-500" />;
      case "Imaging":
        return <ImageIcon className="h-4 w-4 text-green-500" />;
      case "Special Test":
        return <Stethoscope className="h-4 w-4 text-purple-500" />;
      default:
        return <FlaskConical className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get badge color for test type
  const getTestTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Laboratory":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Imaging":
        return "bg-green-50 text-green-700 border-green-200";
      case "Special Test":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
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
              placeholder="Type test or imaging name..."
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
                      No tests or imaging found
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try entering the test name in English
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
                            searchTests(term);
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
                              {getTestTypeIcon(suggestion.typeLabel)}
                              <span className="font-medium">
                                {suggestion.label}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({suggestion.description})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  getTestTypeBadgeColor(suggestion.typeLabel)
                                )}
                              >
                                {suggestion.typeLabel}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-blue-50"
                              >
                                Local
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.category}
                            </Badge>
                            {suggestion.data.fasting_required && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Fasting required
                              </span>
                            )}
                          </div>
                          {suggestion.data.preparation &&
                            suggestion.data.preparation.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3 text-amber-500" />
                                <span className="text-xs text-amber-600">
                                  {suggestion.data.preparation[0]}
                                </span>
                              </div>
                            )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Popular tests when no search term */}
                  {suggestions.length === 0 && searchTerm === "" && (
                    <CommandGroup heading="Popular tests and imaging">
                      {testDB
                        .getAll()
                        .sort((a, b) => b.popular_score - a.popular_score)
                        .slice(0, 8)
                        .map((test, index) => (
                          <CommandItem
                            key={`popular-${index}`}
                            value={test.name}
                            onSelect={() =>
                              handleSelect({
                                type: "popular",
                                data: {
                                  id: test.id,
                                  name: test.name,
                                  category: test.category[0],
                                  type: test.type,
                                  preparation: test.preparation,
                                  fasting_required: test.fasting_required,
                                },
                                label: test.name,
                                description: test.type,
                                confidence: 0.8,
                                category: test.category[0],
                                typeLabel: test.type,
                              })
                            }
                            className="flex items-center gap-2 py-2 px-3"
                          >
                            {getTestTypeIcon(test.type)}
                            <span>{test.name}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs ml-auto",
                                getTestTypeBadgeColor(test.type)
                              )}
                            >
                              {test.type}
                            </Badge>
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
