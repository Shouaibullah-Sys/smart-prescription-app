// components/enhanced-prescription-form/BodyMetricsWorkflow.tsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Circle,
  User,
  Scale,
  Ruler,
  Calculator,
  TrendingUp,
  FileText,
  Activity,
  Heart,
  Target,
  Droplets,
  Zap,
  Brain,
  ChevronRight,
  Info,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { cn } from "@/lib/utils";

interface BodyMetricsWorkflowProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  fields: string[];
  completed: boolean;
  mandatory: boolean;
}

export function BodyMetricsWorkflow({
  prescription,
  onUpdateField,
  onNextStep,
  onPreviousStep,
}: BodyMetricsWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const workflowSteps: WorkflowStep[] = [
    {
      id: "personal",
      title: "Personal Information",
      description: "Basic patient demographics and contact details",
      icon: User,
      fields: ["patientName", "patientAge", "patientGender", "patientPhone"],
      completed: false,
      mandatory: true,
    },
    {
      id: "basic-measurements",
      title: "Basic Measurements",
      description: "Height, weight, and BMI calculation",
      icon: Scale,
      fields: ["weight", "height", "bmi"],
      completed: false,
      mandatory: true,
    },
    {
      id: "body-composition",
      title: "Body Composition",
      description: "Circumference measurements and body fat analysis",
      icon: Target,
      fields: [
        "waistCircumference",
        "hipCircumference",
        "bodyFatPercentage",
        "leanBodyMass",
      ],
      completed: false,
      mandatory: false,
    },
    {
      id: "metabolic-analysis",
      title: "Metabolic Analysis",
      description: "Energy expenditure and metabolic rate calculations",
      icon: Zap,
      fields: ["basalMetabolicRate", "totalDailyEnergyExpenditure"],
      completed: false,
      mandatory: false,
    },
    {
      id: "body-assessment",
      title: "Body Assessment",
      description: "Surface area, ratios, and hydration requirements",
      icon: Brain,
      fields: [
        "bodySurfaceArea",
        "waistToHeightRatio",
        "idealBodyWeight",
        "waterRequirement",
      ],
      completed: false,
      mandatory: false,
    },
    {
      id: "review-generate",
      title: "Review & Generate",
      description: "Review all metrics and generate comprehensive report",
      icon: FileText,
      fields: [],
      completed: false,
      mandatory: true,
    },
  ];

  // Check step completion
  const checkStepCompletion = (step: WorkflowStep): boolean => {
    if (step.fields.length === 0) {
      // Review step - consider completed if all mandatory steps are done
      const mandatorySteps = workflowSteps.filter(
        (s) => s.mandatory && s.id !== "review-generate"
      );
      return mandatorySteps.every((s) => completedSteps.has(s.id));
    }

    return step.fields.some((field) => {
      const value = prescription[field as keyof Prescription];
      return value && typeof value === "string" && value.trim() !== "";
    });
  };

  // Update step completion status
  const updateStepCompletion = () => {
    const newCompletedSteps = new Set(completedSteps);
    workflowSteps.forEach((step) => {
      if (checkStepCompletion(step)) {
        newCompletedSteps.add(step.id);
      } else if (!step.mandatory) {
        newCompletedSteps.delete(step.id);
      }
    });
    setCompletedSteps(newCompletedSteps);
  };

  // Update completion status when prescription changes
  React.useEffect(() => {
    updateStepCompletion();
  }, [prescription]);

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleNext = () => {
    if (currentStep < workflowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    onNextStep?.();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    onPreviousStep?.();
  };

  const getStepIcon = (step: WorkflowStep, index: number) => {
    const Icon = step.icon;
    const isCompleted = completedSteps.has(step.id);
    const isCurrent = currentStep === index;

    return (
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300",
          isCompleted
            ? "bg-green-500 border-green-500 text-white"
            : isCurrent
            ? "bg-blue-500 border-blue-500 text-white"
            : "bg-gray-100 border-gray-300 text-gray-400"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </div>
    );
  };

  const calculateProgress = () => {
    const totalSteps = workflowSteps.length;
    const completedCount = completedSteps.size;
    return (completedCount / totalSteps) * 100;
  };

  const renderStepContent = (step: WorkflowStep) => {
    switch (step.id) {
      case "personal":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Patient Name *</label>
                <input
                  type="text"
                  value={prescription.patientName || ""}
                  onChange={(e) => onUpdateField("patientName", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Age (years) *</label>
                <input
                  type="number"
                  value={prescription.patientAge || ""}
                  onChange={(e) => onUpdateField("patientAge", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 35"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Gender *</label>
                <select
                  value={prescription.patientGender || ""}
                  onChange={(e) =>
                    onUpdateField("patientGender", e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  value={prescription.patientPhone || ""}
                  onChange={(e) =>
                    onUpdateField("patientPhone", e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 09123456789"
                />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Why we need this information
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Personal information is essential for accurate body metrics
                    calculations, as many formulas vary by age and gender. This
                    data helps ensure precision in health assessments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "basic-measurements":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  min="2"
                  max="300"
                  step="0.1"
                  value={prescription.weight || ""}
                  onChange={(e) => onUpdateField("weight", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 70.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Height (cm) *
                </label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  step="0.1"
                  value={prescription.height || ""}
                  onChange={(e) => onUpdateField("height", e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 175.0"
                />
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  BMI (auto-calculated)
                </label>
                <div className="mt-1 px-3 py-2 bg-gray-100 border rounded-md">
                  {prescription.bmi
                    ? parseFloat(prescription.bmi).toFixed(1)
                    : "Will be calculated"}
                </div>
              </div>
            </div>
            {prescription.bmi && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  BMI Category
                </h4>
                <p className="text-sm text-green-700">
                  Your BMI is{" "}
                  <strong>{parseFloat(prescription.bmi).toFixed(1)}</strong>,
                  which falls into the normal range. Keep up the good work!
                </p>
              </div>
            )}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">
                    Measurement Tips
                  </h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>
                      • Weigh yourself in the morning, after using the bathroom
                    </li>
                    <li>• Remove shoes and heavy clothing</li>
                    <li>
                      • Stand tall against the wall for height measurement
                    </li>
                    <li>• BMI will be calculated automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "body-composition":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Waist Circumference (cm)
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  value={prescription.waistCircumference || ""}
                  onChange={(e) =>
                    onUpdateField("waistCircumference", e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 85.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Measure at the narrowest part of your waist
                </p>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Hip Circumference (cm)
                </label>
                <input
                  type="number"
                  min="30"
                  max="200"
                  step="0.1"
                  value={prescription.hipCircumference || ""}
                  onChange={(e) =>
                    onUpdateField("hipCircumference", e.target.value)
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., 95.0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Measure at the widest part of your hips
                </p>
              </div>
            </div>

            {prescription.weight &&
              prescription.height &&
              prescription.patientAge &&
              prescription.patientGender && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Body Fat Percentage
                    </h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {prescription.bodyFatPercentage || "Calculated"}{" "}
                      <span className="text-sm">%</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Estimated using BMI and age
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      Lean Body Mass
                    </h4>
                    <div className="text-2xl font-bold text-green-600">
                      {prescription.leanBodyMass || "Calculated"}{" "}
                      <span className="text-sm">kg</span>
                    </div>
                    <p className="text-xs text-green-700 mt-1">
                      Weight without fat mass
                    </p>
                  </div>
                </div>
              )}

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900">
                    Circumference Measurement Guide
                  </h4>
                  <ul className="text-sm text-purple-700 mt-1 space-y-1">
                    <li>• Use a flexible measuring tape</li>
                    <li>• Measure against skin, not over clothing</li>
                    <li>• Stand relaxed, don't suck in your stomach</li>
                    <li>• Take measurements at the end of a normal exhale</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "metabolic-analysis":
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">
                Metabolic Rate Information
              </h4>
              <p className="text-sm text-orange-700">
                These calculations help understand how many calories your body
                burns at rest and during daily activities. Essential for
                nutrition and fitness planning.
              </p>
            </div>

            {prescription.weight &&
              prescription.height &&
              prescription.patientAge &&
              prescription.patientGender && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Basal Metabolic Rate
                    </h4>
                    <div className="text-2xl font-bold text-red-600">
                      {prescription.basalMetabolicRate || "Calculated"}{" "}
                      <span className="text-sm">kcal/day</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                      Calories burned at complete rest
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Total Daily Energy Expenditure
                    </h4>
                    <div className="text-2xl font-bold text-purple-600">
                      {prescription.totalDailyEnergyExpenditure || "Calculated"}{" "}
                      <span className="text-sm">kcal/day</span>
                    </div>
                    <p className="text-xs text-purple-700 mt-1">
                      Total calories including activity
                    </p>
                  </div>
                </div>
              )}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                Activity Level Impact
              </h4>
              <p className="text-sm text-gray-700">
                Your activity level significantly affects your TDEE. More active
                individuals burn more calories and may have different
                nutritional needs.
              </p>
            </div>
          </div>
        );

      case "body-assessment":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Body Surface Area
                </h4>
                <div className="text-xl font-bold text-indigo-600">
                  {prescription.bodySurfaceArea || "Calculated"}{" "}
                  <span className="text-sm">m²</span>
                </div>
                <p className="text-xs text-indigo-700 mt-1">
                  Used for medication dosing
                </p>
              </div>
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-medium text-teal-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Waist-to-Height Ratio
                </h4>
                <div className="text-xl font-bold text-teal-600">
                  {prescription.waistToHeightRatio || "Calculated"}
                </div>
                <p className="text-xs text-teal-700 mt-1">
                  Cardiovascular risk indicator
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Ideal Body Weight
                </h4>
                <div className="text-xl font-bold text-green-600">
                  {prescription.idealBodyWeight || "Calculated"}{" "}
                  <span className="text-sm">kg</span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Based on height and gender
                </p>
              </div>
              <div className="bg-sky-50 p-4 rounded-lg">
                <h4 className="font-medium text-sky-900 mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Daily Water Need
                </h4>
                <div className="text-xl font-bold text-sky-600">
                  {prescription.waterRequirement || "Calculated"}{" "}
                  <span className="text-sm">ml</span>
                </div>
                <p className="text-xs text-sky-700 mt-1">
                  Based on weight and activity
                </p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Assessment Complete
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    These comprehensive measurements provide a complete picture
                    of your body composition and health indicators. All values
                    are calculated using medically-accepted formulas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "review-generate":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">
                Review Summary
              </h4>
              <p className="text-sm text-green-700">
                All required measurements have been completed. You can now
                generate a comprehensive body metrics report that will be
                included in your prescription PDF.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completedSteps.size}/{workflowSteps.length}
                </div>
                <div className="text-sm text-gray-600">Steps Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(calculateProgress())}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {
                    Array.from(completedSteps).filter(
                      (id) => !workflowSteps.find((s) => s.id === id)?.mandatory
                    ).length
                  }
                </div>
                <div className="text-sm text-gray-600">Optional Metrics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {prescription.bmi ? "✓" : "○"}
                </div>
                <div className="text-sm text-gray-600">BMI Calculated</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">
                Ready for PDF Generation
              </h4>
              <p className="text-sm text-yellow-700">
                Your comprehensive body metrics will now be included in the
                generated PDF prescription with detailed calculations and health
                insights.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepData = workflowSteps[currentStep];
  const progress = calculateProgress();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Comprehensive Body Metrics Workflow
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Follow this step-by-step process to collect and calculate
          comprehensive body metrics
        </p>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
        <p className="text-sm text-gray-500 mt-2">
          {Math.round(progress)}% Complete ({completedSteps.size}/
          {workflowSteps.length} steps)
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {workflowSteps.map((step, index) => (
          <Card
            key={step.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-md",
              currentStep === index && "ring-2 ring-blue-500 shadow-md",
              completedSteps.has(step.id) && "bg-green-50 dark:bg-green-900/20"
            )}
            onClick={() => handleStepClick(index)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                {getStepIcon(step, index)}
                <div>
                  <h3 className="font-semibold text-sm">{step.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                </div>
                {step.mandatory && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {getStepIcon(currentStepData, currentStep)}
            <div>
              <CardTitle className="flex items-center gap-2">
                {currentStepData.title}
                {completedSteps.has(currentStepData.id) && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderStepContent(currentStepData)}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          Previous
        </Button>

        <div className="flex gap-2">
          {workflowSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "w-3 h-3 rounded-full transition-colors",
                currentStep === index
                  ? "bg-blue-500"
                  : completedSteps.has(step.id)
                  ? "bg-green-500"
                  : "bg-gray-300"
              )}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === workflowSteps.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
