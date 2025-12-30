import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertCircle,
  FileSearch,
  Users,
  Activity,
  History,
  Heart,
  Stethoscope,
} from "lucide-react";
import { MultiTextInput } from "@/components/MultiTextInput";
import { Prescription } from "@/types/prescription";

interface MedicalHistoryProps {
  prescription: Prescription;
  onUpdateField: (field: keyof Prescription, value: any) => void;
}

export function MedicalHistory({
  prescription,
  onUpdateField,
}: MedicalHistoryProps) {
  return (
    <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20 transition-colors">
      {/* Left Sidebar */}
      <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/20 dark:to-gray-900">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
            <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <div className="font-semibold text-sm sm:text-base">
              Medical History
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Clinical & Diagnostic History
            </div>
          </div>
        </div>

        {/* History Quick Stats */}
        <div className="mt-3 space-y-2">
          {/* Chief Complaint Status */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-amber-100 dark:border-amber-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Chief Complaint
            </div>
            <div className="text-sm font-medium mt-1 truncate">
              {prescription.chiefComplaint || "Not specified"}
            </div>
          </div>

          {/* Allergies Count */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-red-100 dark:border-red-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-red-500" />
              Diagnosis
            </div>
            <div className="text-sm font-medium mt-1">
              {prescription.allergies?.length || 0} recorded
            </div>
          </div>

          {/* Current Medications Count */}
          <div className="p-2 bg-white dark:bg-gray-800 rounded-md border border-blue-100 dark:border-blue-800">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Heart className="h-3 w-3 text-blue-500" />
              Current Meds
            </div>
            <div className="text-sm font-medium mt-1">
              {prescription.currentMedications?.length || 0} recorded
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
              <Activity className="h-3.5 w-3.5 text-amber-600" />
              Chief Complaint *
            </Label>
            <Input
              id="chiefComplaint"
              value={prescription.chiefComplaint || ""}
              onChange={(e) => onUpdateField("chiefComplaint", e.target.value)}
              className="text-xs sm:text-sm h-8 sm:h-10 bg-gradient-to-r from-amber-50 to-white dark:from-gray-800 dark:to-gray-900 border-amber-100 dark:border-amber-800"
              placeholder="Enter the patient's main complaint or reason for visit (e.g., persistent cough, chest pain, headache)"
              required
            />
            <p className="text-xs text-muted-foreground mt-1 pl-1">
              Primary reason for the patient's visit
            </p>
          </div>

          {/* Use Accordion for collapsible sections */}
          <Accordion type="multiple" className="w-full space-y-3">
            {/* Diagnosis and History */}
            <AccordionItem
              value="diagnosis-history"
              className="border border-amber-100 dark:border-amber-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-amber-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-900 rounded-lg group-hover:bg-amber-200 dark:group-hover:bg-amber-800 transition-colors">
                    <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Diagnosis & History of Chief Complaint
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Medical assessment and clinical findings
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <MultiTextInput
                      label={
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                          Diagnosis
                        </div>
                      }
                      values={prescription.allergies || []}
                      onChange={(values) => onUpdateField("allergies", values)}
                      placeholder="e.g., Hypertension, Diabetes, Asthma"
                      description="Add any known medical diagnoses or conditions"
                      className="text-xs sm:text-sm"
                      inputClassName="bg-gradient-to-r from-red-50 to-white dark:from-gray-800 dark:to-gray-900 border-red-100 dark:border-red-800"
                    />
                  </div>
                  <div>
                    <MultiTextInput
                      label={
                        <div className="flex items-center gap-1">
                          <History className="h-3.5 w-3.5 text-blue-500" />
                          History of Chief Complaint
                        </div>
                      }
                      values={prescription.currentMedications || []}
                      onChange={(values) =>
                        onUpdateField("currentMedications", values)
                      }
                      placeholder="e.g., Symptoms duration, Progression pattern, Associated factors"
                      description="Detailed timeline and progression of the main complaint"
                      className="text-xs sm:text-sm"
                      inputClassName="bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-blue-800"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Past Medical History */}
            <AccordionItem
              value="past-medical-history"
              className="border border-blue-100 dark:border-blue-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <FileSearch className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Past Medical History
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Previous medical conditions and treatments
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div>
                  <Label
                    htmlFor="pastMedicalHistory"
                    className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-2"
                  >
                    <FileSearch className="h-3.5 w-3.5" />
                    Medical History Details
                  </Label>
                  <Textarea
                    id="pastMedicalHistory"
                    value={prescription.pastMedicalHistory || ""}
                    onChange={(e) =>
                      onUpdateField("pastMedicalHistory", e.target.value)
                    }
                    className="mt-1.5 text-xs sm:text-sm min-h-[120px] bg-gradient-to-b from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-blue-100 dark:border-blue-800"
                    placeholder="• Chronic diseases (Diabetes, Hypertension, etc.)
• Previous surgeries
• Hospitalizations
• Previous episodes of similar illness
• Immunization history
• Medication history
• Allergies and adverse reactions"
                    rows={4}
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="text-xs text-muted-foreground pl-1">
                      Document previous medical conditions, treatments, and
                      hospitalizations
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium ml-auto">
                      {prescription.pastMedicalHistory?.length || 0} characters
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Family & Social History */}
            <AccordionItem
              value="family-social-history"
              className="border border-green-100 dark:border-green-800 rounded-lg px-3 sm:px-4 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900"
            >
              <AccordionTrigger className="py-3 hover:no-underline group">
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      Follow Up
                    </span>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Genetic and lifestyle factors
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-3">
                <div>
                  <Label
                    htmlFor="familyHistory"
                    className="text-xs sm:text-sm font-medium flex items-center gap-1 mb-2"
                  >
                    <Users className="h-3.5 w-3.5 text-green-600" />
                    Follow Up
                  </Label>
                  <Textarea
                    id="familyHistory"
                    value={prescription.familyHistory || ""}
                    onChange={(e) =>
                      onUpdateField("familyHistory", e.target.value)
                    }
                    className="mt-1.5 text-xs sm:text-sm min-h-[100px] bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900 border-green-100 dark:border-green-800"
                    placeholder="• The patient returned for a prescription follow-up visit to review treatment response, medication adherence, and any reported side effects. Current symptoms, vital signs, and clinical progress were reassessed. The existing treatment plan was evaluated and continued or adjusted as appropriate, with further recommendations provided for ongoing management and monitoring."
                    rows={3}
                  />
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="text-xs text-muted-foreground pl-1">
                      Include first-degree relatives' medical conditions
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium ml-auto">
                      {prescription.familyHistory?.length || 0} characters
                    </div>
                  </div>
                </div>
                <div></div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
