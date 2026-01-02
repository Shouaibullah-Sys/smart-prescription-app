// components/enhanced-prescription-form/BodyMetrics.tsx
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  Activity,
  Heart,
  Zap,
  Brain,
  Target,
  Droplets,
  Scale,
  Ruler,
  TrendingUp,
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

interface BodyMetricsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function BodyMetrics({ prescription, onUpdateField }: BodyMetricsProps) {
  const [activityLevel, setActivityLevel] = useState<
    "sedentary" | "light" | "moderate" | "active" | "veryActive"
  >("moderate");
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  // Calculate all body metrics
  const calculateAllMetrics = () => {
    if (!prescription.weight || !prescription.height) return;

    const bmi = calculateBMI(prescription.weight, prescription.height);
    onUpdateField("bmi", bmi);

    // BMI-based calculations
    if (prescription.patientAge && prescription.patientGender) {
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
  };

  // Get calculated values
  const bmiCategory = prescription.bmi
    ? getBMICategory(prescription.bmi)
    : null;

  const idealWeightData =
    prescription.height && prescription.patientGender
      ? calculateIdealBodyWeight(
          prescription.height,
          prescription.patientGender
        )
      : null;

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

  const bsaData =
    prescription.weight && prescription.height
      ? calculateBodySurfaceArea(prescription.weight, prescription.height)
      : null;

  // Individual metric calculations for display
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

  const tdeeValue = bmrData?.average
    ? calculateTDEE(bmrData.average, activityLevel)
    : "";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-sm">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Comprehensive Body Metrics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Advanced anthropometric calculations and health indicators
            </p>
          </div>
        </div>

        <button
          onClick={calculateAllMetrics}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Calculate All Metrics
        </button>
      </div>

      {/* Basic Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Scale className="h-4 w-4 text-purple-500" />
            Weight (kg)
          </Label>
          <Input
            type="number"
            min="2"
            max="300"
            step="0.1"
            value={prescription.weight || ""}
            onChange={(e) => onUpdateField("weight", e.target.value)}
            className="h-10"
            placeholder="e.g., 70.5"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Ruler className="h-4 w-4 text-purple-500" />
            Height (cm)
          </Label>
          <Input
            type="number"
            min="50"
            max="250"
            step="0.1"
            value={prescription.height || ""}
            onChange={(e) => onUpdateField("height", e.target.value)}
            className="h-10"
            placeholder="e.g., 175.0"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" />
            Waist (cm)
          </Label>
          <Input
            type="number"
            min="30"
            max="200"
            step="0.1"
            value={prescription.waistCircumference || ""}
            onChange={(e) =>
              onUpdateField("waistCircumference", e.target.value)
            }
            className="h-10"
            placeholder="e.g., 85.0"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-500" />
            Activity Level
          </Label>
          <Select
            value={activityLevel}
            onValueChange={(value: any) => setActivityLevel(value)}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select activity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedentary">Sedentary</SelectItem>
              <SelectItem value="light">Light (1-3 days/week)</SelectItem>
              <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
              <SelectItem value="active">Active (6-7 days/week)</SelectItem>
              <SelectItem value="veryActive">Very Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calculated Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* BMI */}
        {prescription.bmi && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                BMI
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {parseFloat(prescription.bmi).toFixed(1)}
            </div>
            {bmiCategory && (
              <div
                className={cn(
                  "text-xs font-medium mt-1 px-2 py-1 rounded-full inline-block",
                  bmiCategory.color
                )}
              >
                {bmiCategory.category}
              </div>
            )}
          </div>
        )}

        {/* Ideal Body Weight */}
        {prescription.idealBodyWeight && (
          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-200 dark:border-green-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ideal Weight
              </div>
              <Heart className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {prescription.idealBodyWeight}{" "}
              <span className="text-sm font-normal">kg</span>
            </div>
          </div>
        )}

        {/* BMR */}
        {prescription.basalMetabolicRate && (
          <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                BMR
              </div>
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {prescription.basalMetabolicRate}{" "}
              <span className="text-sm font-normal">kcal/day</span>
            </div>
          </div>
        )}

        {/* TDEE */}
        {prescription.totalDailyEnergyExpenditure && (
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                TDEE
              </div>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {prescription.totalDailyEnergyExpenditure}{" "}
              <span className="text-sm font-normal">kcal/day</span>
            </div>
          </div>
        )}

        {/* Body Surface Area */}
        {prescription.bodySurfaceArea && (
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border-2 border-indigo-200 dark:border-indigo-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Body Surface Area
              </div>
              <Brain className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {prescription.bodySurfaceArea}{" "}
              <span className="text-sm font-normal">m²</span>
            </div>
          </div>
        )}

        {/* Body Fat Percentage */}
        {prescription.bodyFatPercentage && (
          <div className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Body Fat %
              </div>
              <Target className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {prescription.bodyFatPercentage}{" "}
              <span className="text-sm font-normal">%</span>
            </div>
          </div>
        )}

        {/* Lean Body Mass */}
        {prescription.leanBodyMass && (
          <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-teal-200 dark:border-teal-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Lean Body Mass
              </div>
              <Activity className="h-5 w-5 text-teal-500" />
            </div>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {prescription.leanBodyMass}{" "}
              <span className="text-sm font-normal">kg</span>
            </div>
          </div>
        )}

        {/* Water Requirement */}
        {prescription.waterRequirement && (
          <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-xl border-2 border-sky-200 dark:border-sky-800/30">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Water Need
              </div>
              <Droplets className="h-5 w-5 text-sky-500" />
            </div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {prescription.waterRequirement}{" "}
              <span className="text-sm font-normal">ml/day</span>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Details Toggle */}
      {(idealWeightData || bmrData || bsaData) && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
            className="px-4 py-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
          >
            {showAdvancedDetails ? "Hide" : "Show"} Detailed Calculations
          </button>
        </div>
      )}

      {/* Advanced Details */}
      {showAdvancedDetails && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Detailed Calculation Methods
          </h4>

          {idealWeightData && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ideal Body Weight (4 methods)
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>Hamwi: {idealWeightData.hamwi} kg</div>
                <div>Devine: {idealWeightData.devine} kg</div>
                <div>Robinson: {idealWeightData.robinson} kg</div>
                <div>Miller: {idealWeightData.miller} kg</div>
              </div>
            </div>
          )}

          {bmrData && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Basal Metabolic Rate (3 equations)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div>Mifflin-St Jeor: {bmrData.mifflin} kcal</div>
                <div>Harris-Benedict: {bmrData.harrisBenedict} kcal</div>
                <div>Katch-McArdle: {bmrData.katchMcArdle} kcal</div>
              </div>
            </div>
          )}

          {bsaData && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Body Surface Area (3 formulas)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div>Mosteller: {bsaData.mosteller} m²</div>
                <div>Du Bois: {bsaData.dubois} m²</div>
                <div>Haycock: {bsaData.haycock} m²</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
