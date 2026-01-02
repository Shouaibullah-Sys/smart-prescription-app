// components/Diagnosis.tsx
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AlertCircle, Activity, Stethoscope, Zap } from "lucide-react";
import { Prescription } from "@/types/prescription";
import { MultiTextInput } from "../MultiTextInput";

interface DiagnosisProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function Diagnosis({ prescription, onUpdateField }: DiagnosisProps) {
  const [localDiagnoses, setLocalDiagnoses] = useState<string[]>([]);

  // Initialize from prescription data
  useEffect(() => {
    console.log("Diagnosis useEffect - prescription:", {
      diagnoses: prescription.allergies,
    });

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

    // Parse diagnoses - you might need to add a 'diagnoses' field to your Prescription type
    const diagnosesArray = parseTextToArray(
      prescription.allergies || undefined
    );
    setLocalDiagnoses(diagnosesArray);
  }, [prescription.allergies]);

  const updateDiagnoses = (diagnoses: string[]) => {
    setLocalDiagnoses(diagnoses);
    onUpdateField("allergies", diagnoses.join(", "));
  };

  // Quick diagnosis templates
  const quickDiagnosisTemplates = [
    {
      category: "Respiratory",
      diagnoses: [
        "Acute Bronchitis",
        "Community-Acquired Pneumonia",
        "Asthma Exacerbation",
        "Acute Upper Respiratory Infection",
        "Chronic Obstructive Pulmonary Disease (COPD)",
      ],
    },
    {
      category: "Cardiovascular",
      diagnoses: [
        "Essential Hypertension",
        "Coronary Artery Disease",
        "Heart Failure",
        "Atrial Fibrillation",
        "Hyperlipidemia",
      ],
    },
    {
      category: "Endocrine/Metabolic",
      diagnoses: [
        "Type 2 Diabetes Mellitus",
        "Hypothyroidism",
        "Hyperthyroidism",
        "Metabolic Syndrome",
        "Obesity",
      ],
    },
    {
      category: "Gastrointestinal",
      diagnoses: [
        "Gastroesophageal Reflux Disease (GERD)",
        "Irritable Bowel Syndrome",
        "Peptic Ulcer Disease",
        "Acute Gastroenteritis",
        "Chronic Constipation",
      ],
    },
    {
      category: "Musculoskeletal",
      diagnoses: [
        "Osteoarthritis",
        "Low Back Pain",
        "Rheumatoid Arthritis",
        "Osteoporosis",
        "Cervical Spondylosis",
      ],
    },
    {
      category: "Infectious Diseases",
      diagnoses: [
        "Urinary Tract Infection",
        "Influenza",
        "COVID-19",
        "Cellulitis",
        "Upper Respiratory Tract Infection",
      ],
    },
    {
      category: "Neurological",
      diagnoses: [
        "Migraine",
        "Tension-Type Headache",
        "Peripheral Neuropathy",
        "Carpal Tunnel Syndrome",
        "Vertigo",
      ],
    },
    {
      category: "Dermatological",
      diagnoses: [
        "Atopic Dermatitis",
        "Psoriasis",
        "Acne Vulgaris",
        "Contact Dermatitis",
        "Urticaria",
      ],
    },
  ];

  const addDiagnosisTemplate = (diagnosis: string) => {
    const newDiagnoses = [...localDiagnoses, diagnosis];
    setLocalDiagnoses(newDiagnoses);
    onUpdateField("allergies", newDiagnoses.join(", "));
  };

  return (
    <div
      id="diagnosis"
      className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors"
    >
      {/* Left Sidebar */}
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">Diagnosis</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Medical Assessment & Findings
            </div>
          </div>
        </div>

        {/* Diagnosis Quick Stats */}
        <div className="mt-3 space-y-2">
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-purple-100 dark:border-purple-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Activity className="h-3 w-3 text-purple-500" />
              Chief Complaint
            </div>
            <div className="text-sm font-medium mt-1 truncate">
              {prescription.chiefComplaint || "Not specified"}
            </div>
          </div>

          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-red-100 dark:border-red-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              Diagnoses
            </div>
            <div className="text-sm font-medium mt-1">
              {localDiagnoses.length > 0
                ? `${localDiagnoses.length} diagnosis(es)`
                : "None specified"}
            </div>
          </div>

          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              Quick Templates
            </div>
            <div className="text-sm font-medium mt-1">
              {quickDiagnosisTemplates.length} categories
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full sm:w-3/4 p-3 sm:p-4">
        <div className="space-y-4">
          {/* Chief Complaint Section */}
          <div className="mb-4">
            <Label
              htmlFor="chiefComplaint"
              className="text-xs sm:text-sm font-medium flex items-center gap-2 mb-2"
            >
              <Activity className="h-3.5 w-3.5 text-purple-600" />
              Chief Complaint *
            </Label>
            <Input
              id="chiefComplaint"
              value={prescription.chiefComplaint || ""}
              onChange={(e) => onUpdateField("chiefComplaint", e.target.value)}
              className="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-purple-50 to-white dark:from-gray-800 dark:to-gray-900 border-purple-100 dark:border-purple-800"
              placeholder="Enter the patient's main complaint or reason for visit (e.g., persistent cough, chest pain, headache)"
              required
            />
            <p className="text-xs text-muted-foreground mt-1 pl-1">
              Primary reason for the patient's visit
            </p>
          </div>
          {/* Diagnosis Section */}
          <Accordion type="multiple" className="w-full space-y-3">
            <AccordionItem
              value="diagnosis"
              className="border border-red-100 dark:border-red-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-red-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Diagnosis
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Medical assessment and findings
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-6">
                {/* Diagnosis Section using MultiTextInput */}
                <MultiTextInput
                  label={
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      Diagnosis *
                    </span>
                  }
                  values={localDiagnoses}
                  onChange={updateDiagnoses}
                  placeholder="e.g., Type 2 Diabetes Mellitus, Essential Hypertension, Acute Bronchitis"
                  tagColor="red"
                  description="Type a diagnosis and press Enter or click Add. For multiple diagnoses, add them separately."
                  inputClassName="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-900 border-red-100 dark:border-red-800"
                />

                {/* Quick Diagnosis Templates */}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
