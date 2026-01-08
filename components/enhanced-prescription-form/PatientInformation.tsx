// components/enhanced-prescription-form/PatientInformation.tsx
import React, { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Phone,
  Calendar,
  Calculator,
  Scale,
  Ruler,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  Heart,
  Brain,
  Activity,
  Target,
  Droplets,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import {
  calculateBMI,
  getBMICategory,
  calculateIdealBodyWeight,
  calculateBMR,
  calculateBodySurfaceArea,
  calculateBodyFatPercentage,
  calculateLeanBodyMass,
  calculateWaistToHeightRatio,
  calculateAdjustedBodyWeight,
  calculateWaterRequirement,
  calculateTDEE,
} from "@/utils/calculations";
import { cn } from "@/lib/utils";

interface PatientInformationProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function PatientInformation({
  prescription,
  onUpdateField,
}: PatientInformationProps) {
  // Type definition for input field names
  type InputFieldName =
    | "patientName"
    | "patientAge"
    | "patientGender"
    | "patientPhone"
    | "weight"
    | "height"
    | "waistCircumference"
    | "hipCircumference";

  // Create refs for all input fields
  const inputRefs = useRef({
    patientName: useRef<HTMLInputElement>(null),
    patientAge: useRef<HTMLInputElement>(null),
    patientPhone: useRef<HTMLInputElement>(null),
    weight: useRef<HTMLInputElement>(null),
    height: useRef<HTMLInputElement>(null),
    waistCircumference: useRef<HTMLInputElement>(null),
    hipCircumference: useRef<HTMLInputElement>(null),
    patientGender: useRef<HTMLButtonElement>(null), // Select trigger ref
  });

  // Field order for navigation
  const fieldOrder: InputFieldName[] = [
    "patientName",
    "patientAge",
    "patientGender",
    "patientPhone",
    "weight",
    "height",
    "waistCircumference",
    "hipCircumference",
  ];

  // State for validation and interactions
  const [activeSection, setActiveSection] = useState<"personal" | "metrics">(
    "personal"
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [lastCalculated, setLastCalculated] = useState<Date | null>(null);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "light" | "moderate" | "active" | "veryActive"
  >("moderate");

  // Handle Enter key navigation with enhanced feedback
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, currentField: InputFieldName) => {
      if (event.key === "Enter") {
        event.preventDefault();

        // Validate current field before proceeding
        const currentValue = prescription[currentField];
        if (currentField === "patientName" && !currentValue?.trim()) {
          setValidationErrors((prev) => ({
            ...prev,
            patientName: "Patient name is required",
          }));
          return;
        }

        // Clear validation error for this field
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[currentField];
          return newErrors;
        });

        // Find current field index
        const currentIndex = fieldOrder.indexOf(currentField);
        if (currentIndex === -1) return;

        // Find next focusable field
        let nextIndex = currentIndex + 1;
        while (nextIndex < fieldOrder.length) {
          const nextField = fieldOrder[nextIndex];
          const nextRef = inputRefs.current[nextField];

          // Check if ref exists and is valid
          if (nextRef?.current) {
            // Add visual feedback for navigation
            const currentElement = event.currentTarget as HTMLElement;
            currentElement.classList.add(
              "ring-2",
              "ring-blue-500",
              "ring-offset-1"
            );
            setTimeout(() => {
              currentElement.classList.remove(
                "ring-2",
                "ring-blue-500",
                "ring-offset-1"
              );
            }, 300);

            // Special handling for Select trigger
            if (nextField === "patientGender") {
              setTimeout(() => {
                if (nextRef.current) {
                  (nextRef.current as HTMLButtonElement).focus();
                  setActiveSection("personal");
                }
              }, 50);
            } else {
              setTimeout(() => {
                if (nextRef.current) {
                  (nextRef.current as HTMLInputElement).focus();
                  if (nextField === "weight" || nextField === "height") {
                    setActiveSection("metrics");
                  }
                }
              }, 50);
            }
            return;
          }
          nextIndex++;
        }

        // If we reached the end, focus the first field
        const firstRef = inputRefs.current[fieldOrder[0]];
        if (firstRef?.current) {
          setTimeout(() => {
            if (firstRef.current) {
              (firstRef.current as HTMLInputElement).focus();
              setActiveSection("personal");
            }
          }, 50);
        }
      }
    },
    [prescription]
  );

  // Handle weight change and auto-calculate BMI
  const handleWeightChange = (value: string) => {
    // Validate weight
    const weightNum = parseFloat(value);
    if (weightNum && (weightNum < 2 || weightNum > 300)) {
      setValidationErrors((prev) => ({
        ...prev,
        weight: "Weight must be between 2kg and 300kg",
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.weight;
        return newErrors;
      });
    }

    onUpdateField("weight", value);
    if (prescription.height) {
      const bmi = calculateBMI(value, prescription.height);
      onUpdateField("bmi", bmi);
    }

    // OPTIONAL: Auto-focus to height only if weight looks complete
    // For example, if weight has 2+ characters and looks like a complete number
    const looksComplete = value.length >= 2 && /^\d+(\.\d*)?$/.test(value);

    if (looksComplete && inputRefs.current.height?.current) {
      // Small delay to let user finish typing
      setTimeout(() => {
        inputRefs.current.height.current?.focus();
        setActiveSection("metrics");
      }, 500); // Longer delay to give user time to type
    }
  };

  // Handle height change and auto-calculate BMI
  const handleHeightChange = (value: string) => {
    // Validate height
    const heightNum = parseFloat(value);
    if (heightNum && (heightNum < 50 || heightNum > 250)) {
      setValidationErrors((prev) => ({
        ...prev,
        height: "Height must be between 50cm and 250cm",
      }));
    } else {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.height;
        return newErrors;
      });
    }

    onUpdateField("height", value);
    if (prescription.weight) {
      const bmi = calculateBMI(prescription.weight, value);
      onUpdateField("bmi", bmi);
    }
  };

  // Calculate all body metrics
  const calculateAllBodyMetrics = () => {
    if (!prescription.weight || !prescription.height) {
      setValidationErrors((prev) => ({
        ...prev,
        metrics: "Weight and height are required for calculations",
      }));
      return;
    }

    const bmi = calculateBMI(prescription.weight, prescription.height);
    onUpdateField("bmi", bmi);

    // Calculate comprehensive body metrics
    if (prescription.patientAge && prescription.patientGender) {
      // BMI-based calculations
      const bodyFatPercentage = calculateBodyFatPercentage(
        prescription.patientAge,
        prescription.patientGender,
        bmi
      );
      onUpdateField("bodyFatPercentage", bodyFatPercentage);

      const leanBodyMass = calculateLeanBodyMass(
        prescription.weight,
        bodyFatPercentage
      );
      onUpdateField("leanBodyMass", leanBodyMass);

      // BMR and TDEE calculations
      const bmrData = calculateBMR(
        prescription.weight,
        prescription.height,
        prescription.patientAge,
        prescription.patientGender
      );
      onUpdateField("basalMetabolicRate", bmrData.average);

      const tdee = calculateTDEE(bmrData.average, activityLevel);
      onUpdateField("totalDailyEnergyExpenditure", tdee);
    }

    // Body composition calculations
    if (prescription.waistCircumference) {
      const waistToHeightRatio = calculateWaistToHeightRatio(
        prescription.waistCircumference,
        prescription.height
      );
      onUpdateField("waistToHeightRatio", waistToHeightRatio);
    }

    // Weight-related calculations
    if (prescription.patientGender) {
      const idealWeightData = calculateIdealBodyWeight(
        prescription.height,
        prescription.patientGender
      );
      onUpdateField("idealBodyWeight", idealWeightData.average);

      const adjustedBodyWeight = calculateAdjustedBodyWeight(
        prescription.weight,
        prescription.height,
        prescription.patientGender
      );
      onUpdateField("adjustedBodyWeight", adjustedBodyWeight);
    }

    // Surface area and hydration
    const bsaData = calculateBodySurfaceArea(
      prescription.weight,
      prescription.height
    );
    onUpdateField("bodySurfaceArea", bsaData.average);

    const waterRequirement = calculateWaterRequirement(
      prescription.weight,
      activityLevel === "veryActive"
        ? "athlete"
        : activityLevel === "active"
        ? "active"
        : "sedentary"
    );
    onUpdateField("waterRequirement", waterRequirement);

    setLastCalculated(new Date());

    // Clear metrics error
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.metrics;
      return newErrors;
    });

    // Visual feedback
    const calculateBtn = document.querySelector("[data-calculate-btn]");
    if (calculateBtn) {
      calculateBtn.classList.add("ring-2", "ring-purple-500", "ring-offset-2");
      setTimeout(() => {
        calculateBtn.classList.remove(
          "ring-2",
          "ring-purple-500",
          "ring-offset-2"
        );
      }, 500);
    }

    // Focus back on weight field after calculation
    setTimeout(() => {
      if (inputRefs.current.weight?.current) {
        inputRefs.current.weight.current.focus();
      }
    }, 200);
  };

  // Get BMI category for display
  const bmiCategory = prescription.bmi
    ? getBMICategory(prescription.bmi)
    : null;

  // Calculate all advanced metrics - EXTRACT THE AVERAGE VALUES
  const idealWeightData =
    prescription.height && prescription.patientGender
      ? calculateIdealBodyWeight(
          prescription.height,
          prescription.patientGender
        )
      : null;

  const idealWeightValue = idealWeightData?.average || "";

  const bmrData =
    prescription.weight &&
    prescription.height &&
    prescription.patientAge &&
    prescription.patientGender
      ? calculateBMR(
          prescription.weight,
          prescription.height,
          prescription.patientAge,
          prescription.patientGender
        )
      : null;

  const bmrValue = bmrData?.average || "";

  const bsaData =
    prescription.weight && prescription.height
      ? calculateBodySurfaceArea(prescription.weight, prescription.height)
      : null;

  const bsaValue = bsaData?.average || "";

  // Additional calculated metrics
  const bodyFatPercentage =
    prescription.patientAge && prescription.patientGender && prescription.bmi
      ? calculateBodyFatPercentage(
          prescription.patientAge,
          prescription.patientGender,
          prescription.bmi
        )
      : "";

  const leanBodyMassValue =
    prescription.weight && bodyFatPercentage
      ? calculateLeanBodyMass(prescription.weight, bodyFatPercentage)
      : "";

  const waistToHeightRatioValue =
    prescription.waistCircumference && prescription.height
      ? calculateWaistToHeightRatio(
          prescription.waistCircumference,
          prescription.height
        )
      : "";

  const adjustedBodyWeightValue =
    prescription.height && prescription.patientGender && prescription.weight
      ? calculateAdjustedBodyWeight(
          prescription.weight,
          prescription.height,
          prescription.patientGender
        )
      : "";

  const tdeeValue = bmrValue ? calculateTDEE(bmrValue, activityLevel) : "";

  const waterRequirementValue = prescription.weight
    ? calculateWaterRequirement(
        prescription.weight,
        activityLevel === "veryActive"
          ? "athlete"
          : activityLevel === "active"
          ? "active"
          : "sedentary"
      )
    : "";

  // Check if all required fields are filled
  const isComplete =
    prescription.patientName &&
    prescription.patientAge &&
    prescription.patientGender &&
    prescription.weight &&
    prescription.height;

  // Check if we have any advanced metrics to show
  const hasAdvancedMetrics =
    idealWeightValue ||
    bmrValue ||
    bsaValue ||
    bodyFatPercentage ||
    leanBodyMassValue ||
    waistToHeightRatioValue ||
    adjustedBodyWeightValue ||
    tdeeValue ||
    waterRequirementValue;

  return (
    <div
      id="patient-information"
      className="group flex flex-col sm:flex-row border-2 border-blue-100 dark:border-blue-800/30 rounded-xl overflow-hidden hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/10 shadow-sm hover:shadow-md"
    >
      {/* Left Sidebar - Clinical Summary */}
      <div
        className={cn(
          "w-full sm:w-1/4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-blue-200/50 dark:border-blue-800/30 transition-all duration-300",
          "bg-gradient-to-b from-blue-50/80 to-white dark:from-blue-950/40 dark:to-gray-900",
          activeSection === "personal" && "bg-blue-50/90 dark:bg-blue-950/50"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-gray-900 dark:text-white">
                Patient Profile
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-300 font-medium mt-0.5">
                Clinical Data Summary
              </div>
            </div>
          </div>

          {/* Patient Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Status
              </span>
              {isComplete ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">
                    Complete
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                    In Progress
                  </span>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="space-y-3">
              {prescription.patientName && (
                <div className="p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-800/30">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Name
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {prescription.patientName}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {prescription.patientAge && (
                  <div className="p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Age
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {prescription.patientAge} yrs
                    </div>
                  </div>
                )}

                {prescription.patientGender && (
                  <div className="p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Sex
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {prescription.patientGender}
                    </div>
                  </div>
                )}
              </div>

              {/* BMI Status Card */}
              {prescription.bmi && bmiCategory && (
                <div
                  className={cn(
                    "p-3 rounded-lg border transition-all duration-300",
                    bmiCategory.color.includes("green") &&
                      "bg-green-50/80 dark:bg-green-900/20 border-green-200 dark:border-green-800/30",
                    bmiCategory.color.includes("amber") &&
                      "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30",
                    bmiCategory.color.includes("red") &&
                      "bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        BMI Status
                      </div>
                      <div
                        className={cn(
                          "text-lg font-bold mt-1",
                          bmiCategory.color
                        )}
                      >
                        {prescription.bmi}
                      </div>
                    </div>
                    <Activity
                      className={cn(
                        "h-8 w-8",
                        bmiCategory.color.includes("green") && "text-green-400",
                        bmiCategory.color.includes("amber") && "text-amber-400",
                        bmiCategory.color.includes("red") && "text-red-400"
                      )}
                    />
                  </div>
                  <div
                    className={cn(
                      "text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block",
                      bmiCategory.color.includes("text-") &&
                        bmiCategory.color.replace("text-", "bg-") + "/10",
                      bmiCategory.color
                    )}
                  >
                    {bmiCategory.category}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Guide */}
          <div className="mt-auto pt-4 border-t border-blue-100 dark:border-blue-800/30">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Navigation Guide
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                <ChevronRight className="h-3 w-3 mr-1" />
                <span>
                  Press
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">
                    Enter
                  </kbd>{" "}
                  to navigate
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Auto-calculates BMI on input
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Data Entry & Metrics */}
      <div
        className={cn(
          "w-full sm:w-3/4 p-4 sm:p-5 transition-all duration-300",
          activeSection === "metrics" &&
            "bg-gradient-to-br from-purple-50/20 to-white dark:from-purple-950/10 dark:to-gray-900"
        )}
      >
        <div className="space-y-5">
          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                Personal Information
                <div className="ml-2 text-xs font-normal px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  Required Fields
                </div>
              </Label>
              {validationErrors.patientName && (
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.patientName}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800/50 dark:to-blue-950/20 rounded-xl border-2 border-blue-100 dark:border-blue-800/30 shadow-sm">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientName"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  Full Patient Name *
                </Label>
                <Input
                  id="patientName"
                  ref={inputRefs.current.patientName}
                  value={prescription.patientName || ""}
                  onChange={(e) => onUpdateField("patientName", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "patientName")}
                  onFocus={() => setActiveSection("personal")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="Enter patient's full name"
                  required
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientAge"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Calendar className="h-3.5 w-3.5 text-blue-500" />
                  Age (years)
                </Label>
                <Input
                  id="patientAge"
                  ref={inputRefs.current.patientAge}
                  type="number"
                  min="0"
                  max="120"
                  value={prescription.patientAge || ""}
                  onChange={(e) => onUpdateField("patientAge", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "patientAge")}
                  onFocus={() => setActiveSection("personal")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 35"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientGender"
                  className="text-xs font-semibold"
                >
                  Sex
                </Label>
                <Select
                  value={prescription.patientGender || ""}
                  onValueChange={(value) => {
                    onUpdateField("patientGender", value);
                    setActiveSection("personal");
                  }}
                >
                  <SelectTrigger
                    ref={inputRefs.current.patientGender}
                    id="patientGender"
                    onFocus={() => setActiveSection("personal")}
                    className="h-9 text-sm bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100"
                    onKeyDown={(e) =>
                      handleKeyDown(e as React.KeyboardEvent, "patientGender")
                    }
                  >
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700">
                    <SelectItem
                      value="Male"
                      className="text-sm text-gray-900 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                    >
                      Male
                    </SelectItem>
                    <SelectItem
                      value="Female"
                      className="text-sm text-gray-900 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                    >
                      Female
                    </SelectItem>
                    <SelectItem
                      value="Other"
                      className="text-sm text-gray-900 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                    >
                      Other
                    </SelectItem>
                    <SelectItem
                      value="Prefer not to say"
                      className="text-sm text-gray-900 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:bg-blue-50 dark:focus:bg-blue-900/30"
                    >
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="patientPhone"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                  Contact Number
                </Label>
                <Input
                  id="patientPhone"
                  ref={inputRefs.current.patientPhone}
                  type="tel"
                  value={prescription.patientPhone || ""}
                  onChange={(e) =>
                    onUpdateField("patientPhone", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "patientPhone")}
                  onFocus={() => setActiveSection("personal")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="09123456789"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Body Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Calculator className="h-4 w-4 text-white" />
                </div>
                Body Metrics & Calculations
                {lastCalculated && (
                  <div className="ml-2 text-xs font-normal px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                    Last calculated:{" "}
                    {lastCalculated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </Label>
              {validationErrors.metrics && (
                <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.metrics}
                </div>
              )}
            </div>

            {/* Metrics Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-800/50 dark:to-purple-950/20 rounded-xl border-2 border-purple-100 dark:border-purple-800/30 shadow-sm">
              {/* Weight */}
              <div className="space-y-2">
                <Label
                  htmlFor="weight"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Scale className="h-3.5 w-3.5 text-purple-500" />
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  ref={inputRefs.current.weight}
                  type="number"
                  min="2"
                  max="300"
                  step="0.1"
                  value={prescription.weight || ""}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "weight")}
                  onFocus={() => setActiveSection("metrics")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 70.5"
                />
                {validationErrors.weight && (
                  <div className="text-xs text-red-500 dark:text-red-400">
                    {validationErrors.weight}
                  </div>
                )}
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label
                  htmlFor="height"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Ruler className="h-3.5 w-3.5 text-purple-500" />
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  ref={inputRefs.current.height}
                  type="number"
                  min="50"
                  max="250"
                  step="0.1"
                  value={prescription.height || ""}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "height")}
                  onFocus={() => setActiveSection("metrics")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 175.0"
                />
                {validationErrors.height && (
                  <div className="text-xs text-red-500 dark:text-red-400">
                    {validationErrors.height}
                  </div>
                )}
              </div>

              {/* BMI Display */}
              <div className="space-y-2">
                <Label
                  htmlFor="bmi"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Activity className="h-3.5 w-3.5 text-purple-500" />
                  Body Mass Index
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="bmi"
                    value={
                      prescription.bmi
                        ? parseFloat(prescription.bmi).toFixed(1)
                        : ""
                    }
                    readOnly
                    className="h-9 text-sm bg-gray-100/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-700 font-mono flex-1 cursor-default text-gray-900 dark:text-gray-100"
                    placeholder="Auto-calculated"
                  />
                  {prescription.bmi && bmiCategory && (
                    <div
                      className={cn(
                        "h-9 px-3 flex items-center justify-center text-xs font-bold rounded-md border",
                        bmiCategory.color,
                        bmiCategory.color.replace("text-", "border-"),
                        bmiCategory.color.replace("text-", "bg-") + "/10"
                      )}
                    >
                      {bmiCategory.category}
                    </div>
                  )}
                </div>
              </div>

              {/* Waist Circumference */}
              <div className="space-y-2">
                <Label
                  htmlFor="waistCircumference"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Ruler className="h-3.5 w-3.5 text-purple-500" />
                  Waist Circumference (cm)
                </Label>
                <Input
                  id="waistCircumference"
                  ref={inputRefs.current.waistCircumference}
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  value={prescription.waistCircumference || ""}
                  onChange={(e) =>
                    onUpdateField("waistCircumference", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "waistCircumference")}
                  onFocus={() => setActiveSection("metrics")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 85.0"
                />
              </div>

              {/* Hip Circumference */}
              <div className="space-y-2">
                <Label
                  htmlFor="hipCircumference"
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <Ruler className="h-3.5 w-3.5 text-purple-500" />
                  Hip Circumference (cm)
                </Label>
                <Input
                  id="hipCircumference"
                  ref={inputRefs.current.hipCircumference}
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  value={prescription.hipCircumference || ""}
                  onChange={(e) =>
                    onUpdateField("hipCircumference", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "hipCircumference")}
                  onFocus={() => setActiveSection("metrics")}
                  className="h-9 text-sm bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-gray-900 dark:text-gray-100"
                  placeholder="e.g., 95.0"
                />
              </div>

              {/* Activity Level */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-purple-500" />
                  Activity Level
                </Label>
                <Select
                  value={activityLevel}
                  onValueChange={(value: any) => setActivityLevel(value)}
                >
                  <SelectTrigger className="h-9 text-sm bg-white dark:bg-gray-800 border-purple-200 dark:border-purple-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary" className="text-sm">
                      Sedentary (little/no exercise)
                    </SelectItem>
                    <SelectItem value="light" className="text-sm">
                      Light (1-3 days/week)
                    </SelectItem>
                    <SelectItem value="moderate" className="text-sm">
                      Moderate (3-5 days/week)
                    </SelectItem>
                    <SelectItem value="active" className="text-sm">
                      Active (6-7 days/week)
                    </SelectItem>
                    <SelectItem value="veryActive" className="text-sm">
                      Very Active (physical job + exercise)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Calculate Button */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-transparent">
                  Action
                </Label>
                <button
                  data-calculate-btn
                  onClick={calculateAllBodyMetrics}
                  className="w-full h-9 flex items-center justify-center gap-2 px-4 text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  type="button"
                >
                  <Calculator className="h-4 w-4" />
                  Calculate All
                </button>
              </div>
            </div>

            {/* Advanced Metrics Dashboard */}
            {hasAdvancedMetrics && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" />
                    Advanced Clinical Metrics
                  </div>
                  {idealWeightData && bmrData && bsaData && (
                    <button
                      onClick={() =>
                        setShowAdvancedMetrics(!showAdvancedMetrics)
                      }
                      className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
                    >
                      <span>
                        {showAdvancedMetrics ? "Hide Details" : "Show Details"}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 transition-transform",
                          showAdvancedMetrics && "rotate-90"
                        )}
                      />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {idealWeightValue && (
                    <div className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800/30 hover:border-green-300 dark:hover:border-green-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Ideal Weight
                        </div>
                        <Heart className="h-4 w-4 text-green-500 dark:text-green-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-green-600 dark:text-green-400">
                        {idealWeightValue}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kg
                        </span>
                      </div>
                      {showAdvancedMetrics && idealWeightData && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                          <div>Average of 4 methods:</div>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <span>Hamwi: {idealWeightData.hamwi} kg</span>
                            <span>Devine: {idealWeightData.devine} kg</span>
                            <span>Robinson: {idealWeightData.robinson} kg</span>
                            <span>Miller: {idealWeightData.miller} kg</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {bmrValue && (
                    <div className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Basal Metabolic Rate
                        </div>
                        <Zap className="h-4 w-4 text-blue-500 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {bmrValue}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kcal/day
                        </span>
                      </div>
                      {showAdvancedMetrics && bmrData && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                          <div>Average of 3 equations:</div>
                          <div className="grid grid-cols-1 gap-1 mt-1">
                            <span>Mifflin-St Jeor: {bmrData.mifflin} kcal</span>
                            <span>
                              Harris-Benedict: {bmrData.harrisBenedict} kcal
                            </span>
                            <span>
                              Katch-McArdle: {bmrData.katchMcArdle} kcal
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {bsaValue && (
                    <div className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800/30 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Body Surface Area
                        </div>
                        <Brain className="h-4 w-4 text-purple-500 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                        {bsaValue}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          m²
                        </span>
                      </div>
                      {showAdvancedMetrics && bsaData && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2 space-y-1">
                          <div>Average of 3 formulas:</div>
                          <div className="grid grid-cols-1 gap-1 mt-1">
                            <span>Mosteller: {bsaData.mosteller} m²</span>
                            <span>Du Bois: {bsaData.dubois} m²</span>
                            <span>Haycock: {bsaData.haycock} m²</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {bodyFatPercentage && (
                    <div className="group p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800/30 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Body Fat Percentage
                        </div>
                        <Target className="h-4 w-4 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                        {bodyFatPercentage}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          %
                        </span>
                      </div>
                    </div>
                  )}

                  {leanBodyMassValue && (
                    <div className="group p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Lean Body Mass
                        </div>
                        <Activity className="h-4 w-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {leanBodyMassValue}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kg
                        </span>
                      </div>
                    </div>
                  )}

                  {waistToHeightRatioValue && (
                    <div className="group p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-teal-200 dark:border-teal-800/30 hover:border-teal-300 dark:hover:border-teal-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Waist-to-Height Ratio
                        </div>
                        <Target className="h-4 w-4 text-teal-500 dark:text-teal-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
                        {waistToHeightRatioValue}
                      </div>
                    </div>
                  )}

                  {tdeeValue && (
                    <div className="group p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border-2 border-rose-200 dark:border-rose-800/30 hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Total Daily Energy Expenditure
                        </div>
                        <Zap className="h-4 w-4 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
                        {tdeeValue}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          kcal/day
                        </span>
                      </div>
                    </div>
                  )}

                  {waterRequirementValue && (
                    <div className="group p-4 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800/30 hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 hover:shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Daily Water Requirement
                        </div>
                        <Droplets className="h-4 w-4 text-sky-500 dark:text-sky-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="text-xl font-bold text-sky-600 dark:text-sky-400">
                        {waterRequirementValue}{" "}
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          ml/day
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
