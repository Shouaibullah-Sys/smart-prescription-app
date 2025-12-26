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
import { Pill, Search, X, History, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { medicationDB } from "@/services/medicationDatabaseService";

interface SimpleMedicationSearchProps {
  value?: string;
  onChange?: (value: string, medication?: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SimpleMedicationSearch({
  value,
  onChange,
  placeholder = "Search medication name...",
  disabled = false,
  className,
}: SimpleMedicationSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState<any[]>([]);
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
      // Ignore localStorage errors
    }
  };

  const searchMedications = (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Use simple database search
      const results = medicationDB.getSuggestions(term);
      setSuggestions(results);
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
    const selectedValue = suggestion.name;
    setSearchTerm(selectedValue);
    setOpen(false);
    saveToHistory(selectedValue);

    if (onChange) {
      onChange(selectedValue, suggestion);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    if (onChange) {
      onChange("", undefined);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Open popover when typing
    if (value && !open) {
      setOpen(true);
    }
  };

  const handleFocus = () => {
    if (searchTerm) {
      setOpen(true);
    }
  };

  return (
    <div className={cn("relative", className)}>
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
        <PopoverContent
          className="w-[350px] p-0"
          align="start"
          onInteractOutside={(e) => {
            // Don't close when clicking inside input
            if (
              (e.target as HTMLElement).closest(
                "[data-radix-popper-content-wrapper]"
              )
            ) {
              e.preventDefault();
            }
          }}
        >
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
                      Try another name
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
                              const updated = searchHistory.filter(
                                (h) => h !== term
                              );
                              setSearchHistory(updated);
                              localStorage.setItem(
                                "medication_search_history",
                                JSON.stringify(updated)
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
                          key={`suggestion-${index}`}
                          value={suggestion.name}
                          onSelect={() => handleSelect(suggestion)}
                          className="flex flex-col items-start py-2 px-3 cursor-pointer hover:bg-accent"
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-primary" />
                              <span className="font-medium">
                                {suggestion.name}
                              </span>
                              {suggestion.generic_name && (
                                <span className="text-xs text-muted-foreground">
                                  ({suggestion.generic_name})
                                </span>
                              )}
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-50"
                            >
                              {suggestion.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            {suggestion.dosage_form && (
                              <span>{suggestion.dosage_form}</span>
                            )}
                            {suggestion.strength && (
                              <span className="border-r pr-2 border-border">
                                {suggestion.strength}
                              </span>
                            )}
                            {suggestion.strength && suggestion.dosage_form && (
                              <span>•</span>
                            )}
                          </div>

                          {/* Show category information */}
                          <div className="flex items-center gap-1 mt-1">
                            <div className="h-1 w-1 rounded-full bg-primary" />
                            <span className="text-xs text-muted-foreground">
                              {suggestion.category}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Popular medicines when no search term */}
                  {suggestions.length === 0 && searchTerm === "" && (
                    <CommandGroup heading="Popular medications">
                      {medicationDB
                        .getSuggestions("")
                        .slice(0, 5)
                        .map((med, index) => (
                          <CommandItem
                            key={`popular-${index}`}
                            value={med.name}
                            onSelect={() => handleSelect(med)}
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
