// components/enhanced-prescription-form/MedicalTests.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FlaskConical,
  Microscope,
  Activity,
  CheckCircle2,
  Camera,
  TestTube,
  Zap,
  Clock,
  Plus,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { Badge } from "@/components/ui/badge";
import {
  LaboratoryImagingAutocomplete,
  TestSuggestion,
} from "@/components/ui/laboratory-imaging-autocomplete";

interface MedicalTestsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
  selectedTestObjects: TestSuggestion[];
  onTestsChange: (tests: TestSuggestion[]) => void;
  onSelectedExamsChange: (exams: Set<string>) => void;
}

export function MedicalTests({
  prescription,
  onUpdateField,
  selectedTestObjects,
  onTestsChange,
  onSelectedExamsChange,
}: MedicalTestsProps) {
  const [selectedTest, setSelectedTest] = useState<TestSuggestion | null>(null);
  const [searchType, setSearchType] = useState<
    "all" | "lab" | "imaging" | "special"
  >("all");

  // Debug logging
  useEffect(() => {
    console.log("Selected test objects updated:", selectedTestObjects);
  }, [selectedTestObjects]);

  const handleTestSelect = useCallback(
    (test: TestSuggestion | null) => {
      console.log("Test selected in MedicalTests:", test);
      setSelectedTest(test);

      if (test) {
        // Check if test already exists
        const exists = selectedTestObjects.find((t) => t.id === test.id);
        if (!exists) {
          const newTests = [...selectedTestObjects, test];
          console.log("Adding new test. New tests array:", newTests);
          onTestsChange(newTests);
          onUpdateField(
            "medicalExams",
            newTests.map((t) => t.name)
          );
          onSelectedExamsChange(new Set(newTests.map((t) => t.id)));
        } else {
          console.log("Test already exists, skipping duplicate.");
        }
      }
    },
    [selectedTestObjects, onTestsChange, onUpdateField, onSelectedExamsChange]
  );

  const handleCustomTestAdd = useCallback(
    (customValue: string) => {
      console.log("Adding custom test:", customValue);

      if (!customValue.trim()) {
        console.log("Empty custom value, skipping.");
        return;
      }

      // Create a custom test object
      const customTest: TestSuggestion = {
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        name: customValue.trim(),
        category: ["Custom Test"],
        type: "Procedure",
        preparation: [],
        fasting_required: false,
        insurance_coverage: false,
      };

      const newTests = [...selectedTestObjects, customTest];
      console.log("New tests after custom addition:", newTests);
      onTestsChange(newTests);
      onUpdateField(
        "medicalExams",
        newTests.map((t) => t.name)
      );
      onSelectedExamsChange(new Set(newTests.map((t) => t.id)));

      // Clear the selected test
      setSelectedTest(null);
    },
    [selectedTestObjects, onTestsChange, onUpdateField, onSelectedExamsChange]
  );

  const removeTest = useCallback(
    (testId: string) => {
      console.log("Removing test:", testId);
      const newTests = selectedTestObjects.filter((t) => t.id !== testId);
      onTestsChange(newTests);
      onUpdateField(
        "medicalExams",
        newTests.map((t) => t.name)
      );
      onSelectedExamsChange(new Set(newTests.map((t) => t.id)));
    },
    [selectedTestObjects, onTestsChange, onUpdateField, onSelectedExamsChange]
  );

  // Calculate test statistics
  const testStats = useMemo(
    () => ({
      total: selectedTestObjects.length,
      categories: selectedTestObjects.reduce((acc, test) => {
        const type = test.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      fastingRequired: selectedTestObjects.filter((t) => t.fasting_required)
        .length,
      customTests: selectedTestObjects.filter(
        (t) => t.category.includes("Custom Test") || t.id.startsWith("custom-")
      ).length,
    }),
    [selectedTestObjects]
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Laboratory":
        return <TestTube className="h-4 w-4" />;
      case "Imaging":
        return <Camera className="h-4 w-4" />;
      case "Special Test":
        return <Zap className="h-4 w-4" />;
      case "Procedure":
        return <Plus className="h-4 w-4" />;
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
      case "Procedure":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  const getFilterType = useCallback(():
    | ("Laboratory" | "Imaging" | "Special Test" | "Procedure")[]
    | undefined => {
    switch (searchType) {
      case "lab":
        return ["Laboratory"];
      case "imaging":
        return ["Imaging"];
      case "special":
        return ["Special Test", "Procedure"];
      default:
        return undefined;
    }
  }, [searchType]);

  return (
    <div
      id="medical-tests"
      className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors"
    >
      {/* Left Sidebar */}
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              Lab Tests & Imaging
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Paraclinical Investigations
            </div>
          </div>
        </div>

        {/* Test Statistics */}
        <div className="mt-3 space-y-2">
          {/* Total Tests */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-purple-100 dark:border-purple-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Microscope className="h-3 w-3" />
              Tests Ordered
            </div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {testStats.total}
            </div>
            {testStats.total > 0 && (
              <div className="text-[10px] text-muted-foreground mt-0.5 space-y-0.5">
                {Object.entries(testStats.categories).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-1">
                    {getTypeIcon(type)}
                    <span>
                      {type}: {count}
                    </span>
                  </div>
                ))}
                {testStats.customTests > 0 && (
                  <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Plus className="h-3 w-3" />
                    <span>Custom: {testStats.customTests}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fasting Required */}
          {testStats.fastingRequired > 0 && (
            <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-amber-100 dark:border-amber-800">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-500" />
                Fasting Required
              </div>
              <div className="text-sm font-medium mt-1 text-amber-600 dark:text-amber-400">
                {testStats.fastingRequired} test(s)
              </div>
            </div>
          )}
        </div>

        {/* Quick Search Categories */}
        <div className="mt-4">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
            Quick Filter:
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setSearchType("all")}
              className={`text-xs px-2 py-1.5 rounded transition-colors ${
                searchType === "all"
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              All Tests
            </button>
            <button
              type="button"
              onClick={() => setSearchType("lab")}
              className={`text-xs px-2 py-1.5 rounded transition-colors ${
                searchType === "lab"
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <TestTube className="h-3 w-3 inline mr-1" />
              Lab
            </button>
            <button
              type="button"
              onClick={() => setSearchType("imaging")}
              className={`text-xs px-2 py-1.5 rounded transition-colors ${
                searchType === "imaging"
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Camera className="h-3 w-3 inline mr-1" />
              Imaging
            </button>
            <button
              type="button"
              onClick={() => setSearchType("special")}
              className={`text-xs px-2 py-1.5 rounded transition-colors ${
                searchType === "special"
                  ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <Zap className="h-3 w-3 inline mr-1" />
              Special
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-4">
          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Total Tests
              </div>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {testStats.total}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Lab Tests
              </div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {testStats.categories["Laboratory"] || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Imaging
              </div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {testStats.categories["Imaging"] || 0}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 dark:text-gray-300">
                Custom Tests
              </div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {testStats.customTests}
              </div>
            </div>
          </div>

          {/* Use Accordion for collapsible sections */}
          <Accordion type="multiple" className="w-full">
            {/* Search and Select Tests */}
            <AccordionItem
              value="test-search"
              className="border border-purple-100 dark:border-purple-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-purple-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Test Search & Selection
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Search and select diagnostic tests and imaging
                    </div>
                  </div>
                  {selectedTestObjects.length > 0 && (
                    <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                      {selectedTestObjects.length} selected
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-3">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <TestTube className="h-3.5 w-3.5" />
                    Search Tests
                  </Label>
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800">
                    <LaboratoryImagingAutocomplete
                      value={selectedTest}
                      onValueChange={handleTestSelect}
                      onCustomValueAdd={handleCustomTestAdd}
                      placeholder={`Search for ${
                        searchType === "all"
                          ? "laboratory tests, imaging procedures, or special tests"
                          : searchType === "lab"
                          ? "laboratory tests"
                          : searchType === "imaging"
                          ? "imaging procedures"
                          : "special tests"
                      } (e.g., CBC, MRI, Endoscopy)...`}
                      limit={20}
                      filterByType={getFilterType()}
                      showPreparationInfo={true}
                      showFastingIndicator={true}
                      className="w-full"
                      allowCustomEntries={true}
                    />

                    <div className="text-xs text-muted-foreground mt-3">
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                          <Plus className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">💡 Quick Tips:</p>
                          <ul className="mt-1 space-y-1">
                            <li>• Click on a suggestion to select it</li>
                            <li>
                              • Press{" "}
                              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                                Enter
                              </span>{" "}
                              to select the first suggestion
                            </li>
                            <li>
                              • If no match found, press{" "}
                              <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                                Enter
                              </span>{" "}
                              to add custom test
                            </li>
                            <li>
                              • Custom tests are marked with{" "}
                              <Plus className="h-3 w-3 inline text-amber-600" />{" "}
                              icon
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Tests */}
                {selectedTestObjects.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Selected Tests ({selectedTestObjects.length})
                    </Label>
                    <div className="grid gap-2 max-h-60 overflow-y-auto p-3 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg border border-green-100 dark:border-green-800">
                      {selectedTestObjects.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-start justify-between p-2 bg-white dark:bg-gray-800 rounded border"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getTypeIcon(test.type)}
                              <span className="font-medium text-sm">
                                {test.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${getTypeColor(test.type)}`}
                              >
                                {test.type}
                              </Badge>
                              {test.fasting_required && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Fasting
                                </Badge>
                              )}
                              {test.category.includes("Custom Test") && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                >
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {test.category.slice(0, 2).map((cat) => (
                                <Badge
                                  key={cat}
                                  variant="outline"
                                  className="mr-1 mb-1 text-xs"
                                >
                                  {cat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTest(test.id)}
                            className="text-xs px-2 py-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Summary Section */}
          {selectedTestObjects.length > 0 && (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-purple-100 dark:border-purple-800">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                Test Order Summary
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Selected Tests:
                  </div>
                  <div className="space-y-1">
                    {selectedTestObjects.slice(0, 5).map((test, index) => (
                      <div
                        key={test.id || index}
                        className="flex items-center gap-1.5"
                      >
                        {getTypeIcon(test.type)}
                        <span className="text-xs truncate">{test.name}</span>
                        {test.category.includes("Custom Test") && (
                          <Badge
                            variant="outline"
                            className="text-xs h-3 px-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300"
                          >
                            C
                          </Badge>
                        )}
                      </div>
                    ))}
                    {selectedTestObjects.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        + {selectedTestObjects.length - 5} more tests
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Timeline & Requirements:
                  </div>
                  <div className="space-y-0.5">
                    {testStats.fastingRequired > 0 && (
                      <div className="text-xs">
                        <span className="font-medium">Fasting required:</span>{" "}
                        {testStats.fastingRequired} test(s)
                      </div>
                    )}
                    {testStats.customTests > 0 && (
                      <div className="text-xs text-amber-600 dark:text-amber-400">
                        <span className="font-medium">Custom tests:</span>{" "}
                        {testStats.customTests} (manual review needed)
                      </div>
                    )}
                    <div className="text-xs">
                      <span className="font-medium">Lab results:</span> 24-48
                      hours
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Imaging results:</span> 2-3
                      days
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">Special tests:</span> 3-7
                      days
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
