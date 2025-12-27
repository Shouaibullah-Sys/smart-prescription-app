// components/SmartTestSearch.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
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
  Filter,
  Star,
  TrendingUp,
  Zap,
  BookOpen,
  Heart,
  Brain,
  Bone,
  Eye,
  Thermometer,
  Syringe,
  TestTube,
  Scan,
  Activity,
  Pill,
  Shield,
  CheckCircle,
  ChevronRight,
  Info,
  ExternalLink,
  Plus,
  Download,
  Copy,
  Bookmark,
  BookmarkCheck,
  Calendar,
  User,
  Building,
  MapPin,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { testDB, Test as DatabaseTest } from "@/services/testDatabaseService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Enhanced Type definitions - Updated to match database
interface Test extends DatabaseTest {
  alternativeNames?: string[];
  subCategory?: string[];
  critical_values?: string;
  sample_type?: string;
  tube_type?: string;
  storage_instructions?: string;
  turnaround_time?: string;
  cost_estimate?: number;
  insurance_coverage?: boolean;
  frequently_ordered_with?: string[];
  contraindications?: string[];
  interpretation_notes?: string;
  references?: string[];
  last_updated?: Date;
  meta?: {
    ai_generated_description?: string;
    confidence_score?: number;
    synonyms?: string[];
    related_conditions?: string[];
  };
}

interface TestSuggestion {
  id: string;
  name: string;
  category: string[];
  subCategory?: string;
  type: string;
  preparation?: string[];
  fasting_required?: boolean;
  description?: string;
  normal_range?: string;
  cost_estimate?: number;
  turnaround_time?: string;
  sample_type?: string;
  insurance_coverage?: boolean;
}

interface SearchSuggestion {
  type: "local" | "popular" | "recent" | "ai_suggested" | "category" | "bundle";
  data: TestSuggestion | TestCategory | TestBundle;
  label: string;
  description: string;
  confidence: number;
  category: string;
  typeLabel: string;
  tags?: string[];
  score?: number;
}

interface TestCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  testCount: number;
  color: string;
}

interface TestBundle {
  id: string;
  name: string;
  tests: string[];
  description: string;
  price: number;
  discount: number;
  category: string;
}

interface SearchFilter {
  type?: ("Laboratory" | "Imaging" | "Special Test" | "Procedure")[];
  category?: string[];
  fastingOnly?: boolean;
  urgentOnly?: boolean;
  coveredByInsurance?: boolean;
  maxCost?: number;
  minPopularity?: number;
}

interface SmartTestSearchProps {
  value?: string;
  onChange?: (value: string, test?: any) => void;
  onSuggestionSelect?: (suggestion: any) => void;
  onMultipleSelect?: (tests: Test[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mode?: "single" | "multiple";
  showFilters?: boolean;
  showCategories?: boolean;
  showPopular?: boolean;
  autoFocus?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "minimal" | "expanded";
  context?: {
    patientAge?: number;
    patientGender?: string;
    symptoms?: string[];
    diagnosis?: string[];
    medications?: string[];
  };
}

const TEST_CATEGORIES: TestCategory[] = [
  {
    id: "hematology",
    name: "Hematology",
    icon: <Heart className="h-4 w-4" />,
    description: "Blood tests and analysis",
    testCount: 45,
    color: "text-red-500 bg-red-50",
  },
  {
    id: "biochemistry",
    name: "Biochemistry",
    icon: <FlaskConical className="h-4 w-4" />,
    description: "Chemical analysis of body fluids",
    testCount: 68,
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: "immunology",
    name: "Immunology",
    icon: <Shield className="h-4 w-4" />,
    description: "Immune system tests",
    testCount: 32,
    color: "text-green-500 bg-green-50",
  },
  {
    id: "microbiology",
    name: "Microbiology",
    icon: <TestTube className="h-4 w-4" />,
    description: "Infection and culture tests",
    testCount: 28,
    color: "text-purple-500 bg-purple-50",
  },
  {
    id: "imaging",
    name: "Imaging",
    icon: <Scan className="h-4 w-4" />,
    description: "Radiology and scans",
    testCount: 25,
    color: "text-amber-500 bg-amber-50",
  },
  {
    id: "cardiology",
    name: "Cardiology",
    icon: <Activity className="h-4 w-4" />,
    description: "Heart and vascular tests",
    testCount: 18,
    color: "text-pink-500 bg-pink-50",
  },
  {
    id: "neurology",
    name: "Neurology",
    icon: <Brain className="h-4 w-4" />,
    description: "Brain and nervous system",
    testCount: 22,
    color: "text-indigo-500 bg-indigo-50",
  },
  {
    id: "endocrinology",
    name: "Endocrinology",
    icon: <Thermometer className="h-4 w-4" />,
    description: "Hormone tests",
    testCount: 15,
    color: "text-cyan-500 bg-cyan-50",
  },
];

const TEST_BUNDLES: TestBundle[] = [
  {
    id: "basic_panel",
    name: "Basic Health Panel",
    tests: [
      "Complete Blood Count",
      "Basic Metabolic Panel",
      "Lipid Profile",
      "Liver Function Tests",
    ],
    description: "Comprehensive basic health assessment",
    price: 120,
    discount: 20,
    category: "General",
  },
  {
    id: "diabetes_panel",
    name: "Diabetes Monitoring Panel",
    tests: [
      "Fasting Blood Glucose",
      "HbA1c",
      "Lipid Profile",
      "Kidney Function Tests",
    ],
    description: "Complete diabetes management panel",
    price: 95,
    discount: 15,
    category: "Endocrinology",
  },
  {
    id: "cardiac_panel",
    name: "Cardiac Risk Panel",
    tests: [
      "Lipid Profile",
      "C-reactive Protein",
      "Homocysteine",
      "Electrocardiogram",
    ],
    description: "Cardiovascular risk assessment",
    price: 150,
    discount: 25,
    category: "Cardiology",
  },
  {
    id: "thyroid_panel",
    name: "Thyroid Function Panel",
    tests: ["TSH", "Free T4", "Free T3", "Thyroid Antibodies"],
    description: "Complete thyroid evaluation",
    price: 85,
    discount: 10,
    category: "Endocrinology",
  },
];

export function SmartTestSearch({
  value,
  onChange,
  onSuggestionSelect,
  onMultipleSelect,
  placeholder = "Search for tests, imaging, or procedures...",
  disabled = false,
  className,
  mode = "single",
  showFilters = true,
  showCategories = true,
  showPopular = true,
  autoFocus = false,
  size = "md",
  variant = "default",
  context,
}: SmartTestSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<
    { term: string; timestamp: Date; type: string }[]
  >([]);
  const [selectedTests, setSelectedTests] = useState<Test[]>([]);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [activeTab, setActiveTab] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<SearchSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
  };

  // Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("smart_test_search_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Keep only last 10 searches, sorted by timestamp
          const sorted = parsed
            .map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp),
            }))
            .sort((a: any, b: any) => b.timestamp - a.timestamp)
            .slice(0, 10);
          setSearchHistory(sorted);
        }
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
      setSearchHistory([]);
    }
  }, []);

  const saveToHistory = useCallback(
    (term: string, type: string = "search") => {
      if (!term.trim()) return;

      const newEntry = {
        term,
        timestamp: new Date(),
        type,
      };

      const updated = [
        newEntry,
        ...searchHistory.filter((h) => h.term !== term),
      ].slice(0, 10);

      setSearchHistory(updated);

      try {
        localStorage.setItem(
          "smart_test_search_history",
          JSON.stringify(updated)
        );
      } catch (error) {
        console.warn("Failed to save search history:", error);
      }
    },
    [searchHistory]
  );

  const generateAiSuggestions = useCallback(
    async (term: string, filters: SearchFilter) => {
      if (!term.trim() || !context) return [];

      setIsAiLoading(true);
      try {
        // Simulate AI-powered suggestions based on context
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockAiSuggestions: SearchSuggestion[] = [
          {
            type: "ai_suggested",
            data: {
              id: "ai-1",
              name: "Complete Blood Count (CBC)",
              category: ["Hematology"],
              type: "Laboratory",
              preparation: ["No special preparation needed"],
              fasting_required: false,
            },
            label: "Complete Blood Count (CBC)",
            description: "Recommended based on patient symptoms",
            confidence: 0.92,
            category: "Hematology",
            typeLabel: "Laboratory",
            tags: ["AI Recommended", "Common", "Basic"],
            score: 95,
          },
        ];

        return mockAiSuggestions;
      } catch (error) {
        console.error("AI suggestion error:", error);
        return [];
      } finally {
        setIsAiLoading(false);
      }
    },
    [context]
  );

  const searchTests = useCallback(
    async (term: string, filters: SearchFilter): Promise<void> => {
      console.log("Searching tests for:", term, "with filters:", filters);

      if (!term.trim()) {
        setSuggestions([]);
        setShowAddNew(false);
        setOpen(true); // Keep open for categories/popular
        return;
      }

      setIsLoading(true);

      try {
        // Get local suggestions from database
        let localSuggestions = testDB.getSuggestions(term);

        // Apply filters
        if (filters.type?.length) {
          localSuggestions = localSuggestions.filter((test: any) =>
            filters.type?.includes(test.type as any)
          );
        }

        if (filters.category?.length) {
          localSuggestions = localSuggestions.filter((test: any) =>
            test.category.some((cat: string) => filters.category?.includes(cat))
          );
        }

        if (filters.fastingOnly) {
          localSuggestions = localSuggestions.filter(
            (test: any) => test.fasting_required
          );
        }

        if (filters.coveredByInsurance) {
          localSuggestions = localSuggestions.filter(
            (test: any) => test.insurance_coverage
          );
        }

        if (filters.minPopularity) {
          localSuggestions = localSuggestions.filter(
            (test: any) =>
              (test as any).popular_score >= (filters.minPopularity || 0)
          );
        }

        // Format suggestions
        const combined = localSuggestions.map(
          (suggestion: any): SearchSuggestion => ({
            type: "local" as const,
            data: suggestion,
            label: suggestion.name,
            description: suggestion.type,
            confidence: 0.8 + Math.random() * 0.2, // Simulate confidence score
            category: suggestion.category[0] || "General",
            typeLabel: suggestion.type,
            tags: suggestion.fasting_required ? ["Fasting"] : [],
            score: (suggestion as any).popular_score || 85,
          })
        );

        // Sort by confidence and popularity
        combined.sort((a: SearchSuggestion, b: SearchSuggestion) => {
          if (b.score !== a.score) return (b.score || 0) - (a.score || 0);
          return b.confidence - a.confidence;
        });

        // Add AI suggestions if context is provided
        let aiResults: SearchSuggestion[] = [];
        if (context && term.length > 2) {
          aiResults = await generateAiSuggestions(term, filters);
        }

        setSuggestions([...aiResults, ...combined].slice(0, 20));

        // Show "Add New" option if no results found and search term is not empty
        setShowAddNew(combined.length + aiResults.length === 0);
        setOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [context, generateAiSuggestions]
  );

  // Debounced search with filters
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchTests(searchTerm, filters);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, filters, searchTests]);

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      console.log("Selected suggestion:", suggestion);
      const selectedValue = suggestion.label;
      setSearchTerm(mode === "multiple" ? "" : selectedValue);

      if (mode === "multiple") {
        // Add to selected tests
        const newTest: Test = {
          ...(suggestion.data as any),
          popular_score: 85,
        };
        setSelectedTests((prev) => {
          const updated = [...prev, newTest];
          if (onMultipleSelect) {
            onMultipleSelect(updated);
          }
          return updated;
        });
      } else {
        setOpen(false);
        saveToHistory(selectedValue, "test_select");
      }

      if (onChange) {
        onChange(selectedValue, suggestion.data);
      }

      if (onSuggestionSelect) {
        onSuggestionSelect(suggestion.data);
      }
    },
    [mode, onChange, onSuggestionSelect, onMultipleSelect, saveToHistory]
  );

  const handleCategorySelect = useCallback(
    (category: TestCategory) => {
      setSearchTerm(category.name);
      setFilters((prev) => ({ ...prev, category: [category.id] }));
      saveToHistory(category.name, "category_select");
    },
    [saveToHistory]
  );

  const handleBundleSelect = useCallback(
    (bundle: TestBundle) => {
      if (mode === "multiple" && onMultipleSelect) {
        // Add all tests in bundle to selected tests
        const bundleTests = testDB.getByNames(bundle.tests);
        setSelectedTests((prev) => {
          const updated = [...prev, ...bundleTests];
          onMultipleSelect(updated);
          return updated;
        });
      }
      saveToHistory(bundle.name, "bundle_select");
    },
    [mode, onMultipleSelect, saveToHistory]
  );

  const handleAddNewTest = useCallback(() => {
    const newTest: Test = {
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
      popular_score: 50,
    };

    if (mode === "multiple") {
      // Add to selected tests
      setSelectedTests((prev) => {
        const updated = [...prev, newTest];
        if (onMultipleSelect) {
          onMultipleSelect(updated);
        }
        return updated;
      });
    } else {
      setOpen(false);
      setSearchTerm(searchTerm);
      saveToHistory(searchTerm, "test_select");
    }

    if (onChange) {
      onChange(searchTerm, newTest);
    }

    if (onSuggestionSelect) {
      onSuggestionSelect(newTest);
    }

    setShowAddNew(false);
  }, [
    searchTerm,
    mode,
    onChange,
    onSuggestionSelect,
    onMultipleSelect,
    saveToHistory,
  ]);

  const removeSelectedTest = useCallback(
    (testId: string) => {
      setSelectedTests((prev) => {
        const updated = prev.filter((test) => test.id !== testId);
        if (onMultipleSelect) {
          onMultipleSelect(updated);
        }
        return updated;
      });
    },
    [onMultipleSelect]
  );

  const clearSearch = () => {
    setSearchTerm("");
    setSuggestions([]);
    setOpen(false);
    setSelectedTests([]);
    if (onChange) {
      onChange("", undefined);
    }
    if (onMultipleSelect) {
      onMultipleSelect([]);
    }
  };

  const clearFilters = () => {
    setFilters({});
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
        return <Syringe className="h-4 w-4 text-amber-500" />;
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

  const renderTestDetailTooltip = (test: Test) => (
    <div className="space-y-2">
      <div className="font-semibold">{test.name}</div>
      {test.description && (
        <p className="text-sm text-muted-foreground">{test.description}</p>
      )}
      {test.normal_range && (
        <div className="text-sm">
          <span className="font-medium">Normal Range: </span>
          {test.normal_range}
        </div>
      )}
      {test.sample_type && (
        <div className="text-sm">
          <span className="font-medium">Sample: </span>
          {test.sample_type}
        </div>
      )}
      {test.turnaround_time && (
        <div className="text-sm">
          <span className="font-medium">Turnaround: </span>
          {test.turnaround_time}
        </div>
      )}
      {test.preparation && test.preparation.length > 0 && (
        <div className="text-sm">
          <span className="font-medium">Preparation: </span>
          {test.preparation.join(", ")}
        </div>
      )}
    </div>
  );

  // Focus input when popover opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <TooltipProvider>
      <div className={cn("space-y-3", className)}>
        {/* Selected Tests Display (Multiple Mode) */}
        {mode === "multiple" && selectedTests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Selected Tests ({selectedTests.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTests([])}
                className="h-7 text-xs"
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTests.map((test) => (
                <Tooltip key={test.id}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 pl-2 pr-1 py-1 cursor-pointer hover:bg-secondary/80"
                    >
                      {getTestTypeIcon(test.type)}
                      <span className="max-w-[150px] truncate">
                        {test.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          removeSelectedTest(test.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    {renderTestDetailTooltip(test)}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}

        {/* Main Search Component */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <div
                className={cn(
                  "relative flex items-center rounded-md border border-input bg-background",
                  sizeClasses[size]
                )}
              >
                <Search className="absolute right-3 h-4 w-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value;
                    setSearchTerm(value);
                    if (value.trim() && !open) setOpen(true);
                  }}
                  onFocus={() => {
                    if (searchTerm.trim() || showCategories || showPopular) {
                      setOpen(true);
                    }
                  }}
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                    "w-full pl-10 pr-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                    sizeClasses[size]
                  )}
                  autoFocus={autoFocus}
                />
                <div className="absolute left-2 flex items-center gap-1">
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={clearSearch}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {showFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-transparent"
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                    >
                      <Filter className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
            className="w-[500px] p-0"
            align="start"
            side="bottom"
            sideOffset={5}
            collisionPadding={10}
            style={{ maxWidth: "min(500px, calc(100vw - 20px))" }} // Responsive width
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command className="rounded-lg border shadow-lg">
              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="border-b p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Advanced Filters
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs"
                    >
                      Clear All
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Test Type</Label>
                      <Select
                        value={filters.type?.[0] || ""}
                        onValueChange={(value: string) =>
                          setFilters((prev) => ({
                            ...prev,
                            type: value ? [value as any] : [],
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="All types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Types</SelectItem>
                          <SelectItem value="Laboratory">Laboratory</SelectItem>
                          <SelectItem value="Imaging">Imaging</SelectItem>
                          <SelectItem value="Special Test">
                            Special Test
                          </SelectItem>
                          <SelectItem value="Procedure">Procedure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs">Max Cost</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[filters.maxCost || 1000]}
                          onValueChange={([value]: number[]) =>
                            setFilters((prev) => ({ ...prev, maxCost: value }))
                          }
                          max={5000}
                          step={100}
                          className="flex-1"
                        />
                        <span className="text-xs w-12">
                          ${filters.maxCost || 1000}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="fasting-only"
                        checked={filters.fastingOnly || false}
                        onCheckedChange={(checked: boolean) =>
                          setFilters((prev) => ({
                            ...prev,
                            fastingOnly: checked,
                          }))
                        }
                      />
                      <Label htmlFor="fasting-only" className="text-xs">
                        Fasting Required
                      </Label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        id="insurance-covered"
                        checked={filters.coveredByInsurance || false}
                        onCheckedChange={(checked: boolean) =>
                          setFilters((prev) => ({
                            ...prev,
                            coveredByInsurance: checked,
                          }))
                        }
                      />
                      <Label htmlFor="insurance-covered" className="text-xs">
                        Insurance Covered
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              <CommandInput
                placeholder="Type test name, category, or procedure..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="border-none"
                ref={inputRef}
              />

              <CommandList className="max-h-[400px]">
                {/* Loading State */}
                {isLoading ? (
                  <div className="py-6 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="text-sm text-muted-foreground">
                        Searching tests...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Tabs for different sections */}
                    {!searchTerm && (showCategories || showPopular) && (
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="px-2 pt-2"
                      >
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="all" className="text-xs">
                            All
                          </TabsTrigger>
                          <TabsTrigger value="categories" className="text-xs">
                            Categories
                          </TabsTrigger>
                          <TabsTrigger value="popular" className="text-xs">
                            Popular
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    )}

                    {/* Empty State */}
                    {suggestions.length === 0 && searchTerm && (
                      <CommandEmpty>
                        <div className="flex flex-col items-center py-8 text-center space-y-4">
                          <Search className="h-10 w-10 text-muted-foreground mb-3" />
                          <div>
                            <p className="text-sm font-medium mb-1">
                              No tests found
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[300px]">
                              Try a different search term or browse categories
                            </p>
                          </div>
                          {showAddNew && (
                            <Button
                              onClick={handleAddNewTest}
                              className="flex items-center gap-2"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4" />
                              Add "{searchTerm}" as new test
                            </Button>
                          )}
                        </div>
                      </CommandEmpty>
                    )}

                    {/* Search History */}
                    {searchHistory.length > 0 &&
                      searchTerm === "" &&
                      activeTab === "all" && (
                        <CommandGroup heading="Recent Searches">
                          {searchHistory.map((item, index) => (
                            <CommandItem
                              key={`history-${index}`}
                              value={item.term}
                              onSelect={() => {
                                setSearchTerm(item.term);
                                searchTests(item.term, filters);
                              }}
                              className="flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-2">
                                <History className="h-3 w-3 text-muted-foreground" />
                                <span>{item.term}</span>
                                <Badge
                                  variant="outline"
                                  className="text-xs h-5"
                                >
                                  {item.type}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    setSearchHistory((prev) =>
                                      prev.filter((_, i) => i !== index)
                                    );
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}

                    {/* Categories */}
                    {showCategories &&
                      searchTerm === "" &&
                      (activeTab === "all" || activeTab === "categories") && (
                        <CommandGroup heading="Browse Categories">
                          <div className="grid grid-cols-2 gap-2 p-2">
                            {TEST_CATEGORIES.map((category) => (
                              <CommandItem
                                key={category.id}
                                onSelect={() => handleCategorySelect(category)}
                                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent rounded-md"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className={cn(
                                      "p-2 rounded-md",
                                      category.color
                                    )}
                                  >
                                    {category.icon}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {category.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {category.testCount} tests
                                    </div>
                                  </div>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {category.description}
                                </p>
                              </CommandItem>
                            ))}
                          </div>
                        </CommandGroup>
                      )}

                    {/* Test Bundles */}
                    {mode === "multiple" && searchTerm === "" && (
                      <CommandGroup heading="Popular Test Bundles">
                        {TEST_BUNDLES.map((bundle) => (
                          <CommandItem
                            key={bundle.id}
                            onSelect={() => handleBundleSelect(bundle)}
                            className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent rounded-md"
                          >
                            <div className="flex items-center justify-between w-full mb-2">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-amber-500" />
                                <span className="font-medium">
                                  {bundle.name}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Save ${bundle.discount}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <DollarSign className="h-3 w-3" />
                              <span>${bundle.price}</span>
                              <span className="line-through text-muted-foreground/50">
                                ${bundle.price + bundle.discount}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {bundle.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {bundle.tests.slice(0, 3).map((test, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {test}
                                </Badge>
                              ))}
                              {bundle.tests.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{bundle.tests.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* AI Suggestions */}
                    {aiSuggestions.length > 0 && (
                      <CommandGroup
                        heading={
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            AI Suggestions
                            {context && (
                              <Badge variant="outline" className="text-xs">
                                Context-aware
                              </Badge>
                            )}
                          </div>
                        }
                      >
                        {aiSuggestions.map((suggestion, index) => (
                          <CommandItem
                            key={`ai-${index}`}
                            onSelect={() => handleSelect(suggestion)}
                            className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent rounded-md border-l-2 border-l-purple-500"
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-purple-500" />
                                <span className="font-medium">
                                  {suggestion.label}
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
                                <Badge variant="secondary" className="text-xs">
                                  AI Score: {Math.round(suggestion.score || 0)}%
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center gap-2">
                              {suggestion.tags?.map((tag, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Search Results */}
                    {suggestions.length > 0 && (
                      <CommandGroup heading="Search Results">
                        {suggestions.map((suggestion, index) => (
                          <Tooltip key={`${suggestion.type}-${index}`}>
                            <TooltipTrigger asChild>
                              <CommandItem
                                value={suggestion.label}
                                onSelect={() => handleSelect(suggestion)}
                                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent rounded-md"
                              >
                                <div className="flex items-center justify-between w-full mb-1">
                                  <div className="flex items-center gap-2">
                                    {getTestTypeIcon(suggestion.typeLabel)}
                                    <span className="font-medium">
                                      {suggestion.label}
                                    </span>
                                    {suggestion.type === "ai_suggested" && (
                                      <Sparkles className="h-3 w-3 text-purple-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        getTestTypeBadgeColor(
                                          suggestion.typeLabel
                                        )
                                      )}
                                    >
                                      {suggestion.typeLabel}
                                    </Badge>
                                    {suggestion.type === "local" && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        Local
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {suggestion.category}
                                  </Badge>
                                  {suggestion.data &&
                                    typeof suggestion.data === "object" &&
                                    "fasting_required" in suggestion.data &&
                                    suggestion.data.fasting_required && (
                                      <span className="flex items-center gap-1 text-xs">
                                        <Clock className="h-3 w-3" />
                                        Fasting required
                                      </span>
                                    )}
                                  {suggestion.data &&
                                    typeof suggestion.data === "object" &&
                                    "turnaround_time" in suggestion.data &&
                                    suggestion.data.turnaround_time && (
                                      <span className="flex items-center gap-1 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        {suggestion.data.turnaround_time}
                                      </span>
                                    )}
                                  {suggestion.data &&
                                    typeof suggestion.data === "object" &&
                                    "cost_estimate" in suggestion.data &&
                                    suggestion.data.cost_estimate && (
                                      <span className="flex items-center gap-1 text-xs">
                                        <DollarSign className="h-3 w-3" />$
                                        {suggestion.data.cost_estimate}
                                      </span>
                                    )}
                                </div>

                                {suggestion.data &&
                                  typeof suggestion.data === "object" &&
                                  "preparation" in suggestion.data &&
                                  suggestion.data.preparation &&
                                  suggestion.data.preparation.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs">
                                      <AlertCircle className="h-3 w-3 text-amber-500" />
                                      <span className="text-amber-600">
                                        {suggestion.data.preparation[0]}
                                      </span>
                                    </div>
                                  )}

                                {suggestion.data &&
                                  typeof suggestion.data === "object" &&
                                  "description" in suggestion.data &&
                                  suggestion.data.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {suggestion.data.description}
                                    </p>
                                  )}
                              </CommandItem>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="w-80 p-4">
                              {suggestion.data &&
                                typeof suggestion.data === "object" &&
                                "name" in suggestion.data &&
                                renderTestDetailTooltip({
                                  ...(suggestion.data as any),
                                  category: (suggestion.data as any)
                                    .category || ["General"],
                                } as Test)}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Popular Tests */}
                    {showPopular &&
                      searchTerm === "" &&
                      (activeTab === "all" || activeTab === "popular") && (
                        <CommandGroup heading="Popular Tests">
                          {testDB
                            .getAll()
                            .sort(
                              (a: DatabaseTest, b: DatabaseTest) =>
                                b.popular_score - a.popular_score
                            )
                            .slice(0, 8)
                            .map((test, index) => (
                              <CommandItem
                                key={`popular-${index}`}
                                value={test.name}
                                onSelect={() =>
                                  handleSelect({
                                    type: "popular",
                                    data: {
                                      ...test,
                                      category: [test.category[0]],
                                    },
                                    label: test.name,
                                    description: test.type,
                                    confidence: 0.9,
                                    category: test.category[0],
                                    typeLabel: test.type,
                                    score: test.popular_score,
                                  })
                                }
                                className="flex items-center justify-between py-2 px-3"
                              >
                                <div className="flex items-center gap-2">
                                  {getTestTypeIcon(test.type)}
                                  <span>{test.name}</span>
                                  <TrendingUp className="h-3 w-3 text-green-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-xs",
                                      getTestTypeBadgeColor(test.type)
                                    )}
                                  >
                                    {test.type}
                                  </Badge>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Score: {test.popular_score}
                                  </Badge>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      )}
                  </>
                )}
              </CommandList>

              {/* Footer Actions */}
              {mode === "multiple" && selectedTests.length > 0 && (
                <div className="border-t p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">
                        {selectedTests.length} tests selected
                      </span>
                      <div className="text-xs text-muted-foreground">
                        Total estimated cost: $
                        {selectedTests.reduce(
                          (sum, test) => sum + (test.cost_estimate || 0),
                          0
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>

        {/* Quick Actions */}
        {variant === "expanded" && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="h-3 w-3 mr-1" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchTerm("Complete Blood Count");
                searchTests("Complete Blood Count", filters);
              }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Quick CBC
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => {
                setSearchTerm("Lipid Profile");
                searchTests("Lipid Profile", filters);
              }}
            >
              <Heart className="h-3 w-3 mr-1" />
              Lipid Panel
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
