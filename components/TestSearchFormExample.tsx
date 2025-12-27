// components/TestSearchFormExample.tsx
"use client";

import React, { useState } from "react";
import { TestSearchForm } from "@/components/TestSearchForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Test as DatabaseTest } from "@/services/testDatabaseService";
import { FlaskConical, CheckCircle } from "lucide-react";

export function TestSearchFormExample() {
  const [selectedTests, setSelectedTests] = useState<DatabaseTest[]>([]);
  const [singleTest, setSingleTest] = useState<DatabaseTest | null>(null);

  const handleSingleTestSelect = (test: DatabaseTest) => {
    setSingleTest(test);
    console.log("Single test selected:", test);
  };

  const handleMultipleTestsAdd = (tests: DatabaseTest[]) => {
    setSelectedTests(tests);
    console.log("Multiple tests selected:", tests);
  };

  const removeTest = (testId: string) => {
    setSelectedTests((prev) => prev.filter((test) => test.id !== testId));
  };

  const clearAllTests = () => {
    setSelectedTests([]);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Test Search Form Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates the new TestSearchForm component for searching and adding
          medical tests
        </p>
      </div>

      {/* Single Selection Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Single Test Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use this mode when you need to select one test at a time
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <TestSearchForm
            mode="single"
            onTestSelect={handleSingleTestSelect}
            placeholder="Search for a specific test..."
            showQuickAdd={true}
            showFilters={false}
          />

          {singleTest && (
            <div className="p-4 border rounded-lg bg-green-50 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">
                  Selected Test:
                </span>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{singleTest.name}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{singleTest.type}</Badge>
                  <Badge variant="secondary">{singleTest.category[0]}</Badge>
                </div>
                {singleTest.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {singleTest.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multiple Selection Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            Multiple Tests Selection
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Use this mode when you need to select multiple tests for a
            prescription
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <TestSearchForm
            mode="multiple"
            selectedTests={selectedTests}
            onTestsAdd={handleMultipleTestsAdd}
            placeholder="Search and add multiple tests..."
            showQuickAdd={true}
            showFilters={true}
          />

          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  Selected Tests ({selectedTests.length})
                </h4>
                <Button variant="outline" size="sm" onClick={clearAllTests}>
                  Clear All
                </Button>
              </div>

              <div className="grid gap-3">
                {selectedTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">{test.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {test.type}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {test.category[0]}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {test.fasting_required && (
                        <Badge variant="destructive" className="text-xs">
                          Fasting Required
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTest(test.id)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Statistics */}
              <div className="pt-3 border-t">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{selectedTests.length}</p>
                    <p className="text-muted-foreground">Total Tests</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      {selectedTests.filter((t) => t.fasting_required).length}
                    </p>
                    <p className="text-muted-foreground">Require Fasting</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">
                      {new Set(selectedTests.map((t) => t.type)).size}
                    </p>
                    <p className="text-muted-foreground">Test Types</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Example</CardTitle>
          <p className="text-sm text-muted-foreground">
            Here's how you might integrate this into your prescription form:
          </p>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            {`// In your prescription form component
const [prescriptionTests, setPrescriptionTests] = useState<DatabaseTest[]>([]);

<TestSearchForm
  mode="multiple"
  selectedTests={prescriptionTests}
  onTestsAdd={setPrescriptionTests}
  placeholder="Search for tests to add to prescription..."
  showQuickAdd={true}
  showFilters={true}
/>

// Later when saving the prescription
const savePrescription = async () => {
  const prescription = {
    ...otherFields,
    medicalTests: prescriptionTests.map(t => t.name), // Store test names
  };
  await saveToDatabase(prescription);
};`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
