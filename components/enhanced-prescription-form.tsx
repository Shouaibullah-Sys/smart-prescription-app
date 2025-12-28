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
    updateMedicine(index, "medicine", value);

    if (medication) {
      // Auto-fill other fields based on medication data
      // Handle different medication data structures consistently

      // Extract strength/dosage - handle both AI and local database formats
      const strength =
        medication.strength ||
        medication.dosage ||
        medication.medication?.strengths?.[0] ||
        medication.strengths?.[0] ||
        "";

      // Extract dosage form - handle both AI and local database formats
      const dosageForm =
        medication.dosage_form ||
        medication.form ||
        medication.medication?.dosage_forms?.[0] ||
        medication.dosage_forms?.[0] ||
        "";

      // Extract precautions - handle both AI and local database formats
      const precautions =
        medication.precautions?.[0] ||
        medication.medication?.precautions?.[0] ||
        medication.contraindications?.[0] ||
        "";

      // Extract route - handle both AI and local database formats
      const route =
        medication.route ||
        medication.medication?.route?.[0] ||
        medication.route?.[0] ||
        "oral";

      // Update fields with proper fallbacks
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

      // Auto-suggest frequency based on medication type if available
      const category = medication.category?.[0] || medication.category;
      if (category) {
        let suggestedFrequency = "";

        // Common medication patterns
        if (category.toLowerCase().includes("antibiotic")) {
          suggestedFrequency = "Every 8 hours";
        } else if (
          category.toLowerCase().includes("pain") ||
          category.toLowerCase().includes("analgesic")
        ) {
          suggestedFrequency = "Every 6 hours as needed";
        } else if (
          category.toLowerCase().includes("blood pressure") ||
          category.toLowerCase().includes("antihypertensive")
        ) {
          suggestedFrequency = "Once daily";
        } else if (
          category.toLowerCase().includes("diabetes") ||
          category.toLowerCase().includes("antidiabetic")
        ) {
          suggestedFrequency = "With meals";
        }

        if (suggestedFrequency) {
          updateMedicine(index, "frequency", suggestedFrequency);
        }
      }

      // Auto-suggest duration based on medication type
      if (category) {
        let suggestedDuration = "";

        if (category.toLowerCase().includes("antibiotic")) {
          suggestedDuration = "7 days";
        } else if (
          category.toLowerCase().includes("pain") ||
          category.toLowerCase().includes("analgesic")
        ) {
          suggestedDuration = "3 days";
        } else if (
          category.toLowerCase().includes("blood pressure") ||
          category.toLowerCase().includes("antihypertensive")
        ) {
          suggestedDuration = "Ongoing";
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
      <div className="h-full flex flex-col space-y-6">
        {/* Header Card */}
        <Card className="border-primary/20 dark:border-primary/30 bg-gradient-to-r from-primary/5 to-card">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Prescription and Examination Form
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formattedDate}</span>
                    </div>
                    <Badge variant="outline" className="bg-primary/5">
                      #{editablePrescription.id?.substring(0, 8) || "NEW"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-green-50 text-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                    {selectedExams.size > 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        <FlaskConical className="h-3 w-3 mr-1" />
                        {selectedExams.size} Tests
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className={`h-3 w-3 rounded-full ${
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
                    className="min-w-[100px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isSaving ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                        Saving
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Prescription
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Prescription Table */}
        <Card className="flex-1 border-border/50 dark:border-border/30">
          <CardHeader className="bg-muted/30 border-b dark:border-border/50">
            <CardTitle className="flex items-center gap-3">
              <ClipboardCheck className="h-6 w-6 text-primary" />
              Complete Prescription and Examination Information
            </CardTitle>
            <CardDescription>
              All required information for prescription writing and test
              requests
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-right p-4 font-medium text-sm w-1/4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Information Section
                      </div>
                    </th>
                    <th className="text-right p-4 font-medium text-sm w-3/4">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Values and Settings
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Section: Patient Information */}
                  <tr className="border-b dark:border-border/30 hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">Patient Information</div>
                          <div className="text-xs text-muted-foreground">
                            Personal Details
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="patientName"
                            className="text-sm font-medium"
                          >
                            Full Patient Name *
                          </Label>
                          <Input
                            id="patientName"
                            value={editablePrescription.patientName || ""}
                            onChange={(e) =>
                              updateField("patientName", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="First and Last Name"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="patientAge"
                            className="text-sm font-medium"
                          >
                            Age
                          </Label>
                          <Input
                            id="patientAge"
                            value={editablePrescription.patientAge || ""}
                            onChange={(e) =>
                              updateField("patientAge", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Example: 35 years"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="patientGender"
                            className="text-sm font-medium"
                          >
                            Gender
                          </Label>
                          <Select
                            value={editablePrescription.patientGender || ""}
                            onValueChange={(value) =>
                              updateField("patientGender", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-gray-900 text-popover-foreground dark:text-white border dark:border-gray-700">
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="patientPhone"
                            className="text-sm font-medium"
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
                            className="mt-1.5"
                            placeholder="09123456789"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Section: Medical History */}
                  <tr className="border-b dark:border-border/30 hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-medium">Medical History</div>
                          <div className="text-xs text-muted-foreground">
                            History and Allergies
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <MultiTextInput
                              label="Drug and Food Allergies"
                              values={editablePrescription.allergies || []}
                              onChange={(values) =>
                                updateField("allergies", values)
                              }
                              placeholder="e.g., Penicillin, Aspirin, Peanuts"
                              description="Add any known drug or food allergies"
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <MultiTextInput
                              label="Current Medications"
                              values={
                                editablePrescription.currentMedications || []
                              }
                              onChange={(values) =>
                                updateField("currentMedications", values)
                              }
                              placeholder="e.g., Metformin 500mg, Lisinopril 10mg"
                              description="Add medications the patient is currently taking"
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="pastMedicalHistory"
                              className="text-sm font-medium"
                            >
                              Important Medical History
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
                              className="mt-1.5"
                              placeholder="Chronic diseases, surgeries, hospitalizations"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="familyHistory"
                              className="text-sm font-medium"
                            >
                              Family History
                            </Label>
                            <Textarea
                              id="familyHistory"
                              value={editablePrescription.familyHistory || ""}
                              onChange={(e) =>
                                updateField("familyHistory", e.target.value)
                              }
                              className="mt-1.5"
                              placeholder="Hereditary diseases in family"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Section: Physical Examination */}
                  <tr className="border-b dark:border-border/30 hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Stethoscope className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Physical Examination
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Vital Signs and Findings
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label
                              htmlFor="chiefComplaint"
                              className="text-sm font-medium"
                            >
                              Chief Complaint
                            </Label>
                            <Input
                              id="chiefComplaint"
                              value={editablePrescription.chiefComplaint || ""}
                              onChange={(e) =>
                                updateField("chiefComplaint", e.target.value)
                              }
                              className="mt-1.5"
                              placeholder="Patient's main complaint"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Vital Signs and Anthropometry
                          </Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/30 rounded-lg">
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
                                }}
                                className="mt-1 text-sm"
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
                                }}
                                className="mt-1 text-sm"
                                placeholder="175"
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
                                className="mt-1 text-sm"
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
                                className="mt-1 text-sm"
                                placeholder="72"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="respiratoryRate"
                                className="text-xs"
                              >
                                <Activity className="h-3 w-3 inline ml-1 text-blue-500" />
                                RP
                              </Label>
                              <Input
                                id="respiratoryRate"
                                value={
                                  editablePrescription.respiratoryRate || ""
                                }
                                onChange={(e) =>
                                  updateField("respiratoryRate", e.target.value)
                                }
                                className="mt-1 text-sm"
                                placeholder="16"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="bloodPressure"
                                className="text-xs"
                              >
                                BP
                              </Label>
                              <Input
                                id="bloodPressure"
                                value={editablePrescription.bloodPressure || ""}
                                onChange={(e) =>
                                  updateField("bloodPressure", e.target.value)
                                }
                                className="mt-1 text-sm"
                                placeholder="120/80"
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor="oxygenSaturation"
                                className="text-xs"
                              >
                                <Activity className="h-3 w-3 inline ml-1 text-green-500" />
                                SpO2
                              </Label>
                              <Input
                                id="oxygenSaturation"
                                value={
                                  editablePrescription.oxygenSaturation || ""
                                }
                                onChange={(e) =>
                                  updateField(
                                    "oxygenSaturation",
                                    e.target.value
                                  )
                                }
                                className="mt-1 text-sm"
                                placeholder="98"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="physicalExam"
                            className="text-sm font-medium"
                          >
                            Physical Examination Findings
                          </Label>
                          <Textarea
                            id="physicalExam"
                            value={editablePrescription.physicalExam || ""}
                            onChange={(e) =>
                              updateField("physicalExam", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Important findings from physical examination"
                            rows={3}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Section: Medical Exams & Tests */}
                  <tr className="border-b dark:border-border/30 hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FlaskConical className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Laboratory Tests and Imaging
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Paraclinical Requests
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium mb-3">
                            Search and Add Tests
                          </Label>
                          <div className="space-y-4">
                            <TestSearchForm
                              mode="multiple"
                              selectedTests={selectedTestObjects}
                              onTestsAdd={(tests) => {
                                setSelectedTestObjects(tests);
                                // Update both the medicalExams array and selectedExams set
                                const testNames = tests.map(
                                  (test) => test.name
                                );
                                updateField("medicalExams", testNames);
                                const newSelectedExams = new Set(
                                  tests.map((test) => test.id)
                                );
                                setSelectedExams(newSelectedExams);
                              }}
                              placeholder="Search for laboratory tests, imaging, or procedures..."
                              showQuickAdd={true}
                              showFilters={true}
                            />

                            {/* Test Summary */}
                            {selectedTestObjects.length > 0 && (
                              <div className="pt-2 border-t">
                                <Label className="text-xs text-muted-foreground mb-2 block">
                                  Test Summary:
                                </Label>
                                <div className="flex justify-between items-center">
                                  <Badge variant="secondary">
                                    {selectedTestObjects.length} test(s)
                                    selected
                                  </Badge>
                                  <Button
                                    onClick={() => {
                                      updateField("medicalExams", []);
                                      setSelectedExams(new Set());
                                      setSelectedTestObjects([]);
                                    }}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    Clear All
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label
                            htmlFor="examNotes"
                            className="text-sm font-medium"
                          >
                            Test Notes
                          </Label>
                          <Textarea
                            id="examNotes"
                            value={editablePrescription.examNotes || ""}
                            onChange={(e) =>
                              updateField("examNotes", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Specific instructions for tests"
                            rows={3}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Section: Doctor & Clinic Info */}
                  <tr className="border-b dark:border-border/30 hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <TrendingUp className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Doctor and Center Information
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Prescriber Details
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label
                            htmlFor="doctorName"
                            className="text-sm font-medium"
                          >
                            Treating Physician Name
                          </Label>
                          <Input
                            id="doctorName"
                            value={editablePrescription.doctorName || ""}
                            onChange={(e) =>
                              updateField("doctorName", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Enter doctor name"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="clinicName"
                            className="text-sm font-medium"
                          >
                            Medical Center Name
                          </Label>
                          <Input
                            id="clinicName"
                            value={editablePrescription.clinicName || ""}
                            onChange={(e) =>
                              updateField("clinicName", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Enter medical center name"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="doctorFree"
                            className="text-sm font-medium"
                          >
                            <DollarSign className="h-4 w-4 inline ml-1" />
                            Visit Fee
                          </Label>
                          <Input
                            id="doctorFree"
                            value={editablePrescription.doctorFree || ""}
                            onChange={(e) =>
                              updateField("doctorFree", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Enter visit fee"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Section: Medicines - Main Table */}
                  <tr className="border-b dark:border-border/30 hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Pill className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Medications and Prescriptions
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {medicinesCount} medication(s) prescribed
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-6">
                        <div className="border border-border/50 dark:border-border/30 rounded-lg overflow-hidden bg-card">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] lg:min-w-[1100px]">
                              <thead>
                                <tr className="bg-muted/70 dark:border-border/50">
                                  <th className="text-right p-4 text-sm font-medium w-[220px] border-r border-border/20">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Medication Name
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        * Required
                                      </span>
                                    </div>
                                  </th>
                                  <th className="text-right p-4 text-sm font-medium w-[140px] border-r border-border/20">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Dosage
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        * Required
                                      </span>
                                    </div>
                                  </th>
                                  <th className="text-right p-4 text-sm font-medium w-[140px] border-r border-border/20">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Frequency
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        * Required
                                      </span>
                                    </div>
                                  </th>
                                  <th className="text-right p-4 text-sm font-medium w-[130px] border-r border-border/20">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Duration
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        * Required
                                      </span>
                                    </div>
                                  </th>
                                  <th className="text-right p-4 text-sm font-medium w-[130px] border-r border-border/20">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Form
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        Optional
                                      </span>
                                    </div>
                                  </th>
                                  <th className="text-right p-4 text-sm font-medium w-[160px] border-r border-border/20">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Instructions
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        Optional
                                      </span>
                                    </div>
                                  </th>
                                  <th className="text-right p-4 text-sm font-medium w-[100px]">
                                    <div className="flex flex-col items-end">
                                      <span className="font-semibold">
                                        Actions
                                      </span>
                                      <span className="text-xs text-muted-foreground font-normal">
                                        Manage
                                      </span>
                                    </div>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {editablePrescription.medicines.map(
                                  (medicine, index) => (
                                    <tr
                                      key={medicine.id || index}
                                      className="border-b dark:border-border/30 last:border-b-0 hover:bg-muted/30 transition-colors"
                                    >
                                      <td className="p-3 relative">
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
                                              editablePrescription.allergies ||
                                              [],
                                            age:
                                              parseInt(
                                                editablePrescription.patientAge ||
                                                  "0"
                                              ) || undefined,
                                            weight:
                                              parseFloat(
                                                editablePrescription.weight ||
                                                  "0"
                                              ) || undefined,
                                          }}
                                          placeholder="Type medication name..."
                                          className="w-full"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <Input
                                          onChange={(e) => {
                                            if (
                                              medicine.dosage === "custom" ||
                                              !DOSAGE_OPTIONS.find(
                                                (opt) =>
                                                  opt.label ===
                                                    e.target.value &&
                                                  opt.value !== "custom"
                                              )
                                            ) {
                                              updateMedicine(
                                                index,
                                                "dosage",
                                                e.target.value === "custom"
                                                  ? ""
                                                  : e.target.value
                                              );
                                            } else {
                                              updateMedicine(
                                                index,
                                                "dosage",
                                                e.target.value
                                              );
                                            }
                                          }}
                                          placeholder="Enter dosage (e.g., 300mg)"
                                          className="text-sm"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <Input
                                          onChange={(e) =>
                                            updateMedicine(
                                              index,
                                              "frequency",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Select frequency"
                                          className="text-sm"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <Input
                                          onChange={(e) =>
                                            updateMedicine(
                                              index,
                                              "duration",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Select duration"
                                          className="text-sm"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <Input
                                          onChange={(e) =>
                                            updateMedicine(
                                              index,
                                              "form",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Form"
                                          className="text-sm"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <Input
                                          onChange={(e) =>
                                            updateMedicine(
                                              index,
                                              "instructions",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Enter instructions"
                                          className="text-sm"
                                        />
                                      </td>
                                      <td className="p-3">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="destructive"
                                              size="sm"
                                              onClick={() =>
                                                removeMedicine(index)
                                              }
                                              disabled={
                                                editablePrescription.medicines
                                                  .length === 1
                                              }
                                              className="h-8 w-8 p-0"
                                            >
                                              <Trash2 className="h-4 w-4" />
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
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add new medication
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Section: Additional Instructions & Follow-up */}
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-cyan-100 rounded-lg">
                          <Shield className="h-4 w-4 text-cyan-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Additional Instructions
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Follow-up and Care
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label
                            htmlFor="instructions"
                            className="text-sm font-medium"
                          >
                            General Instructions
                          </Label>
                          <Input
                            id="instructions"
                            value={editablePrescription.instructions || ""}
                            onChange={(e) =>
                              updateField("instructions", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Enter general instructions"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="followUp"
                            className="text-sm font-medium"
                          >
                            <Clock className="h-4 w-4 inline ml-1" />
                            Follow-up Time
                          </Label>
                          <Input
                            id="followUp"
                            value={editablePrescription.followUp || ""}
                            onChange={(e) =>
                              updateField("followUp", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Enter follow-up time"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label
                            htmlFor="restrictions"
                            className="text-sm font-medium"
                          >
                            Restrictions and Precautions
                          </Label>
                          <Input
                            id="restrictions"
                            value={editablePrescription.restrictions || ""}
                            onChange={(e) =>
                              updateField("restrictions", e.target.value)
                            }
                            className="mt-1.5"
                            placeholder="Enter restrictions and precautions"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="border-t dark:border-border/50 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isSaving ? "bg-amber-500 animate-pulse" : "bg-green-500"
                    }`}
                  />
                  <span className="text-muted-foreground">
                    {isSaving
                      ? "Saving information..."
                      : "All sections ready for saving"}
                  </span>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  <span className="font-medium">
                    {
                      ["patientName"].filter(
                        (field) =>
                          editablePrescription[field as keyof Prescription]
                      ).length
                    }
                    /1 required field completed
                  </span>
                </Badge>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSaving}
                  className="min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="min-w-[120px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {isSaving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                      Save Prescription
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
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
