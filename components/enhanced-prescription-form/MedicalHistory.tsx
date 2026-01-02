// components/MedicalHistory.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileSearch,
  Pill,
  BriefcaseMedical,
  AlertCircle,
  CheckCircle2,
  History,
  Heart,
  Syringe,
  Activity,
  ChevronRight,
} from "lucide-react";
import { Prescription } from "@/types/prescription";
import { MultiTextInput } from "../MultiTextInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { z } from "zod";

interface MedicalHistoryProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

// Zod validation schemas
const medicalHistorySchema = z.object({
  pastMedicalHistory: z
    .string()
    .max(2000, "Medical history must be less than 2000 characters")
    .regex(/^[a-zA-Z0-9\s.,\-•*()/&'"\n]+$/, "Contains invalid characters")
    .optional(),
});

const medicationSchema = z
  .string()
  .min(3, "Medication must be at least 3 characters")
  .max(200, "Medication description too long")
  .regex(/^[a-zA-Z0-9\s.,\-()/\d]+$/, "Medication contains invalid characters");

// Type for validation errors
type ValidationErrors = Partial<Record<string, string>>;

export function MedicalHistory({
  prescription,
  onUpdateField,
}: MedicalHistoryProps) {
  const [localCurrentMeds, setLocalCurrentMeds] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const [activeSection, setActiveSection] = useState<"meds" | "history">(
    "meds"
  );
  const [hasHistory, setHasHistory] = useState(false);

  // Validate medical history text
  const validateMedicalHistory = useCallback((text: string): string => {
    try {
      medicalHistorySchema.shape.pastMedicalHistory.parse(text);
      return ""; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || "Validation error";
      }
      return "Invalid medical history";
    }
  }, []);

  // Validate medication
  const validateMedication = useCallback((text: string): string => {
    try {
      medicationSchema.parse(text);
      return ""; // No error
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues[0]?.message || "Validation error";
      }
      return "Invalid medication";
    }
  }, []);

  // Initialize from prescription data
  useEffect(() => {
    const parseTextToArray = (text: string | undefined): string[] => {
      if (!text || typeof text !== "string") return [];
      if (Array.isArray(text)) return text;

      const trimmedText = text.trim();
      if (!trimmedText) return [];

      // Handle different formats
      if (/^\d+\.\s+.+/m.test(trimmedText)) {
        return trimmedText
          .split("\n")
          .map((line) => {
            const match = line.match(/^\d+\.\s+(.+)$/);
            return match ? match[1].trim() : line.trim();
          })
          .filter((item) => item.length > 0);
      }

      if (/^[•\-*]\s+.+/m.test(trimmedText)) {
        return trimmedText
          .split("\n")
          .map((line) => line.replace(/^[•\-*]\s+/, "").trim())
          .filter((item) => item.length > 0);
      }

      if (trimmedText.includes(",")) {
        return trimmedText
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
      }

      return [trimmedText];
    };

    // Parse current medications
    const medsArray = parseTextToArray(
      prescription.currentMedications || undefined
    );
    setLocalCurrentMeds(medsArray);

    // Check if we have history
    setHasHistory(!!prescription.pastMedicalHistory?.trim());
  }, [prescription.currentMedications, prescription.pastMedicalHistory]);

  const updateCurrentMedications = (medications: string[]) => {
    // Validate all medications
    const validationResults = medications.map((med) => ({
      med,
      error: validateMedication(med),
    }));

    const hasErrors = validationResults.some((result) => result.error);

    if (hasErrors) {
      const errors: ValidationErrors = {};
      validationResults.forEach((result, index) => {
        if (result.error) {
          errors[`med-${index}`] = result.error;
        }
      });
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setLocalCurrentMeds(medications);
    onUpdateField("currentMedications", medications.join(", "));

    // Clear medication errors
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("med-")) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const handleHistoryChange = useCallback(
    (value: string) => {
      const error = validateMedicalHistory(value);
      if (error) {
        setValidationErrors((prev) => ({ ...prev, pastMedicalHistory: error }));
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.pastMedicalHistory;
          return newErrors;
        });
      }

      onUpdateField("pastMedicalHistory", value);
      setHasHistory(!!value.trim());
    },
    [onUpdateField, validateMedicalHistory]
  );

  const historyLength = prescription.pastMedicalHistory?.length || 0;

  return (
    <div
      id="medical-history"
      className="group flex flex-col sm:flex-row border-2 border-border/50 dark:border-border rounded-xl overflow-hidden hover:border-border transition-all duration-300 bg-gradient-to-br from-background to-card/30 dark:from-background dark:to-card/10 shadow-sm hover:shadow-md medical-card"
    >
      {/* Left Sidebar */}
      <div
        className={cn(
          "w-full sm:w-1/4 p-4 sm:p-5 border-b sm:border-b-0 sm:border-r border-border/30 transition-all duration-300",
          "bg-gradient-to-b from-sidebar/80 to-background",
          activeSection === "meds" && "bg-sidebar/90",
          activeSection === "history" && "bg-sidebar/90"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary to-cyber-accent rounded-xl shadow-sm">
              <BriefcaseMedical className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-sm sm:text-base tracking-tight text-foreground">
                Medical History
              </div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">
                Patient's Clinical Background
              </div>
            </div>
          </div>

          {/* History Quick Stats */}
          <div className="mb-6">
            <div className="space-y-3">
              {/* Current Meds Summary */}
              <div className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <Pill className="h-3.5 w-3.5 text-accent" />
                    Current Medications
                  </div>
                  {localCurrentMeds.length > 0 ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-accent/20 dark:bg-accent/30 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-accent dark:text-accent-foreground" />
                      <span className="text-xs font-medium text-accent-foreground">
                        {localCurrentMeds.length}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                      <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        None
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {localCurrentMeds.length > 0
                    ? `${localCurrentMeds.length} medication(s) recorded`
                    : "No current medications"}
                </div>
                {localCurrentMeds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {localCurrentMeds.slice(0, 3).map((med, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs h-5 px-1.5 bg-accent/10 text-accent-foreground truncate max-w-full"
                        title={med}
                      >
                        {med.split(" ")[0]}
                        {med.split(" ").length > 1 ? "..." : ""}
                      </Badge>
                    ))}
                    {localCurrentMeds.length > 3 && (
                      <Badge variant="outline" className="text-xs h-5 px-1.5">
                        +{localCurrentMeds.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Medical History Summary */}
              <div className="p-3 bg-card/50 dark:bg-card/30 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                    <History className="h-3.5 w-3.5 text-cyber-secondary" />
                    Past Medical History
                  </div>
                  {hasHistory ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 dark:bg-primary/20 rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-primary" />
                      <span className="text-xs font-medium text-primary">
                        Recorded
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                      <AlertCircle className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Not recorded
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {hasHistory
                    ? `${historyLength} characters recorded`
                    : "No medical history"}
                </div>
              </div>
            </div>
          </div>

          {/* Medical History Categories */}
          <div className="mt-3">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Common History Categories
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Heart className="h-3 w-3 text-red-400" />
                <span>Cardiovascular (HTN, CAD, CHF)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3 w-3 text-green-400" />
                <span>Endocrine (Diabetes, Thyroid)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Syringe className="h-3 w-3 text-blue-400" />
                <span>Immunizations & Allergies</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "w-full sm:w-3/4 p-4 sm:p-5 transition-all duration-300",
          activeSection === "meds" &&
            "bg-gradient-to-br from-accent/5 to-background",
          activeSection === "history" &&
            "bg-gradient-to-br from-primary/5 to-background"
        )}
      >
        <Accordion type="multiple" className="w-full space-y-4">
          {/* Current Medications Section */}
          <AccordionItem
            value="current-medications"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger className="py-4 hover:no-underline group hover:bg-accent/5 transition-colors">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-accent to-cyber-accent rounded-lg group-hover:from-accent/90 group-hover:to-cyber-accent/90 transition-colors">
                  <Pill className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Current Medications
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {localCurrentMeds.length > 0
                      ? `${localCurrentMeds.length} active medication(s) recorded`
                      : "Active prescriptions and OTC medications"}
                  </div>
                </div>
                {localCurrentMeds.length > 0 && (
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-accent/10 text-accent-foreground">
                    {localCurrentMeds.length} medication
                    {localCurrentMeds.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-accent to-cyber-accent rounded-lg">
                    <Pill className="h-4 w-4 text-accent-foreground" />
                  </div>
                  Active Medications
                  {validationErrors["meds"] && (
                    <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors["meds"]}
                    </div>
                  )}
                </Label>

                <div className="p-4 bg-gradient-to-br from-card to-accent/5 rounded-xl border-2 border-accent/20 cyber-card">
                  <MultiTextInput
                    label={
                      <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Pill className="h-3.5 w-3.5 text-accent" />
                        Current Medications
                      </span>
                    }
                    values={localCurrentMeds}
                    onChange={(medications) => {
                      // Validate each medication before updating
                      const validationResults = medications.map((med) => ({
                        med,
                        error: validateMedication(med),
                      }));

                      const hasErrors = validationResults.some(
                        (result) => result.error
                      );

                      if (hasErrors) {
                        const errors: ValidationErrors = {};
                        validationResults.forEach((result, index) => {
                          if (result.error) {
                            errors[`med-${index}`] = result.error;
                          }
                        });
                        setValidationErrors((prev) => ({ ...prev, ...errors }));
                        return;
                      }

                      // Clear previous errors and update
                      setValidationErrors((prev) => {
                        const newErrors = { ...prev };
                        Object.keys(newErrors).forEach((key) => {
                          if (key.startsWith("med-")) {
                            delete newErrors[key];
                          }
                        });
                        return newErrors;
                      });

                      setLocalCurrentMeds(medications);
                      onUpdateField(
                        "currentMedications",
                        medications.join(", ")
                      );
                    }}
                    placeholder="Enter medication with dosage and frequency (e.g., Lisinopril 10mg daily)"
                    tagColor="green"
                    description="Include dosage, frequency, and route. Press Enter or click Add to save."
                    inputClassName="text-sm h-10 bg-background border-accent/30 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                  />

                  <div className="mt-3 text-xs text-muted-foreground space-y-2">
                    <p className="font-medium">Best Practices:</p>
                    <ul className="space-y-1">
                      <li className="flex items-start gap-1">
                        <span className="text-accent">•</span>
                        <span>
                          Include generic name, strength, frequency, and route
                        </span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-accent">•</span>
                        <span>
                          Document as "MedicationName Strength Frequency Route"
                        </span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-accent">•</span>
                        <span>
                          Include OTC medications, supplements, and herbals
                        </span>
                      </li>
                      <li className="flex items-start gap-1">
                        <span className="text-accent">•</span>
                        <span>
                          Note adherence issues or side effects if known
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {localCurrentMeds.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      Medication Summary
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {localCurrentMeds.map((med, index) => {
                        const categories = {
                          cardiovascular: [
                            "lisinopril",
                            "atenolol",
                            "metoprolol",
                            "amlodipine",
                            "simvastatin",
                          ],
                          diabetes: [
                            "metformin",
                            "glipizide",
                            "insulin",
                            "glimepiride",
                          ],
                          pain: [
                            "ibuprofen",
                            "naproxen",
                            "acetaminophen",
                            "tramadol",
                          ],
                          psychiatric: [
                            "sertraline",
                            "fluoxetine",
                            "diazepam",
                            "lorazepam",
                          ],
                        };

                        const getCategory = (medication: string) => {
                          const lowerMed = medication.toLowerCase();
                          for (const [category, meds] of Object.entries(
                            categories
                          )) {
                            if (meds.some((m) => lowerMed.includes(m))) {
                              return category;
                            }
                          }
                          return "other";
                        };

                        const category = getCategory(med);
                        const categoryColors = {
                          cardiovascular:
                            "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
                          diabetes:
                            "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
                          pain: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
                          psychiatric:
                            "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200",
                          other:
                            "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200",
                        };

                        return (
                          <div
                            key={index}
                            className="p-2 bg-card/50 rounded-lg border border-border/30 flex items-center justify-between"
                          >
                            <div>
                              <div className="text-sm font-medium text-foreground">
                                {med}
                              </div>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs mt-1",
                                  categoryColors[
                                    category as keyof typeof categoryColors
                                  ]
                                )}
                              >
                                {category}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => {
                                const newMeds = [...localCurrentMeds];
                                newMeds.splice(index, 1);
                                updateCurrentMedications(newMeds);
                              }}
                            >
                              ×
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Past Medical History */}
          <AccordionItem
            value="past-medical-history"
            className="border-2 border-border/30 rounded-lg px-4 bg-gradient-to-b from-card/50 to-background/50 medical-card"
          >
            <AccordionTrigger className="py-4 hover:no-underline group hover:bg-primary/5 transition-colors">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-br from-primary to-cyber-secondary rounded-lg group-hover:from-primary/90 group-hover:to-cyber-secondary/90 transition-colors">
                  <History className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="text-left flex-1">
                  <span className="text-base font-bold text-foreground">
                    Past Medical History
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {hasHistory
                      ? `${historyLength} characters of historical data`
                      : "Previous medical conditions and treatments"}
                  </div>
                </div>
                {hasHistory && (
                  <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                    {Math.ceil(historyLength / 100)} min read
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                <Label className="text-sm font-bold flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-primary to-cyber-secondary rounded-lg">
                    <FileSearch className="h-4 w-4 text-primary-foreground" />
                  </div>
                  Medical History Details
                  {validationErrors.pastMedicalHistory && (
                    <div className="ml-2 flex items-center gap-1 text-xs font-normal px-2 py-1 bg-destructive/10 text-destructive rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      {validationErrors.pastMedicalHistory}
                    </div>
                  )}
                </Label>

                <div className="p-4 bg-gradient-to-br from-card to-primary/5 rounded-xl border-2 border-primary/20 cyber-card">
                  <div className="space-y-3">
                    <Textarea
                      id="pastMedicalHistory"
                      value={prescription.pastMedicalHistory || ""}
                      onChange={(e) => handleHistoryChange(e.target.value)}
                      onFocus={() => setActiveSection("history")}
                      onBlur={(e) => {
                        const error = validateMedicalHistory(e.target.value);
                        if (error) {
                          setValidationErrors((prev) => ({
                            ...prev,
                            pastMedicalHistory: error,
                          }));
                        }
                      }}
                      className={cn(
                        "text-sm min-h-[200px] bg-background border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all",
                        validationErrors.pastMedicalHistory &&
                          "border-destructive focus:border-destructive focus:ring-destructive/20"
                      )}
                      placeholder="• Chronic conditions (e.g., Hypertension since 2010, Diabetes Type II diagnosed 2015)
• Previous surgeries with dates (e.g., Appendectomy - 2008, Knee replacement - 2020)
• Hospitalizations with reasons and dates
• Major illnesses and treatments (e.g., Pneumonia treated 2019, MI in 2015 with stent)
• Previous episodes of similar illness
• Immunization history (e.g., COVID-19 vaccinated 2021, annual flu vaccine)
• Medical device implants (e.g., Pacemaker implanted 2018, Total hip replacement 2021)
• Transfusions if any
• Pregnancy and obstetric history (if applicable)"
                      rows={8}
                    />

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Document previous medical conditions, treatments, and
                        hospitalizations chronologically
                      </div>
                      <div
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          historyLength > 1800
                            ? "bg-destructive/10 text-destructive"
                            : historyLength > 1500
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200"
                            : "bg-primary/10 text-primary dark:bg-primary/20"
                        )}
                      >
                        {historyLength}/2000 characters
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical History Template */}
                <div className="text-xs text-muted-foreground">
                  <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-card/50 to-background/50 rounded-xl border border-border/30">
                    <div className="p-1.5 bg-gradient-to-br from-primary to-cyber-secondary rounded-lg">
                      <FileSearch className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground mb-1">
                        Structured Documentation Template:
                      </p>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-primary">
                            Chronic Conditions:
                          </span>
                          <div className="ml-2 text-muted-foreground">
                            List with diagnosis year, current status, and
                            treatment
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-primary">
                            Surgical History:
                          </span>
                          <div className="ml-2 text-muted-foreground">
                            Include procedure, year, surgeon, and complications
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-primary">
                            Hospitalizations:
                          </span>
                          <div className="ml-2 text-muted-foreground">
                            Dates, reasons, and outcomes
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-primary">
                            Family History:
                          </span>
                          <div className="ml-2 text-muted-foreground">
                            Medical conditions in immediate family members
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-primary">
                            Social History:
                          </span>
                          <div className="ml-2 text-muted-foreground">
                            Smoking, alcohol, occupation, living situation
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
