// components/SystemExaminations.tsx
import React, { useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BrainCircuit,
  Brain,
  HeartPulse,
  Radiation,
  Syringe,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  Thermometer,
  Eye,
  Ear,
  UserCheck,
  ChevronRight,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { SYSTEM_EXAM_OPTIONS } from "./constants";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface SystemExaminationsProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
  selectedQuickOptions: Record<string, string[]>;
  onToggleQuickOption: (
    system: keyof typeof SYSTEM_EXAM_OPTIONS,
    option: string
  ) => void;
}

// Zod validation schemas for system examinations
const systemExamSchema = z.object({
  cnsExamination: z
    .string()
    .max(2000, "CNS examination must be less than 2000 characters")
    .regex(/^[a-zA-Z0-9\s.,\-•*()/&'"\n]+$/, "Contains invalid characters")
    .optional(),
  cardiovascularExamination: z
    .string()
    .max(2000, "Cardiovascular examination must be less than 2000 characters")
    .regex(/^[a-zA-Z0-9\s.,\-•*()/&'"\n]+$/, "Contains invalid characters")
    .optional(),
  respiratoryExamination: z
    .string()
    .max(2000, "Respiratory examination must be less than 2000 characters")
    .regex(/^[a-zA-Z0-9\s.,\-•*()/&'"\n]+$/, "Contains invalid characters")
    .optional(),
  gastrointestinalExamination: z
    .string()
    .max(2000, "Gastrointestinal examination must be less than 2000 characters")
    .regex(/^[a-zA-Z0-9\s.,\-•*()/&'"\n]+$/, "Contains invalid characters")
    .optional(),
  physicalExam: z
    .string()
    .max(1500, "Physical exam summary must be less than 1500 characters")
    .regex(/^[a-zA-Z0-9\s.,\-•*()/&'"\n]+$/, "Contains invalid characters")
    .optional(),
});

// Type for validation errors
type ValidationErrors = Partial<Record<string, string>>;

export function SystemExaminations({
  prescription,
  onUpdateField,
  selectedQuickOptions,
  onToggleQuickOption,
}: SystemExaminationsProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [activeSection, setActiveSection] = useState<
    "cns" | "cardiovascular" | "respiratory" | "gastrointestinal" | "physical"
  >("cns");

  // Count quick options selected per system
  const quickOptionsCount = {
    cns: selectedQuickOptions.cns?.length || 0,
    cardiovascular: selectedQuickOptions.cardiovascular?.length || 0,
    respiratory: selectedQuickOptions.respiratory?.length || 0,
    gastrointestinal: selectedQuickOptions.gastrointestinal?.length || 0,
  };

  // Total examination length
  const totalExamLength = [
    prescription.cnsExamination?.length || 0,
    prescription.cardiovascularExamination?.length || 0,
    prescription.respiratoryExamination?.length || 0,
    prescription.gastrointestinalExamination?.length || 0,
    prescription.physicalExam?.length || 0,
  ].reduce((a, b) => a + b, 0);

  // Validate system examination text
  const validateSystemExam = useCallback(
    (field: keyof typeof systemExamSchema.shape, text: string): string => {
      try {
        systemExamSchema.shape[field].parse(text);
        return ""; // No error
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.issues[0]?.message || "Validation error";
        }
        return `Invalid ${field} content`;
      }
    },
    []
  );

  // Handle text area changes with validation
  const handleExamChange = useCallback(
    (field: keyof typeof systemExamSchema.shape, value: string) => {
      const error = validateSystemExam(field, value);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      onUpdateField(field, value);
    },
    [onUpdateField, validateSystemExam]
  );

  // Get system status
  const getSystemStatus = (count: number, text?: string) => {
    if (text?.trim() || count > 0) return "recorded";
    return "pending";
  };

  return (
    <div
      id="system-examinations"
      className="group flex flex-col sm:flex-row border-2 border-border/50 dark:border-border rounded-xl overflow-hidden hover:border-border transition-all duration-300 bg-gradient-to-br from-background to-card/30 dark:from-background dark:to-card/10 shadow-sm hover:shadow-md medical-card"
    >
      {/* Left Sidebar */}
      <div
        className={cn(
          "w-full sm:w-1/4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-border/30 transition-all duration-300",
          "bg-gradient-to-b from-emerald-900/10 to-background dark:from-emerald-950/20 dark:to-background",
          activeSection === "cns" && "bg-emerald-900/20",
          activeSection === "cardiovascular" && "bg-red-900/20",
          activeSection === "respiratory" && "bg-blue-900/20",
          activeSection === "gastrointestinal" && "bg-green-900/20",
          activeSection === "physical" && "bg-amber-900/20"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-xl shadow-sm">
              <BrainCircuit className="h-5 w-5 text-emerald-50" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                System Examinations
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                Physical & Clinical Findings
              </div>
            </div>
          </div>

          {/* Examination Quick Stats */}
          <div className="mb-6">
            <div className="space-y-3">
              {/* Overall Progress */}
              <div className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Examination Progress
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                    <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                      {totalExamLength > 0 ? "In Progress" : "Not Started"}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {totalExamLength > 0
                    ? `${totalExamLength} characters documented`
                    : "No examinations recorded"}
                </div>
                {totalExamLength > 0 && (
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(totalExamLength / 100, 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 ml-2">
                      {Math.min(Math.floor(totalExamLength / 100), 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* System Status Cards */}
              {Object.entries(quickOptionsCount).map(([system, count]) => {
                const field = `${system}Examination` as keyof Prescription;
                const text = prescription[field] as string | undefined;
                const status = getSystemStatus(count, text);

                const systemConfig = {
                  cns: {
                    icon: Brain,
                    color: "text-purple-500",
                    bgColor: "bg-purple-100 dark:bg-purple-900/40",
                  },
                  cardiovascular: {
                    icon: HeartPulse,
                    color: "text-red-500",
                    bgColor: "bg-red-100 dark:bg-red-900/40",
                  },
                  respiratory: {
                    icon: Radiation,
                    color: "text-blue-500",
                    bgColor: "bg-blue-100 dark:bg-blue-900/40",
                  },
                  gastrointestinal: {
                    icon: Syringe,
                    color: "text-green-500",
                    bgColor: "bg-green-100 dark:bg-green-900/40",
                  },
                }[system];

                if (!systemConfig) return null;

                return (
                  <div
                    key={system}
                    className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <systemConfig.icon
                          className={`h-3.5 w-3.5 ${systemConfig.color}`}
                        />
                        {system.charAt(0).toUpperCase() + system.slice(1)}
                      </div>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full ${systemConfig.bgColor}`}
                      >
                        {status === "recorded" ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span
                          className={cn(
                            "text-xs font-medium",
                            status === "recorded"
                              ? "text-emerald-700 dark:text-emerald-300"
                              : "text-muted-foreground"
                          )}
                        >
                          {status === "recorded" ? "Recorded" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-foreground">
                        {count} quick options
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs h-5",
                          count > 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {count} selected
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" />
              Examination Guidelines
            </div>
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  Document findings systematically (IPPA: Inspection, Palpation,
                  Percussion, Auscultation)
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  Use quick options for common normal/abnormal findings
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>
                  Include relevant measurements (e.g., BP, HR, RR, SpO2)
                </span>
              </div>
            </div>
          </div>

          {/* Quick Selection Summary */}
          <div className="mt-auto pt-4 border-t border-border/30">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-2">
              <UserCheck className="h-3.5 w-3.5" />
              Quick Selection Summary
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(quickOptionsCount)
                .filter(([_, count]) => count > 0)
                .map(([system, count]) => (
                  <Badge
                    key={system}
                    variant="outline"
                    className="text-xs h-6 px-2 capitalize"
                  >
                    {system}: {count}
                  </Badge>
                ))}
              {Object.values(quickOptionsCount).every(
                (count) => count === 0
              ) && (
                <div className="text-xs text-muted-foreground italic">
                  No quick options selected
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "w-full sm:w-3/4 p-4 sm:p-5 transition-all duration-300",
          activeSection === "cns" &&
            "bg-gradient-to-br from-purple-50/50 to-background dark:from-purple-950/10 dark:to-background",
          activeSection === "cardiovascular" &&
            "bg-gradient-to-br from-red-50/50 to-background dark:from-red-950/10 dark:to-background",
          activeSection === "respiratory" &&
            "bg-gradient-to-br from-blue-50/50 to-background dark:from-blue-950/10 dark:to-background",
          activeSection === "gastrointestinal" &&
            "bg-gradient-to-br from-green-50/50 to-background dark:from-green-950/10 dark:to-background",
          activeSection === "physical" &&
            "bg-gradient-to-br from-amber-50/50 to-background dark:from-amber-950/10 dark:to-background"
        )}
      >
        <div className="mb-4">
          <Label className="text-sm font-bold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-400 rounded-lg">
              <BrainCircuit className="h-4 w-4 text-emerald-50" />
            </div>
            System Examinations
            <div className="ml-auto flex items-center gap-2">
              <div className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                {totalExamLength}/7500 characters
              </div>
              {Object.values(validationErrors).length > 0 && (
                <div className="flex items-center gap-1 text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  {Object.values(validationErrors).length} validation error(s)
                </div>
              )}
            </div>
          </Label>
          <p className="text-xs text-muted-foreground mt-1 pl-1">
            Document physical examination findings using quick options or
            detailed text
          </p>
        </div>

        <Accordion type="multiple" className="w-full space-y-4">
          {/* CNS & Neurological Examination */}
          <AccordionItem
            value="cns"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
              onClick={() => setActiveSection("cns")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg group-hover:from-purple-500/90 group-hover:to-purple-400/90 transition-colors">
                  <Brain className="h-5 w-5 text-purple-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    CNS & Neurological
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Consciousness, motor, sensory, and reflexes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {validationErrors.cnsExamination && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </div>
                  )}
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    {quickOptionsCount.cns} quick option
                    {quickOptionsCount.cns !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg">
                      <Brain className="h-4 w-4 text-purple-50" />
                    </div>
                    Neurological Examination
                    {validationErrors.cnsExamination && (
                      <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.cnsExamination}
                      </div>
                    )}
                  </Label>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    {prescription.cnsExamination?.length || 0}/2000 characters
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-card to-purple-50/30 dark:to-purple-950/10 rounded-xl border-2 border-purple-200 dark:border-purple-800 cyber-card">
                  {/* Quick Options */}
                  <div className="mb-4">
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Activity className="h-3.5 w-3.5 text-purple-500" />
                      Quick Selection Options
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SYSTEM_EXAM_OPTIONS.cns
                        .slice(0, 8)
                        .map((option, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant={
                              selectedQuickOptions.cns?.includes(option.label)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              onToggleQuickOption("cns", option.label)
                            }
                            className="text-xs h-7 px-3 flex items-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 hover:from-purple-100 hover:to-purple-50"
                          >
                            <span className="text-purple-500">
                              {option.icon}
                            </span>
                            <span className="truncate max-w-[120px]">
                              {option.label}
                            </span>
                            {selectedQuickOptions.cns?.includes(
                              option.label
                            ) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Detailed Findings */}
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <FileText className="h-3.5 w-3.5 text-purple-500" />
                      Detailed Findings
                    </Label>
                    <Textarea
                      value={prescription.cnsExamination || ""}
                      onChange={(e) =>
                        handleExamChange("cnsExamination", e.target.value)
                      }
                      onFocus={() => setActiveSection("cns")}
                      onBlur={(e) => {
                        const error = validateSystemExam(
                          "cnsExamination",
                          e.target.value
                        );
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            cnsExamination: error,
                          }));
                        }
                      }}
                      className={cn(
                        "text-sm min-h-[150px] bg-background border-purple-200 dark:border-purple-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all",
                        validationErrors.cnsExamination &&
                          "border-destructive focus:border-destructive focus:ring-destructive/20"
                      )}
                      placeholder="• Consciousness: Alert and oriented (GCS 15/15)
• Cranial nerves: Intact I-XII
• Motor: Normal tone and power 5/5 all limbs
• Sensory: Intact to light touch, pain, vibration, proprioception
• Reflexes: Brisk, symmetrical (2+)
• Coordination: Normal finger-nose, heel-shin
• Gait: Steady, no ataxia
• Romberg: Negative
• Higher functions: Normal memory, attention, language"
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Cardiovascular System Examination */}
          <AccordionItem
            value="cardiovascular"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors"
              onClick={() => setActiveSection("cardiovascular")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-400 rounded-lg group-hover:from-red-500/90 group-hover:to-red-400/90 transition-colors">
                  <HeartPulse className="h-5 w-5 text-red-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Cardiovascular System
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Heart sounds, pulses, and circulation
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {validationErrors.cardiovascularExamination && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </div>
                  )}
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    {quickOptionsCount.cardiovascular} quick option
                    {quickOptionsCount.cardiovascular !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-red-500 to-red-400 rounded-lg">
                      <HeartPulse className="h-4 w-4 text-red-50" />
                    </div>
                    Cardiovascular Examination
                    {validationErrors.cardiovascularExamination && (
                      <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.cardiovascularExamination}
                      </div>
                    )}
                  </Label>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
                    {prescription.cardiovascularExamination?.length || 0}/2000
                    characters
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-card to-red-50/30 dark:to-red-950/10 rounded-xl border-2 border-red-200 dark:border-red-800 cyber-card">
                  {/* Quick Options */}
                  <div className="mb-4">
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Activity className="h-3.5 w-3.5 text-red-500" />
                      Quick Selection Options
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SYSTEM_EXAM_OPTIONS.cardiovascular
                        .slice(0, 8)
                        .map((option, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant={
                              selectedQuickOptions.cardiovascular?.includes(
                                option.label
                              )
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              onToggleQuickOption(
                                "cardiovascular",
                                option.label
                              )
                            }
                            className="text-xs h-7 px-3 flex items-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-900 hover:from-red-100 hover:to-red-50"
                          >
                            <span className="text-red-500">{option.icon}</span>
                            <span className="truncate max-w-[120px]">
                              {option.label}
                            </span>
                            {selectedQuickOptions.cardiovascular?.includes(
                              option.label
                            ) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Detailed Findings */}
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <FileText className="h-3.5 w-3.5 text-red-500" />
                      Detailed Findings
                    </Label>
                    <Textarea
                      value={prescription.cardiovascularExamination || ""}
                      onChange={(e) =>
                        handleExamChange(
                          "cardiovascularExamination",
                          e.target.value
                        )
                      }
                      onFocus={() => setActiveSection("cardiovascular")}
                      onBlur={(e) => {
                        const error = validateSystemExam(
                          "cardiovascularExamination",
                          e.target.value
                        );
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            cardiovascularExamination: error,
                          }));
                        }
                      }}
                      className={cn(
                        "text-sm min-h-[150px] bg-background border-red-200 dark:border-red-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all",
                        validationErrors.cardiovascularExamination &&
                          "border-destructive focus:border-destructive focus:ring-destructive/20"
                      )}
                      placeholder="• Heart sounds: S1, S2 normal, no murmurs, rubs, or gallops
• Pulse: Regular rhythm, rate 72 bpm, all peripheral pulses palpable
• JVP: 3 cm H2O at 45 degrees
• Blood pressure: 120/80 mmHg (both arms)
• Precordium: No heaves, thrills, or scars
• No peripheral edema or cyanosis
• Capillary refill: <2 seconds
• Carotid bruits: None
• Varicose veins: None"
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Respiratory System Examination */}
          <AccordionItem
            value="respiratory"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
              onClick={() => setActiveSection("respiratory")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg group-hover:from-blue-500/90 group-hover:to-blue-400/90 transition-colors">
                  <Radiation className="h-5 w-5 text-blue-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Respiratory System
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Breathing patterns, sounds, and oxygen status
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {validationErrors.respiratoryExamination && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </div>
                  )}
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {quickOptionsCount.respiratory} quick option
                    {quickOptionsCount.respiratory !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg">
                      <Radiation className="h-4 w-4 text-blue-50" />
                    </div>
                    Respiratory Examination
                    {validationErrors.respiratoryExamination && (
                      <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.respiratoryExamination}
                      </div>
                    )}
                  </Label>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    {prescription.respiratoryExamination?.length || 0}/2000
                    characters
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-card to-blue-50/30 dark:to-blue-950/10 rounded-xl border-2 border-blue-200 dark:border-blue-800 cyber-card">
                  {/* Quick Options */}
                  <div className="mb-4">
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Activity className="h-3.5 w-3.5 text-blue-500" />
                      Quick Selection Options
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SYSTEM_EXAM_OPTIONS.respiratory
                        .slice(0, 8)
                        .map((option, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant={
                              selectedQuickOptions.respiratory?.includes(
                                option.label
                              )
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              onToggleQuickOption("respiratory", option.label)
                            }
                            className="text-xs h-7 px-3 flex items-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 hover:from-blue-100 hover:to-blue-50"
                          >
                            <span className="text-blue-500">{option.icon}</span>
                            <span className="truncate max-w-[120px]">
                              {option.label}
                            </span>
                            {selectedQuickOptions.respiratory?.includes(
                              option.label
                            ) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Detailed Findings */}
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      Detailed Findings
                    </Label>
                    <Textarea
                      value={prescription.respiratoryExamination || ""}
                      onChange={(e) =>
                        handleExamChange(
                          "respiratoryExamination",
                          e.target.value
                        )
                      }
                      onFocus={() => setActiveSection("respiratory")}
                      onBlur={(e) => {
                        const error = validateSystemExam(
                          "respiratoryExamination",
                          e.target.value
                        );
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            respiratoryExamination: error,
                          }));
                        }
                      }}
                      className={cn(
                        "text-sm min-h-[150px] bg-background border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all",
                        validationErrors.respiratoryExamination &&
                          "border-destructive focus:border-destructive focus:ring-destructive/20"
                      )}
                      placeholder="• Breathing: Normal effort, rate 16/min, symmetrical chest expansion
• Percussion: Resonant all lung fields bilaterally
• Auscultation: Vesicular breath sounds throughout, no added sounds
• No wheeze, crackles, rhonchi, or pleural rub
• Trachea: Central with no deviation
• Chest wall: No deformities, scars, or tenderness
• Oxygen saturation: 98% on room air
• Sputum: None
• Respiratory distress: None"
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Gastrointestinal System Examination */}
          <AccordionItem
            value="gastrointestinal"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger
              className="py-4 hover:no-underline group hover:bg-green-50/50 dark:hover:bg-green-950/20 transition-colors"
              onClick={() => setActiveSection("gastrointestinal")}
            >
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-400 rounded-lg group-hover:from-green-500/90 group-hover:to-green-400/90 transition-colors">
                  <Syringe className="h-5 w-5 text-green-50" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Gastrointestinal System
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Abdominal examination and digestive system
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {validationErrors.gastrointestinalExamination && (
                    <div className="flex items-center gap-1 text-xs px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </div>
                  )}
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    {quickOptionsCount.gastrointestinal} quick option
                    {quickOptionsCount.gastrointestinal !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-green-500 to-green-400 rounded-lg">
                      <Syringe className="h-4 w-4 text-green-50" />
                    </div>
                    Gastrointestinal Examination
                    {validationErrors.gastrointestinalExamination && (
                      <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                        <AlertCircle className="h-3 w-3" />
                        {validationErrors.gastrointestinalExamination}
                      </div>
                    )}
                  </Label>
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                    {prescription.gastrointestinalExamination?.length || 0}/2000
                    characters
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-card to-green-50/30 dark:to-green-950/10 rounded-xl border-2 border-green-200 dark:border-green-800 cyber-card">
                  {/* Quick Options */}
                  <div className="mb-4">
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Activity className="h-3.5 w-3.5 text-green-500" />
                      Quick Selection Options
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {SYSTEM_EXAM_OPTIONS.gastrointestinal
                        .slice(0, 8)
                        .map((option, idx) => (
                          <Button
                            key={idx}
                            type="button"
                            variant={
                              selectedQuickOptions.gastrointestinal?.includes(
                                option.label
                              )
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              onToggleQuickOption(
                                "gastrointestinal",
                                option.label
                              )
                            }
                            className="text-xs h-7 px-3 flex items-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-green-50 to-white dark:from-gray-800 dark:to-gray-900 hover:from-green-100 hover:to-green-50"
                          >
                            <span className="text-green-500">
                              {option.icon}
                            </span>
                            <span className="truncate max-w-[120px]">
                              {option.label}
                            </span>
                            {selectedQuickOptions.gastrointestinal?.includes(
                              option.label
                            ) && <CheckCircle2 className="h-3 w-3 ml-1" />}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {/* Detailed Findings */}
                  <div>
                    <Label className="text-xs font-medium flex items-center gap-1 mb-2">
                      <FileText className="h-3.5 w-3.5 text-green-500" />
                      Detailed Findings
                    </Label>
                    <Textarea
                      value={prescription.gastrointestinalExamination || ""}
                      onChange={(e) =>
                        handleExamChange(
                          "gastrointestinalExamination",
                          e.target.value
                        )
                      }
                      onFocus={() => setActiveSection("gastrointestinal")}
                      onBlur={(e) => {
                        const error = validateSystemExam(
                          "gastrointestinalExamination",
                          e.target.value
                        );
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            gastrointestinalExamination: error,
                          }));
                        }
                      }}
                      className={cn(
                        "text-sm min-h-[150px] bg-background border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all",
                        validationErrors.gastrointestinalExamination &&
                          "border-destructive focus:border-destructive focus:ring-destructive/20"
                      )}
                      placeholder="• Abdomen: Soft, non-tender, non-distended
• Bowel sounds: Normal frequency and character
• No hepatomegaly or splenomegaly
• No masses, hernias, or organomegaly
• No ascites (no shifting dullness)
• Renal angles: Non-tender
• Hernial orifices: Intact
• Digital rectal exam: Not indicated
• Stool: Normal color and consistency"
                      rows={5}
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* General Physical Exam Summary */}
        <div className="mt-6 p-4 bg-gradient-to-br from-card to-amber-50/30 dark:to-amber-950/10 rounded-xl border-2 border-amber-200 dark:border-amber-800 cyber-card">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-bold flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-amber-500 to-amber-400 rounded-lg">
                <Stethoscope className="h-4 w-4 text-amber-50" />
              </div>
              General Physical Examination Summary
              {validationErrors.physicalExam && (
                <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                  <AlertCircle className="h-3 w-3" />
                  {validationErrors.physicalExam}
                </div>
              )}
            </Label>
            <div className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              {prescription.physicalExam?.length || 0}/1500 characters
            </div>
          </div>

          <Textarea
            value={prescription.physicalExam || ""}
            onChange={(e) => handleExamChange("physicalExam", e.target.value)}
            onFocus={() => setActiveSection("physical")}
            onBlur={(e) => {
              const error = validateSystemExam("physicalExam", e.target.value);
              if (error) {
                setValidationErrors((prev) => ({
                  ...prev,
                  physicalExam: error,
                }));
              }
            }}
            className={cn(
              "text-sm min-h-[120px] bg-background border-amber-200 dark:border-amber-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all",
              validationErrors.physicalExam &&
                "border-destructive focus:border-destructive focus:ring-destructive/20"
            )}
            placeholder="Overall impression and significant findings from all system examinations:
• General appearance: Well-groomed, comfortable at rest
• Vital signs: Within normal limits
• Skin: Warm, dry, good turgor, no rashes or lesions
• Lymph nodes: No palpable lymphadenopathy
• HEENT: Normocephalic, atraumatic, conjunctivae pink, tympanic membranes normal
• Oral cavity: Moist mucous membranes, dentition normal
• Neck: Supple, full range of motion, no lymphadenopathy
• Extremities: No clubbing, cyanosis, or edema
• Back: Straight, no spinal tenderness"
            rows={4}
          />
          <div className="mt-2 text-xs text-muted-foreground">
            Summarize key findings and overall patient condition
          </div>
        </div>
      </div>
    </div>
  );
}
