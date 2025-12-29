// components/enhanced-prescription-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Save,
  User,
  Stethoscope,
  Pill,
  Sparkles,
  Calendar,
  Phone,
  AlertCircle,
  Heart,
  Thermometer,
  Activity,
  DollarSign,
  FileText,
  ClipboardCheck,
  TrendingUp,
  Shield,
  CheckCircle,
  Clock,
  FileSearch,
  Eye,
  Brain,
  X,
  FlaskConical,
  Image as ImageIcon,
  Scan,
  BrainCircuit,
  HeartPulse,
  Eye as EyeIcon,
  Ear,
  Bone,
  ChevronDown,
  ChevronUp,
  Minus,
  Square,
  Circle,
  Syringe,
  Radiation,
  Users,
} from "lucide-react";
import { Prescription, FormMedicine } from "@/types/prescription";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SmartMedicationSearch } from "@/components/SmartMedicationSearch";
import { TestSearchForm } from "@/components/TestSearchForm";
import { MultiTextInput } from "@/components/MultiTextInput";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  getFrequencyOptions,
  getDurationOptions,
  translateTiming,
} from "@/lib/medicationTimingTranslations";

interface EnhancedPrescriptionFormProps {
  prescription: Prescription;
  onSave: (prescription: Prescription) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const DOSAGE_OPTIONS = [
  { value: "250mg", label: "250 mg" },
  { value: "500mg", label: "500 mg" },
  { value: "750mg", label: "750 mg" },
  { value: "1000mg", label: "1000 mg" },
  { value: "5mg", label: "5 mg" },
  { value: "10mg", label: "10 mg" },
  { value: "20mg", label: "20 mg" },
  { value: "40mg", label: "40 mg" },
  { value: "50mcg", label: "50 mcg" },
  { value: "100mcg", label: "100 mcg" },
  { value: "5ml", label: "5 ml" },
  { value: "10ml", label: "10 ml" },
  { value: "custom", label: "Other (Custom)" },
];

// Use translated frequency options from utility
const FREQUENCY_OPTIONS = getFrequencyOptions();

// Use translated duration options from utility
const DURATION_OPTIONS = getDurationOptions();

// Physical exam categories
const PHYSICAL_EXAM_CATEGORIES = [
  { id: "general", label: "General Examination", icon: User },
  { id: "cardio", label: "Cardiovascular", icon: Heart },
  { id: "respiratory", label: "Respiratory", icon: Activity },
  { id: "neuro", label: "Neurological", icon: Brain },
  { id: "abdominal", label: "Abdominal", icon: Scan },
];

// System examination options with icons
const SYSTEM_EXAM_OPTIONS = {
  cns: [
    { label: "Consciousness: Alert and oriented", icon: "👁️" },
    { label: "Consciousness: Drowsy", icon: "😴" },
    { label: "Consciousness: Confused", icon: "🤔" },
    { label: "Memory: Intact", icon: "🧠" },
    { label: "Memory: Impaired short-term", icon: "⏳" },
    { label: "Speech: Clear and fluent", icon: "💬" },
    { label: "Speech: Slurred", icon: "🗣️" },
    { label: "Cranial nerves: Intact", icon: "👁️" },
    { label: "Cranial nerves: Deficits present", icon: "⚠️" },
    { label: "Motor: Normal tone and power", icon: "💪" },
    { label: "Motor: Weakness present", icon: "🦽" },
    { label: "Motor: Hypertonia", icon: "🦾" },
    { label: "Motor: Hypotonia", icon: "🦿" },
    { label: "Sensory: Intact to all modalities", icon: "👐" },
    { label: "Sensory: Decreased sensation", icon: "✋" },
    { label: "Sensory: Paresthesia", icon: "🪡" },
    { label: "Reflexes: Normal", icon: "🦵" },
    { label: "Reflexes: Hyperreflexia", icon: "⚡" },
    { label: "Reflexes: Hyporeflexia", icon: "🔇" },
    { label: "Reflexes: Plantar flexor", icon: "🦶" },
    { label: "Reflexes: Plantar extensor", icon: "🚩" },
    { label: "Coordination: Normal", icon: "🎯" },
    { label: "Coordination: Ataxia present", icon: "🌀" },
    { label: "Gait: Normal", icon: "🚶" },
    { label: "Gait: Abnormal", icon: "🦽" },
    { label: "No focal neurological deficits", icon: "✅" },
  ],
  cardiovascular: [
    { label: "Heart sounds: S1, S2 normal", icon: "❤️" },
    { label: "Heart sounds: S3 present", icon: "💓" },
    { label: "Heart sounds: S4 present", icon: "💗" },
    { label: "Heart sounds: Murmur present", icon: "🫀" },
    { label: "Murmur: Systolic", icon: "📈" },
    { label: "Murmur: Diastolic", icon: "📉" },
    { label: "Jugular venous pressure: Normal", icon: "🫁" },
    { label: "Jugular venous pressure: Elevated", icon: "📊" },
    { label: "Peripheral pulses: All palpable", icon: "🫳" },
    { label: "Peripheral pulses: Diminished", icon: "🫴" },
    { label: "Peripheral pulses: Absent", icon: "❌" },
    { label: "Edema: None", icon: "🦵" },
    { label: "Edema: Pedal", icon: "👣" },
    { label: "Edema: Lower limb", icon: "🦿" },
    { label: "Edema: Generalized", icon: "🌊" },
    { label: "Cyanosis: Absent", icon: "👄" },
    { label: "Cyanosis: Peripheral", icon: "👣" },
    { label: "Cyanosis: Central", icon: "👁️" },
    { label: "Capillary refill: <2 seconds", icon: "⏱️" },
    { label: "Capillary refill: Delayed", icon: "⏳" },
    { label: "Blood pressure: Normal in all limbs", icon: "🩺" },
    { label: "Blood pressure: Difference between limbs", icon: "⚖️" },
    { label: "No signs of heart failure", icon: "✅" },
  ],
  respiratory: [
    { label: "Breath sounds: Vesicular", icon: "🫁" },
    { label: "Breath sounds: Bronchial", icon: "🌳" },
    { label: "Breath sounds: Diminished", icon: "🔇" },
    { label: "Breath sounds: Absent", icon: "❌" },
    { label: "Added sounds: None", icon: "✅" },
    { label: "Added sounds: Wheeze", icon: "🎵" },
    { label: "Added sounds: Rhonchi", icon: "🌀" },
    { label: "Added sounds: Crackles", icon: "✨" },
    { label: "Added sounds: Stridor", icon: "🎼" },
    { label: "Added sounds: Pleural rub", icon: "🔄" },
    { label: "Percussion: Resonant", icon: "🥁" },
    { label: "Percussion: Dull", icon: "🔇" },
    { label: "Percussion: Hyperresonant", icon: "📯" },
    { label: "Chest expansion: Symmetrical", icon: "⚖️" },
    { label: "Chest expansion: Asymmetrical", icon: "⚡" },
    { label: "Trachea: Central", icon: "🎯" },
    { label: "Trachea: Deviated", icon: "↔️" },
    { label: "Cough: Absent", icon: "✅" },
    { label: "Cough: Productive", icon: "🫧" },
    { label: "Cough: Non-productive", icon: "💨" },
    { label: "Sputum: Clear", icon: "💧" },
    { label: "Sputum: Purulent", icon: "🟡" },
    { label: "Sputum: Blood-stained", icon: "🩸" },
    { label: "Chest pain: Absent", icon: "✅" },
    { label: "Chest pain: Pleuritic", icon: "😖" },
    { label: "No respiratory distress", icon: "😌" },
  ],
  gastrointestinal: [
    { label: "Abdomen: Soft and non-tender", icon: "🫄" },
    { label: "Abdomen: Distended", icon: "🎈" },
    { label: "Abdomen: Rigid", icon: "🛡️" },
    { label: "Abdomen: Guarding present", icon: "🛡️" },
    { label: "Tenderness: None", icon: "✅" },
    { label: "Tenderness: Epigastric", icon: "📍" },
    { label: "Tenderness: Right upper quadrant", icon: "📍" },
    { label: "Tenderness: Left upper quadrant", icon: "📍" },
    { label: "Tenderness: Right lower quadrant", icon: "📍" },
    { label: "Tenderness: Left lower quadrant", icon: "📍" },
    { label: "Tenderness: Periumbilical", icon: "📍" },
    { label: "Tenderness: Suprapubic", icon: "📍" },
    { label: "Liver: Not palpable", icon: "✅" },
    { label: "Liver: Palpable", icon: "🤚" },
    { label: "Liver: Tender", icon: "😖" },
    { label: "Spleen: Not palpable", icon: "✅" },
    { label: "Spleen: Palpable", icon: "🤚" },
    { label: "Kidneys: Not palpable", icon: "✅" },
    { label: "Bowel sounds: Normal", icon: "🔊" },
    { label: "Bowel sounds: Hyperactive", icon: "🔊🔊" },
    { label: "Bowel sounds: Hypoactive", icon: "🔈" },
    { label: "Bowel sounds: Absent", icon: "🔇" },
    { label: "Ascites: Absent", icon: "✅" },
    { label: "Ascites: Present", icon: "💧" },
    { label: "Hernias: None", icon: "✅" },
    { label: "Rectal exam: Normal", icon: "👌" },
    { label: "Rectal exam: Abnormal", icon: "⚠️" },
  ],
  other: [
    { label: "Skin: Normal", icon: "👤" },
    { label: "Skin: Pale", icon: "🏼" },
    { label: "Skin: Jaundiced", icon: "🟡" },
    { label: "Skin: Cyanosed", icon: "🔵" },
    { label: "Skin: Rash present", icon: "🔴" },
    { label: "Lymph nodes: Not palpable", icon: "✅" },
    { label: "Lymph nodes: Palpable", icon: "🤚" },
    { label: "Thyroid: Not palpable", icon: "✅" },
    { label: "Thyroid: Palpable", icon: "🤚" },
    { label: "Thyroid: Enlarged", icon: "🔄" },
    { label: "Musculoskeletal: Normal", icon: "🦴" },
    { label: "Musculoskeletal: Joint swelling", icon: "🦴🔄" },
    { label: "Musculoskeletal: Limited range of motion", icon: "🦴🔒" },
    { label: "Genitourinary: Normal", icon: "👤" },
    { label: "Genitourinary: Abnormal", icon: "⚠️" },
  ],
};

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
    setEditablePrescription(initializePrescription(prescription));
    setSelectedExams(new Set(prescription.medicalExams || []));
    setSelectedTestObjects([]);
  }, [prescription]);

  function initializePrescription(prescription: Prescription): Prescription {
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

    return {
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
      allergies: Array.isArray(prescription.allergies)
        ? prescription.allergies
        : [],
      currentMedications: Array.isArray(prescription.currentMedications)
        ? prescription.currentMedications
        : [],
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
    setEditablePrescription((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    // Update medicine name with the value (string)
    updateMedicine(index, "medicine", value);

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

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(editablePrescription.weight || "0");
    const height = parseFloat(editablePrescription.height || "0") / 100;
    if (weight > 0 && height > 0) {
      const bmi = (weight / (height * height)).toFixed(1);
      updateField("bmi", bmi);
      return bmi;
    }
    return "";
  };

  const handleSave = async () => {
    if (!editablePrescription.patientName?.trim()) {
      alert("Please enter patient name");
      return;
    }

    const hasEmptyMedicines = editablePrescription.medicines.some(
      (med) =>
        !med.medicine?.trim() ||
        !med.dosage?.trim() ||
        !med.frequency?.trim() ||
        !med.duration?.trim()
    );

    if (hasEmptyMedicines) {
      alert("Please complete all required medication fields");
      return;
    }

    await onSave(editablePrescription);
  };

  const medicinesCount = editablePrescription.medicines.length;

  // Format date for display
  const formattedDate = new Date(
    editablePrescription.createdAt
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col space-y-6 w-full max-w-full">
        {/* Header Card */}
        <Card className="border-primary/20 dark:border-primary/30 bg-gradient-to-r from-primary/5 to-card w-full">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-xl">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">
                    Prescription and Examination Form
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{formattedDate}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{editablePrescription.id?.substring(0, 8) || "NEW"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700 text-xs"
                    >
                      <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                      Active
                    </Badge>
                    {selectedExams.size > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 text-xs"
                      >
                        <FlaskConical className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                        {selectedExams.size} Tests
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <div
                    className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
                      isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
                    }`}
                  />
                  <span>{isSaving ? "Saving..." : "Ready to save"}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-1 sm:mr-2" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card - Fixed width issue here */}
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
              <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        Patient Information
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Personal Details
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label
                        htmlFor="patientName"
                        className="text-xs sm:text-sm font-medium"
                      >
                        Full Patient Name *
                      </Label>
                      <Input
                        id="patientName"
                        value={editablePrescription.patientName || ""}
                        onChange={(e) =>
                          updateField("patientName", e.target.value)
                        }
                        className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="First and Last Name"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="patientAge"
                        className="text-xs sm:text-sm font-medium"
                      >
                        Age
                      </Label>
                      <Input
                        id="patientAge"
                        value={editablePrescription.patientAge || ""}
                        onChange={(e) =>
                          updateField("patientAge", e.target.value)
                        }
                        className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="Example: 35 years"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="patientGender"
                        className="text-xs sm:text-sm font-medium"
                      >
                        Gender
                      </Label>
                      <Select
                        value={editablePrescription.patientGender || ""}
                        onValueChange={(value) =>
                          updateField("patientGender", value)
                        }
                      >
                        <SelectTrigger className="mt-1 text-xs sm:text-sm h-8 sm:h-10">
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="patientPhone"
                        className="text-xs sm:text-sm font-medium"
                      >
                        <Phone className="h-3 w-3 inline ml-1" />
                        Phone Number
                      </Label>
                      <Input
                        id="patientPhone"
                        value={editablePrescription.patientPhone || ""}
                        onChange={(e) =>
                          updateField("patientPhone", e.target.value)
                        }
                        className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="09123456789"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical History with Accordion */}
              <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                      <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        History of Cheif Complain
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Diagnosis
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="space-y-4">
                    {/* Use Accordion for collapsible sections */}
                    <Accordion type="multiple" className="w-full space-y-3">
                      {/* Allergies & Current Medications */}
                      <AccordionItem
                        value="allergies-medications"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Diagnosis and History of the Chief Complain
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <MultiTextInput
                                label="Diagnosis"
                                values={editablePrescription.allergies || []}
                                onChange={(values) =>
                                  updateField("allergies", values)
                                }
                                placeholder="e.g., Hypertension, Diabetes, Asthma"
                                description="Add any known medical diagnoses"
                                className="text-xs sm:text-sm"
                              />
                            </div>
                            <div>
                              <MultiTextInput
                                label="History of Chief Complain"
                                values={
                                  editablePrescription.currentMedications || []
                                }
                                onChange={(values) =>
                                  updateField("currentMedications", values)
                                }
                                placeholder="e.g., Persistent cough, Chest pain, Headache"
                                description="Describe the patient's main complaint or reason for the visit"
                                className="text-xs sm:text-sm"
                              />
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Past Medical History */}
                      <AccordionItem
                        value="past-medical-history"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <FileSearch className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Past Medical History
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div>
                            <Label
                              htmlFor="pastMedicalHistory"
                              className="text-xs sm:text-sm font-medium"
                            >
                              Medical History
                            </Label>
                            <Textarea
                              id="pastMedicalHistory"
                              value={
                                editablePrescription.pastMedicalHistory || ""
                              }
                              onChange={(e) =>
                                updateField(
                                  "pastMedicalHistory",
                                  e.target.value
                                )
                              }
                              className="mt-1.5 text-xs sm:text-sm"
                              placeholder="• Chronic diseases (Diabetes, Hypertension, etc.)
  • Previous surgeries
  • Hospitalizations
  • Previous episodes of similar illness
  • Immunization history"
                              rows={4}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* Family & Social History */}
                      <AccordionItem
                        value="family-social-history"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Family & Social History
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div>
                            <Label
                              htmlFor="familyHistory"
                              className="text-xs sm:text-sm font-medium"
                            >
                              Family History
                            </Label>
                            <Textarea
                              id="familyHistory"
                              value={editablePrescription.familyHistory || ""}
                              onChange={(e) =>
                                updateField("familyHistory", e.target.value)
                              }
                              className="mt-1.5 text-xs sm:text-sm"
                              placeholder="• Diabetes: Father
  • Hypertension: Mother
  • Heart disease: Grandfather
  • Cancer: No known family history"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="socialHistory"
                              className="text-xs sm:text-sm font-medium"
                            >
                              Social History
                            </Label>
                            <Textarea
                              id="socialHistory"
                              value={editablePrescription.socialHistory || ""}
                              onChange={(e) =>
                                updateField("socialHistory", e.target.value)
                              }
                              className="mt-1.5 text-xs sm:text-sm"
                              placeholder="• Smoking: Non-smoker
  • Alcohol: Occasional
  • Occupation: Office worker
  • Exercise: Regular walking"
                              rows={3}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>

              {/* Chief Complaint & Vital Signs */}
              <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        Chief Complaint & Vital Signs
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Presenting symptoms
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="chiefComplaint"
                        className="text-xs sm:text-sm font-medium"
                      >
                        Chief Complaint
                      </Label>
                      <Input
                        id="chiefComplaint"
                        value={editablePrescription.chiefComplaint || ""}
                        onChange={(e) =>
                          updateField("chiefComplaint", e.target.value)
                        }
                        className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="Patient's main complaint"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-xs sm:text-sm font-medium flex items-center gap-2">
                        <Thermometer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Vital Signs
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/30 rounded-lg">
                        <div>
                          <Label htmlFor="weight" className="text-xs">
                            Weight (kg)
                          </Label>
                          <Input
                            id="weight"
                            type="number"
                            value={editablePrescription.weight || ""}
                            onChange={(e) => {
                              updateField("weight", e.target.value);
                              if (editablePrescription.height) calculateBMI();
                            }}
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="70"
                          />
                        </div>
                        <div>
                          <Label htmlFor="height" className="text-xs">
                            Height (cm)
                          </Label>
                          <Input
                            id="height"
                            type="number"
                            value={editablePrescription.height || ""}
                            onChange={(e) => {
                              updateField("height", e.target.value);
                              if (editablePrescription.weight) calculateBMI();
                            }}
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="175"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bmi" className="text-xs">
                            BMI
                          </Label>
                          <Input
                            id="bmi"
                            value={editablePrescription.bmi || ""}
                            readOnly
                            className="mt-1 text-xs h-7 sm:h-8 bg-muted"
                            placeholder="Auto-calculated"
                          />
                        </div>
                        <div>
                          <Label htmlFor="temperature" className="text-xs">
                            <Thermometer className="h-3 w-3 inline ml-1" />
                            Temp
                          </Label>
                          <Input
                            id="temperature"
                            value={editablePrescription.temperature || ""}
                            onChange={(e) =>
                              updateField("temperature", e.target.value)
                            }
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="36.8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="pulseRate" className="text-xs">
                            <Heart className="h-3 w-3 inline ml-1 text-rose-500" />
                            PR
                          </Label>
                          <Input
                            id="pulseRate"
                            value={editablePrescription.pulseRate || ""}
                            onChange={(e) =>
                              updateField("pulseRate", e.target.value)
                            }
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="72"
                          />
                        </div>
                        <div>
                          <Label htmlFor="heartRate" className="text-xs">
                            <Heart className="h-3 w-3 inline ml-1 text-red-500" />
                            HR
                          </Label>
                          <Input
                            id="heartRate"
                            value={editablePrescription.heartRate || ""}
                            onChange={(e) =>
                              updateField("heartRate", e.target.value)
                            }
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="72"
                          />
                        </div>
                        <div>
                          <Label htmlFor="respiratoryRate" className="text-xs">
                            <Activity className="h-3 w-3 inline ml-1 text-blue-500" />
                            RR
                          </Label>
                          <Input
                            id="respiratoryRate"
                            value={editablePrescription.respiratoryRate || ""}
                            onChange={(e) =>
                              updateField("respiratoryRate", e.target.value)
                            }
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="16"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bloodPressure" className="text-xs">
                            BP
                          </Label>
                          <Input
                            id="bloodPressure"
                            value={editablePrescription.bloodPressure || ""}
                            onChange={(e) =>
                              updateField("bloodPressure", e.target.value)
                            }
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="120/80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="oxygenSaturation" className="text-xs">
                            <Activity className="h-3 w-3 inline ml-1 text-blue-500" />
                            SPO2
                          </Label>
                          <Input
                            id="oxygenSaturation"
                            value={editablePrescription.oxygenSaturation || ""}
                            onChange={(e) =>
                              updateField("oxygenSaturation", e.target.value)
                            }
                            className="mt-1 text-xs h-7 sm:h-8"
                            placeholder="98"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Comprehensive System Examinations with Accordion */}
              <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg">
                      <BrainCircuit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        System Examinations
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Physical findings
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="space-y-4">
                    {/* Use Accordion for collapsible sections */}
                    <Accordion type="multiple" className="w-full space-y-3">
                      {/* CNS & Neurological Examination */}
                      <AccordionItem
                        value="cns"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Inspection
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {SYSTEM_EXAM_OPTIONS.cns
                              .slice(0, 8)
                              .map((option, idx) => (
                                <Button
                                  key={idx}
                                  type="button"
                                  variant={
                                    selectedQuickOptions.cns.includes(
                                      option.label
                                    )
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    toggleQuickOption("cns", option.label)
                                  }
                                  className="text-xs h-6 sm:h-7 flex items-center gap-1"
                                >
                                  <span>{option.icon}</span>
                                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                    {option.label.split(":")[0]}
                                  </span>
                                </Button>
                              ))}
                          </div>
                          <Textarea
                            value={editablePrescription.cnsExamination || ""}
                            onChange={(e) =>
                              updateField("cnsExamination", e.target.value)
                            }
                            placeholder="• Consciousness: Alert and oriented
  • Cranial nerves: Intact
  • Motor: Normal tone and power 5/5 all limbs
  • Sensory: Intact to all modalities
  • Reflexes: Normal
  • Coordination: Normal
  • Gait: Steady"
                            rows={4}
                            className="text-xs sm:text-sm font-mono"
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Cardiovascular System Examination */}
                      <AccordionItem
                        value="cardiovascular"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Palpation
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {SYSTEM_EXAM_OPTIONS.cardiovascular
                              .slice(0, 8)
                              .map((option, idx) => (
                                <Button
                                  key={idx}
                                  type="button"
                                  variant={
                                    selectedQuickOptions.cardiovascular.includes(
                                      option.label
                                    )
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    toggleQuickOption(
                                      "cardiovascular",
                                      option.label
                                    )
                                  }
                                  className="text-xs h-6 sm:h-7 flex items-center gap-1"
                                >
                                  <span>{option.icon}</span>
                                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                    {option.label.split(":")[0]}
                                  </span>
                                </Button>
                              ))}
                          </div>
                          <Textarea
                            value={
                              editablePrescription.cardiovascularExamination ||
                              ""
                            }
                            onChange={(e) =>
                              updateField(
                                "cardiovascularExamination",
                                e.target.value
                              )
                            }
                            placeholder="• Heart sounds: S1, S2 normal, no murmurs
  • Pulse: Regular, rate 72 bpm, all peripheral pulses palpable
  • JVP: Not elevated
  • Blood pressure: 120/80 mmHg
  • No peripheral edema or cyanosis
  • Capillary refill: <2 seconds"
                            rows={4}
                            className="text-xs sm:text-sm font-mono"
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Respiratory System Examination */}
                      <AccordionItem
                        value="respiratory"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Radiation className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Percussion
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {SYSTEM_EXAM_OPTIONS.respiratory
                              .slice(0, 8)
                              .map((option, idx) => (
                                <Button
                                  key={idx}
                                  type="button"
                                  variant={
                                    selectedQuickOptions.respiratory.includes(
                                      option.label
                                    )
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    toggleQuickOption(
                                      "respiratory",
                                      option.label
                                    )
                                  }
                                  className="text-xs h-6 sm:h-7 flex items-center gap-1"
                                >
                                  <span>{option.icon}</span>
                                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                    {option.label.split(":")[0]}
                                  </span>
                                </Button>
                              ))}
                          </div>
                          <Textarea
                            value={
                              editablePrescription.respiratoryExamination || ""
                            }
                            onChange={(e) =>
                              updateField(
                                "respiratoryExamination",
                                e.target.value
                              )
                            }
                            placeholder="• Breathing: Normal effort, rate 16/min
  • Percussion: Resonant all lung fields
  • Breath sounds: Vesicular, clear
  • No added sounds (wheeze, crackles)
  • Chest expansion: Symmetrical
  • Trachea: Central
  • Oxygen saturation: 98%"
                            rows={4}
                            className="text-xs sm:text-sm font-mono"
                          />
                        </AccordionContent>
                      </AccordionItem>

                      {/* Gastrointestinal System Examination */}
                      <AccordionItem
                        value="gastrointestinal"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <Syringe className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Auscultation
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {SYSTEM_EXAM_OPTIONS.gastrointestinal
                              .slice(0, 8)
                              .map((option, idx) => (
                                <Button
                                  key={idx}
                                  type="button"
                                  variant={
                                    selectedQuickOptions.gastrointestinal.includes(
                                      option.label
                                    )
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    toggleQuickOption(
                                      "gastrointestinal",
                                      option.label
                                    )
                                  }
                                  className="text-xs h-6 sm:h-7 flex items-center gap-1"
                                >
                                  <span>{option.icon}</span>
                                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                    {option.label.split(":")[0]}
                                  </span>
                                </Button>
                              ))}
                          </div>
                          <Textarea
                            value={
                              editablePrescription.gastrointestinalExamination ||
                              ""
                            }
                            onChange={(e) =>
                              updateField(
                                "gastrointestinalExamination",
                                e.target.value
                              )
                            }
                            placeholder="• Abdomen: Soft, non-tender, non-distended
  • Bowel sounds: Normal
  • No organomegaly (liver, spleen not palpable)
  • No masses or hernias
  • No ascites
  • Rectal exam: Not indicated"
                            rows={4}
                            className="text-xs sm:text-sm font-mono"
                          />
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* General Physical Exam */}
                    <div>
                      <Label
                        htmlFor="physicalExam"
                        className="text-xs sm:text-sm font-medium"
                      >
                        General Physical Examination Summary
                      </Label>
                      <Textarea
                        id="physicalExam"
                        value={editablePrescription.physicalExam || ""}
                        onChange={(e) =>
                          updateField("physicalExam", e.target.value)
                        }
                        className="mt-1.5 text-xs sm:text-sm"
                        placeholder="Overall impression and significant findings"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medical Exams & Tests with Accordion */}
              <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                      <FlaskConical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        Lab Tests & Imaging
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Paraclinical requests
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="space-y-4">
                    {/* Use Accordion for collapsible sections */}
                    <Accordion type="multiple" className="w-full space-y-3">
                      {/* Laboratory Tests */}
                      <AccordionItem
                        value="laboratory-tests"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Laboratory Tests
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 space-y-3">
                          <div>
                            <TestSearchForm
                              mode="multiple"
                              selectedTests={selectedTestObjects}
                              onTestsAdd={(tests) => {
                                setSelectedTestObjects(tests);
                                const testNames = tests.map(
                                  (test) => test.name
                                );
                                updateField("medicalExams", testNames);
                                setSelectedExams(
                                  new Set(tests.map((test) => test.id))
                                );
                              }}
                              placeholder="Search for laboratory tests..."
                              showQuickAdd={true}
                              showFilters={true}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      {/* Test Notes & Instructions */}
                      <AccordionItem
                        value="test-notes"
                        className="border rounded-lg px-3 sm:px-4"
                      >
                        <AccordionTrigger className="py-3 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                            <span className="text-sm sm:text-base font-medium">
                              Test Notes & Instructions
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div>
                            <Label
                              htmlFor="examNotes"
                              className="text-xs sm:text-sm font-medium"
                            >
                              Special Instructions for Tests
                            </Label>
                            <Textarea
                              id="examNotes"
                              value={editablePrescription.examNotes || ""}
                              onChange={(e) =>
                                updateField("examNotes", e.target.value)
                              }
                              className="mt-1.5 text-xs sm:text-sm"
                              placeholder="• Fasting required for blood glucose test
  • Patient should be well hydrated
  • Report immediately if severe symptoms develop
  • Follow-up in 1 week with results"
                              rows={3}
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </div>
              </div>

              {/* Doctor & Clinic Info */}
              <div className="flex flex-col sm:flex-row border-b dark:border-border/30 hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-indigo-100 rounded-lg">
                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        Doctor & Clinic
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Prescriber details
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label
                        htmlFor="doctorName"
                        className="text-xs sm:text-sm font-medium"
                      >
                        Doctor Name
                      </Label>
                      <Input
                        id="doctorName"
                        value={editablePrescription.doctorName || ""}
                        onChange={(e) =>
                          updateField("doctorName", e.target.value)
                        }
                        className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="Enter doctor name"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="clinicName"
                        className="text-xs sm:text-sm font-medium"
                      >
                        Clinic Name
                      </Label>
                      <Input
                        id="clinicName"
                        value={editablePrescription.clinicName || ""}
                        onChange={(e) =>
                          updateField("clinicName", e.target.value)
                        }
                        className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="Enter clinic name"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="doctorFree"
                        className="text-xs sm:text-sm font-medium"
                      >
                        <DollarSign className="h-3 w-3 inline ml-1" />
                        Visit Fee
                      </Label>
                      <Input
                        id="doctorFree"
                        value={editablePrescription.doctorFree || ""}
                        onChange={(e) =>
                          updateField("doctorFree", e.target.value)
                        }
                        className="mt-1.5 text-xs sm:text-sm h-8 sm:h-10"
                        placeholder="Enter fee"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Medicines Section - Fixed responsive table */}
              <div className="flex flex-col sm:flex-row hover:bg-muted/20">
                <div className="w-full sm:w-1/4 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r dark:border-border/30 bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                      <Pill className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm sm:text-base">
                        Medications
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {medicinesCount} medication(s)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-3/4 p-3 sm:p-4">
                  <div className="space-y-4">
                    <div className="border border-border/50 dark:border-border/30 rounded-lg overflow-hidden bg-card">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-full">
                          <thead>
                            <tr className="bg-muted/70 dark:border-border/50">
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[120px] sm:w-[150px] border-r border-border/20">
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold">
                                    Medication
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                                    * Required
                                  </span>
                                </div>
                              </th>
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[80px] sm:w-[100px] border-r border-border/20">
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold">Dosage</span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                                    * Required
                                  </span>
                                </div>
                              </th>
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[90px] sm:w-[110px] border-r border-border/20">
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold">
                                    Frequency
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                                    * Required
                                  </span>
                                </div>
                              </th>
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[80px] sm:w-[100px] border-r border-border/20">
                                <div className="flex flex-col items-end">
                                  <span className="font-semibold">
                                    Duration
                                  </span>
                                  <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">
                                    * Required
                                  </span>
                                </div>
                              </th>
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[60px] sm:w-[80px] border-r border-border/20">
                                Form
                              </th>
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[80px] sm:w-[100px] border-r border-border/20">
                                Instructions
                              </th>
                              <th className="text-right p-2 sm:p-3 text-xs sm:text-sm font-medium w-[60px] sm:w-[70px]">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {editablePrescription.medicines.map(
                              (medicine, index) => (
                                <tr
                                  key={medicine.id || index}
                                  className="border-b dark:border-border/30 hover:bg-muted/30"
                                >
                                  <td className="p-2 sm:p-3">
                                    <SmartMedicationSearch
                                      value={medicine.medicine}
                                      onChange={(value, medication) => {
                                        handleMedicineInput(
                                          index,
                                          value,
                                          medication
                                        );
                                      }}
                                      context={{
                                        symptoms:
                                          editablePrescription.chiefComplaint
                                            ?.split(/[،,]/)
                                            .filter(Boolean)
                                            .map((s) => s.trim()) || [],
                                        allergies:
                                          editablePrescription.allergies || [],
                                        age:
                                          parseInt(
                                            editablePrescription.patientAge ||
                                              "0"
                                          ) || undefined,
                                        weight:
                                          parseFloat(
                                            editablePrescription.weight || "0"
                                          ) || undefined,
                                      }}
                                      placeholder="Medication name"
                                      className="w-full text-xs sm:text-sm h-7 sm:h-9"
                                    />
                                  </td>
                                  <td className="p-2 sm:p-3">
                                    <Input
                                      value={medicine.dosage}
                                      onChange={(e) =>
                                        updateMedicine(
                                          index,
                                          "dosage",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Dosage"
                                      className="text-xs h-7 sm:h-9"
                                    />
                                  </td>
                                  <td className="p-2 sm:p-3">
                                    <Input
                                      value={medicine.frequency}
                                      onChange={(e) =>
                                        updateMedicine(
                                          index,
                                          "frequency",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Frequency"
                                      className="text-xs h-7 sm:h-9"
                                    />
                                  </td>
                                  <td className="p-2 sm:p-3">
                                    <Input
                                      value={medicine.duration}
                                      onChange={(e) =>
                                        updateMedicine(
                                          index,
                                          "duration",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Duration"
                                      className="text-xs h-7 sm:h-9"
                                    />
                                  </td>
                                  <td className="p-2 sm:p-3">
                                    <Input
                                      value={medicine.form}
                                      onChange={(e) =>
                                        updateMedicine(
                                          index,
                                          "form",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Form"
                                      className="text-xs h-7 sm:h-9"
                                    />
                                  </td>
                                  <td className="p-2 sm:p-3">
                                    <Input
                                      value={medicine.instructions}
                                      onChange={(e) =>
                                        updateMedicine(
                                          index,
                                          "instructions",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Instructions"
                                      className="text-xs h-7 sm:h-9"
                                    />
                                  </td>
                                  <td className="p-2 sm:p-3">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeMedicine(index)}
                                          disabled={
                                            editablePrescription.medicines
                                              .length === 1
                                          }
                                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                                        >
                                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Delete medication
                                      </TooltipContent>
                                    </Tooltip>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={addMedicine}
                        size="sm"
                        variant="outline"
                        className="text-xs sm:text-sm h-7 sm:h-9 px-2 sm:px-4"
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Add medication
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t dark:border-border/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {isSaving ? "Saving..." : "Ready to save"}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  <span className="font-medium">
                    {medicinesCount} medication(s)
                  </span>
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-8 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isSaving ? (
                    <>
                      <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Save Prescription
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}
