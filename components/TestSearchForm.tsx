// components/TestSearchForm.tsx
"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  X,
  FlaskConical,
  Scan,
  Stethoscope,
  Activity,
  Clock,
  DollarSign,
  Filter,
  Star,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { testDB, Test as DatabaseTest } from "@/services/testDatabaseService";

interface TestSearchFormProps {
  onTestSelect?: (test: DatabaseTest) => void;
  onTestsAdd?: (tests: DatabaseTest[]) => void;
  selectedTests?: DatabaseTest[];
  placeholder?: string;
  className?: string;
  mode?: "single" | "multiple";
  showFilters?: boolean;
  showQuickAdd?: boolean;
}

interface TestWithDetails extends DatabaseTest {
  description?: string;
  preparation?: string[];
  fasting_required?: boolean;
  turnaround_time?: string;
  cost_estimate?: number;
  insurance_coverage?: boolean;
}

export function TestSearchForm({
  onTestSelect,
  onTestsAdd,
  selectedTests = [],
  placeholder = "Search for tests, imaging, or procedures...",
  className,
  mode = "single",
  showFilters = true,
  showQuickAdd = true,
}: TestSearchFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<
    Array<{
      id: string;
      name: string;
      category: string[];
      type: string;
      preparation?: string[];
      fasting_required?: boolean;
      insurance_coverage?: boolean;
      cost_estimate?: number;
      turnaround_time?: string;
      sample_type?: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);

  const searchTests = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setShowAddNew(false);
      return;
    }

    setIsLoading(true);
    try {
      const results = testDB.getSuggestions(term);
      setSuggestions(results);

      // Show "Add New" option if no results found and search term is not empty
      setShowAddNew(results.length === 0);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions([]);
      setShowAddNew(term.trim().length > 0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setShowAddNew(false);
    searchTests(value);
  };

  const handleAddNewTest = () => {
    const newTest = {
      id: `custom_${Date.now()}`,
      name: searchTerm,
      category: ["Custom"],
      type: "Laboratory" as const,
      preparation: ["To be determined"],
      fasting_required: false,
      insurance_coverage: true,
      cost_estimate: 100,
      turnaround_time: "24-48 hours",
      sample_type: "Blood",
      description: `Custom test: ${searchTerm}`,
    };

    if (mode === "single") {
      setSearchTerm(searchTerm);
      setIsOpen(false);
      if (onTestSelect) {
        onTestSelect(newTest as any);
      }
    } else {
      // Multiple mode - add to selected tests if not already selected
      if (!selectedTests.find((t) => t.name === newTest.name)) {
        const updatedTests = [...selectedTests, newTest as any];
        if (onTestsAdd) {
          onTestsAdd(updatedTests);
        }
      }
    }

    setShowAddNew(false);
  };

  const handleTestSelect = (test: any) => {
    // Convert suggestion to full test if needed
    const fullTest = test.popular_score ? test : testDB.getByIds([test.id])[0];

    if (mode === "single") {
      setSearchTerm(test.name);
      setIsOpen(false);
      if (onTestSelect) {
        onTestSelect(fullTest);
      }
    } else {
      // Multiple mode - add to selected tests if not already selected
      if (!selectedTests.find((t) => t.id === test.id)) {
        const updatedTests = [...selectedTests, fullTest];
        if (onTestsAdd) {
          onTestsAdd(updatedTests);
        }
      }
    }
  };

  const removeTest = (testId: string) => {
    const updatedTests = selectedTests.filter((test) => test.id !== testId);
    if (onTestsAdd) {
      onTestsAdd(updatedTests);
    }
  };

  const getTestTypeIcon = (type: string) => {
    switch (type) {
      case "Laboratory":
        return <FlaskConical className="h-4 w-4 text-blue-500" />;
      case "Imaging":
        return <Scan className="h-4 w-4 text-green-500" />;
      case "Special Test":
        return <Stethoscope className="h-4 w-4 text-purple-500" />;
      case "Procedure":
        return <Activity className="h-4 w-4 text-amber-500" />;
      default:
        return <FlaskConical className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTestTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Laboratory":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Imaging":
        return "bg-green-50 text-green-700 border-green-200";
      case "Special Test":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Procedure":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Quick add popular tests
  const popularTests = [
    "CBC",
    "Lipid Profile",
    "Chest X-ray",
    "Electrocardiogram",
    "CT Scan Brain",
    "Abdominal Ultrasound",
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Test Search & Selection</h3>
        </div>
        {mode === "multiple" && selectedTests.length > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{selectedTests.length} selected</span>
          </Badge>
        )}
      </div>

      {/* Selected Tests Display (Multiple Mode) */}
      {mode === "multiple" && selectedTests.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Selected Tests ({selectedTests.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTestsAdd?.([])}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedTests.map((test) => (
                <Badge
                  key={test.id}
                  variant="secondary"
                  className="flex items-center gap-1 pl-2 pr-1 py-1"
                >
                  {getTestTypeIcon(test.type)}
                  <span className="max-w-[150px] truncate">{test.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTest(test.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Search Component */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder={placeholder}
                      className="pl-10 pr-10"
                      onFocus={() => {
                        if (searchTerm.trim()) {
                          setIsOpen(true);
                        }
                      }}
                    />
                    {showFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <Filter className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[500px] p-0"
                  align="end"
                  side="bottom"
                  sideOffset={5}
                  collisionPadding={10}
                  style={{ maxWidth: "min(500px, calc(100vw - 20px))" }}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandInput
                      placeholder="Search tests, imaging, procedures..."
                      value={searchTerm}
                      onValueChange={handleSearch}
                    />
                    <CommandList className="max-h-[300px]">
                      {isLoading ? (
                        <div className="py-6 text-center">
                          <div className="inline-flex flex-col items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <p className="text-sm text-muted-foreground">
                              Searching...
                            </p>
                          </div>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <CommandGroup heading="Search Results">
                          {suggestions.map((test) => (
                            <CommandItem
                              key={test.id}
                              value={test.name}
                              onSelect={() => handleTestSelect(test)}
                              className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <div className="flex items-center gap-2">
                                  {getTestTypeIcon(test.type)}
                                  <span className="font-medium">
                                    {test.name}
                                  </span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    getTestTypeBadgeColor(test.type)
                                  )}
                                >
                                  {test.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant="secondary" className="text-xs">
                                  {test.category[0]}
                                </Badge>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : searchTerm.trim() ? (
                        <CommandEmpty>
                          <div className="text-center py-4 space-y-3">
                            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              No tests found
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Try a different search term
                            </p>
                            {showAddNew && (
                              <Button
                                onClick={handleAddNewTest}
                                className="flex items-center gap-2 mx-auto"
                                variant="outline"
                              >
                                <Plus className="h-4 w-4" />
                                Add "{searchTerm}" as new test
                              </Button>
                            )}
                          </div>
                        </CommandEmpty>
                      ) : (
                        <CommandEmpty>
                          <div className="text-center py-4">
                            <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              Start typing to search tests
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Find laboratory tests, imaging, and procedures
                            </p>
                          </div>
                        </CommandEmpty>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Quick Add Popular Tests */}
            {showQuickAdd && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  Quick Add Popular Tests
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {popularTests.map((testName) => {
                    const testResults = testDB.getByNames([testName]);
                    const test = testResults[0];
                    if (!test) return null;

                    const isSelected = selectedTests.find(
                      (t) => t.id === test.id
                    );

                    return (
                      <Button
                        key={testName}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="justify-start h-auto p-3 text-left"
                        onClick={() => handleTestSelect(test)}
                      >
                        <div className="flex flex-col items-start gap-1 w-full">
                          <div className="flex items-center gap-2 w-full">
                            {getTestTypeIcon(test.type)}
                            <span className="text-sm font-medium truncate">
                              {testName}
                            </span>
                            {isSelected && <Plus className="h-3 w-3" />}
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                getTestTypeBadgeColor(test.type)
                              )}
                            >
                              {test.type}
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSuggestions([]);
                  setIsOpen(false);
                }}
              >
                Clear Search
              </Button>
              {mode === "multiple" && selectedTests.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => {
                    // Action for adding all selected tests
                    if (onTestsAdd) {
                      onTestsAdd(selectedTests);
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selected Tests
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
