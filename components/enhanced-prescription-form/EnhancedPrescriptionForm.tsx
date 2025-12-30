// Enhanced Prescription Form - Main Component
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClipboardCheck } from "lucide-react";
import { Prescription, FormMedicine } from "@/types/prescription";

// Import all separated components
import { HeaderComponent } from "./Header";
import { PatientInformation } from "./PatientInformation";
import { MedicalHistory } from "./MedicalHistory";
import { VitalSigns } from "./VitalSigns";
import { SystemExaminations } from "./SystemExaminations";
import { MedicalTests } from "./MedicalTests";
import { DoctorInfo } from "./DoctorInfo";
import { MedicationsTable } from "./MedicationsTable";
import { Footer } from "./Footer";
import { SYSTEM_EXAM_OPTIONS } from "./constants";

interface EnhancedPrescriptionFormProps {
  prescription: Prescription;
  onSave: (prescription: Prescription) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EnhancedPrescriptionForm({
  prescription,
  onSave,
  onCancel,
  isSaving = false,
}: EnhancedPrescriptionFormProps) {
  const [editablePrescription, setEditablePrescription] =
    useState<Prescription>(() => {
      return initializePrescription(prescription);
    });

  const [selectedExams, setSelectedExams] = useState<Set<string>>(
    new Set(prescription.medicalExams || [])
  );
  const [selectedTestObjects, setSelectedTestObjects] = useState<any[]>([]);

  // State for expanded/collapsed sections
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    cnsExam: false,
    cardiovascularExam: false,
    respiratoryExam: false,
    gastrointestinalExam: false,
    otherExam: false,
  });

  // State for quick selection
  const [selectedQuickOptions, setSelectedQuickOptions] = useState<
    Record<string, string[]>
  >({
    cns: [],
    cardiovascular: [],
    respiratory: [],
    gastrointestinal: [],
    other: [],
  });

  useEffect(() => {
    console.log(
      "useEffect triggered - prescription prop changed:",
      prescription.allergies
    );
    setEditablePrescription(initializePrescription(prescription));
    setSelectedExams(new Set(prescription.medicalExams || []));
    setSelectedTestObjects([]);
  }, [prescription]);

  function initializePrescription(prescription: Prescription): Prescription {
    console.log(
      "initializePrescription called with allergies:",
      prescription.allergies
    );

    const initialPrescription = Array.isArray(prescription.medicines)
      ? prescription.medicines.map((med) => ({
          ...med,
          id: med.id || Math.random().toString(36).substr(2, 9),
          dosage: med.dosage || "",
          dosagePersian: med.dosagePersian || "",
          form: med.form || "tablet",
          formPersian: med.formPersian || "",
          route: med.route || "oral",
          timing: med.timing || "after_meal",
          withFood: med.withFood || false,
          frequency: med.frequency || "",
          frequencyPersian: med.frequencyPersian || "",
          duration: med.duration || "",
          durationPersian: med.durationPersian || "",
          instructions: med.instructions || "",
          instructionsPersian: med.instructionsPersian || "",
          notes: med.notes || "",
        }))
      : [];

    const safePrescription =
      initialPrescription.length > 0
        ? initialPrescription
        : [createEmptyMedicine()];

    const initialized = {
      ...prescription,
      patientName: prescription.patientName || "",
      medicines: safePrescription,
      patientAge: prescription.patientAge || "",
      patientGender: prescription.patientGender || "",
      patientPhone: prescription.patientPhone || "",
      pulseRate: prescription.pulseRate || "",
      heartRate: prescription.heartRate || "",
      bloodPressure: prescription.bloodPressure || "",
      temperature: prescription.temperature || "",
      respiratoryRate: prescription.respiratoryRate || "",
      oxygenSaturation: prescription.oxygenSaturation || "",
      weight: prescription.weight || "",
      height: prescription.height || "",
      bmi: prescription.bmi || "",
      allergies: prescription.allergies || "",
      currentMedications: prescription.currentMedications || "",
      pastMedicalHistory: prescription.pastMedicalHistory || "",
      familyHistory: prescription.familyHistory || "",
      socialHistory: prescription.socialHistory || "",
      physicalExam: prescription.physicalExam || "",
      medicalExams: Array.isArray(prescription.medicalExams)
        ? prescription.medicalExams
        : [],
      examNotes: prescription.examNotes || "",
      instructions:
        prescription.instructions ||
        "Adequate rest and regular medication intake",
      followUp:
        prescription.followUp || "Return if no improvement after 3 days",
      restrictions: prescription.restrictions || "",
      clinicName: prescription.clinicName || "Specialty Clinic",
      doctorFree: prescription.doctorFree || "",
      chiefComplaint: prescription.chiefComplaint || "",
      doctorName: prescription.doctorName || "Dr. Ahmad Farid",
      createdAt: prescription.createdAt || new Date(),

      // New system examination fields
      cnsExamination: prescription.cnsExamination || "",
      cardiovascularExamination: prescription.cardiovascularExamination || "",
      respiratoryExamination: prescription.respiratoryExamination || "",
      gastrointestinalExamination:
        prescription.gastrointestinalExamination || "",
      musculoskeletalExamination: prescription.musculoskeletalExamination || "",
      genitourinaryExamination: prescription.genitourinaryExamination || "",
      dermatologicalExamination: prescription.dermatologicalExamination || "",
      entExamination: prescription.entExamination || "",
      ophthalmologicalExamination:
        prescription.ophthalmologicalExamination || "",
    };

    console.log(
      "initializePrescription result - allergies:",
      initialized.allergies
    );
    return initialized;
  }

  function createEmptyMedicine(): FormMedicine {
    return {
      id: Math.random().toString(36).substr(2, 9),
      medicine: "",
      dosage: "",
      dosagePersian: "",
      form: "tablet",
      formPersian: "",
      frequency: "",
      frequencyPersian: "",
      duration: "",
      durationPersian: "",
      route: "oral",
      timing: "after_meal",
      withFood: false,
      instructions: "",
      instructionsPersian: "",
      notes: "",
      prescriptionId: "",
    };
  }

  const updateField = (field: keyof Prescription, value: any) => {
    console.log("updateField called:", {
      field,
      value,
      currentAllergies: editablePrescription.allergies,
    });
    setEditablePrescription((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      console.log("Updated prescription:", {
        field,
        newValue: value,
        allergies: updated.allergies,
      });
      return updated;
    });
  };

  const updateMedicine = (
    index: number,
    field: keyof FormMedicine,
    value: any
  ) => {
    const updatedMeds = [...editablePrescription.medicines];
    updatedMeds[index] = { ...updatedMeds[index], [field]: value };
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: updatedMeds,
    }));
  };

  const handleMedicineInput = async (
    index: number,
    value: string,
    medication?: any
  ) => {
    console.log("handleMedicineInput called with:", { value, medication });

    // CRITICAL FIX: Ensure we have a valid medication name
    let medicationName = value?.trim();

    // If the value is empty but we have medication data, extract name from it
    if (!medicationName && medication) {
      console.log("Value is empty, checking medication data:", medication);

      // Handle different medication data structures
      if (medication.medication) {
        // AI suggestion structure
        medicationName =
          medication.medication.name || medication.medication.generic_name;
      } else if (medication.name) {
        // Direct medication object
        medicationName = medication.name;
      } else if (medication.generic_name) {
        medicationName = medication.generic_name;
      }

      medicationName = medicationName?.trim();
    }

    // If still no valid name, log warning and return early
    if (!medicationName) {
      console.warn(
        "No valid medication name found. Value:",
        value,
        "Medication:",
        medication
      );
      return;
    }

    console.log("Setting medication name to:", medicationName);

    // Update medicine name with the validated value (string)
    updateMedicine(index, "medicine", medicationName);

    if (medication) {
      // Log the medication object to see its structure
      console.log("Medication object received:", medication);

      // Extract medication data based on the structure
      let medData = medication;

      // Check if it's an AI suggestion structure
      if (medication.medication) {
        medData = medication.medication;
      }

      // Auto-fill other fields based on medication data
      const strength =
        medData.strength ||
        medData.dosage ||
        (Array.isArray(medData.strengths) ? medData.strengths[0] : "") ||
        (Array.isArray(medData.dosage_forms) ? "" : "") ||
        "";

      const dosageForm =
        medData.dosage_form ||
        medData.form ||
        (Array.isArray(medData.dosage_forms) ? medData.dosage_forms[0] : "") ||
        "tablet";

      const precautions =
        (Array.isArray(medData.precautions) ? medData.precautions[0] : "") ||
        (Array.isArray(medData.contraindications)
          ? medData.contraindications[0]
          : "") ||
        "";

      const route =
        medData.route ||
        (Array.isArray(medData.route) ? medData.route[0] : "") ||
        "oral";

      if (strength) {
        updateMedicine(index, "dosage", strength);
      }

      if (dosageForm) {
        updateMedicine(index, "form", dosageForm);
      }

      if (precautions) {
        updateMedicine(index, "notes", precautions);
      }

      if (route) {
        updateMedicine(index, "route", route);
      }

      // Get category for frequency/duration suggestions
      const category =
        (Array.isArray(medData.category)
          ? medData.category[0]
          : medData.category) || "";

      if (category) {
        let suggestedFrequency = "";
        let suggestedDuration = "";

        const categoryLower = category.toLowerCase();

        if (categoryLower.includes("antibiotic")) {
          suggestedFrequency = "Every 8 hours";
          suggestedDuration = "7 days";
        } else if (
          categoryLower.includes("pain") ||
          categoryLower.includes("analgesic")
        ) {
          suggestedFrequency = "Every 6 hours as needed";
          suggestedDuration = "3 days";
        } else if (
          categoryLower.includes("blood pressure") ||
          categoryLower.includes("antihypertensive")
        ) {
          suggestedFrequency = "Once daily";
          suggestedDuration = "Ongoing";
        } else if (
          categoryLower.includes("diabetes") ||
          categoryLower.includes("antidiabetic")
        ) {
          suggestedFrequency = "With meals";
          suggestedDuration = "Ongoing";
        }

        if (suggestedFrequency) {
          updateMedicine(index, "frequency", suggestedFrequency);
        }
        if (suggestedDuration) {
          updateMedicine(index, "duration", suggestedDuration);
        }
      }
    }
  };

  const addMedicine = () => {
    const newMedicine = createEmptyMedicine();
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine],
    }));
  };

  const removeMedicine = (index: number) => {
    if (editablePrescription.medicines.length <= 1) {
      const updatedMeds = [...editablePrescription.medicines];
      updatedMeds[index] = createEmptyMedicine();
      setEditablePrescription((prev) => ({
        ...prev,
        medicines: updatedMeds,
      }));
      return;
    }

    setEditablePrescription((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Toggle quick option selection
  const toggleQuickOption = (
    system: keyof typeof SYSTEM_EXAM_OPTIONS,
    option: string
  ) => {
    setSelectedQuickOptions((prev) => {
      const current = [...prev[system]];
      const index = current.indexOf(option);

      if (index > -1) {
        // Remove if exists
        current.splice(index, 1);
      } else {
        // Add if not exists
        current.push(option);
      }

      // Update the textarea with selected options
      const textValue = current.map((opt) => `• ${opt}`).join("\n");
      updateField(`${system}Examination` as keyof Prescription, textValue);

      return {
        ...prev,
        [system]: current,
      };
    });
  };

  const handleSave = async () => {
    console.log(
      "handleSave called - allergies before save:",
      editablePrescription.allergies
    );
    console.log("Full prescription object being saved:", editablePrescription);

    if (!editablePrescription.patientName?.trim()) {
      alert("Please enter patient name");
      return;
    }

    // Check if there are any medicines at all
    if (
      !editablePrescription.medicines ||
      editablePrescription.medicines.length === 0
    ) {
      alert("Please add at least one medication to the prescription");
      return;
    }

    // Check for medicines that have some information but are incomplete
    const incompleteMedicines = editablePrescription.medicines.filter(
      (med) =>
        med.medicine?.trim() &&
        (!med.dosage?.trim() || !med.frequency?.trim() || !med.duration?.trim())
    );

    if (incompleteMedicines.length > 0) {
      const shouldProceed = confirm(
        `You have ${incompleteMedicines.length} medication(s) with missing required fields (dosage, frequency, or duration). ` +
          "Do you want to save anyway? (These can be completed later)"
      );
      if (!shouldProceed) {
        return;
      }
    }

    // Check if there are any completely empty medicines
    const emptyMedicines = editablePrescription.medicines.filter(
      (med) =>
        !med.medicine?.trim() &&
        !med.dosage?.trim() &&
        !med.frequency?.trim() &&
        !med.duration?.trim()
    );

    if (emptyMedicines.length === editablePrescription.medicines.length) {
      alert("Please add medication details before saving");
      return;
    }

    await onSave(editablePrescription);
  };

  const handleTestsChange = (tests: any[]) => {
    setSelectedTestObjects(tests);
  };

  const handleSelectedExamsChange = (exams: Set<string>) => {
    setSelectedExams(exams);
  };

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col space-y-6 w-full max-w-full">
        {/* Header */}
        <HeaderComponent
          prescription={editablePrescription}
          isSaving={isSaving}
          onSave={handleSave}
          onCancel={onCancel}
        />

        {/* Main Form Card */}
        <Card className="flex-1 border-border/50 dark:border-border/30 w-full overflow-hidden">
          <CardHeader className="bg-muted/30 border-b dark:border-border/50">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <ClipboardCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Prescription and Examination Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Complete medical examination and prescription details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 w-full">
            {/* Using flexbox instead of table for better responsiveness */}
            <div className="flex flex-col w-full">
              {/* Patient Information */}
              <PatientInformation
                prescription={editablePrescription}
                onUpdateField={updateField}
              />
              {/* Chief Complaint & Vital Signs */}
              <VitalSigns
                prescription={editablePrescription}
                onUpdateField={updateField}
              />
              {/* Medical History */}
              <MedicalHistory
                prescription={editablePrescription}
                onUpdateField={updateField}
              />
              {/* System Examinations */}
              <SystemExaminations
                prescription={editablePrescription}
                onUpdateField={updateField}
                selectedQuickOptions={selectedQuickOptions}
                onToggleQuickOption={toggleQuickOption}
              />

              {/* Medical Exams & Tests */}
              <MedicalTests
                prescription={editablePrescription}
                onUpdateField={updateField}
                selectedTestObjects={selectedTestObjects}
                onTestsChange={handleTestsChange}
                onSelectedExamsChange={handleSelectedExamsChange}
              />

              {/* Doctor & Clinic Info */}
              <DoctorInfo
                prescription={editablePrescription}
                onUpdateField={updateField}
              />

              {/* Medicines Section */}
              <MedicationsTable
                prescription={editablePrescription}
                onUpdateMedicine={updateMedicine}
                onMedicineInput={handleMedicineInput}
                onAddMedicine={addMedicine}
                onRemoveMedicine={removeMedicine}
              />
            </div>
          </CardContent>

          {/* Footer */}
          <Footer
            prescription={editablePrescription}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={onCancel}
          />
        </Card>
      </div>
    </TooltipProvider>
  );
}
