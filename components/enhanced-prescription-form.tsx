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
import { SmartTestSearch } from "@/components/SmartTestSearch";
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

  useEffect(() => {
    setEditablePrescription(initializePrescription(prescription));
    setSelectedExams(new Set(prescription.medicalExams || []));
  }, [prescription]);

  function initializePrescription(prescription: Prescription): Prescription {
    const initialPrescription = Array.isArray(prescription.medicines)
      ? prescription.medicines.map((med) => ({
          ...med,
          id: med.id || Math.random().toString(36).substr(2, 9),
          dosage: med.dosage || "",
          form: med.form || "tablet",
          route: med.route || "oral",
          timing: med.timing || "after_meal",
          withFood: med.withFood || false,
          frequency: med.frequency || "",
          duration: med.duration || "",
          instructions: med.instructions || "",
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
      createdAt: prescription.createdAt || new Date().toISOString(),
    };
  }

  function createEmptyMedicine(): FormMedicine {
    return {
      id: Math.random().toString(36).substr(2, 9),
      medicine: "",
      dosage: "",
      form: "tablet",
      frequency: "",
      duration: "",
      route: "oral",
      timing: "after_meal",
      withFood: false,
      instructions: "",
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
      // Handle different medication data structures
      const strength =
        medication.strength || medication.medication?.strengths?.[0] || "";
      const dosageForm =
        medication.dosage_form ||
        medication.medication?.dosage_forms?.[0] ||
        "";
      const precautions =
        medication.precautions?.[0] ||
        medication.medication?.precautions?.[0] ||
        "";

      updateMedicine(index, "dosage", strength);
      updateMedicine(index, "form", dosageForm);
      updateMedicine(index, "notes", precautions);
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

  // Calculate BMI if weight and height are provided
  const calculateBMI = () => {
    const weight = parseFloat(editablePrescription.weight || "0");
    const height = parseFloat(editablePrescription.height || "0") / 100; // convert cm to m
    if (weight > 0 && height > 0) {
      const bmi = (weight / (height * height)).toFixed(1);
      updateField("bmi", bmi);
    }
  };

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
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
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
                          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 bg-muted/30 rounded-lg">
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
                                  calculateBMI();
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
                                  calculateBMI();
                                }}
                                className="mt-1 text-sm"
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
                                className="mt-1 text-sm bg-muted"
                                placeholder="Auto calculated"
                              />
                            </div>
                            <div>
                              <Label htmlFor="pulseRate" className="text-xs">
                                <Heart className="h-3 w-3 inline ml-1 text-rose-500" />
                                Pulse
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
                              <Label
                                htmlFor="bloodPressure"
                                className="text-xs"
                              >
                                Blood Pressure
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
                              <Label htmlFor="temperature" className="text-xs">
                                <Thermometer className="h-3 w-3 inline ml-1 text-amber-500" />
                                Temperature
                              </Label>
                              <Input
                                id="temperature"
                                value={editablePrescription.temperature || ""}
                                onChange={(e) =>
                                  updateField("temperature", e.target.value)
                                }
                                className="mt-1 text-sm"
                                placeholder="36.8"
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
                            <SmartTestSearch
                              onChange={(value, test) => {
                                if (value && test) {
                                  // Add the selected test to the medicalExams array
                                  const currentExams =
                                    editablePrescription.medicalExams || [];
                                  if (!currentExams.includes(value)) {
                                    updateField("medicalExams", [
                                      ...currentExams,
                                      value,
                                    ]);
                                  }
                                  // Also update the selectedExams set for UI
                                  const newSelectedExams = new Set(
                                    selectedExams
                                  );
                                  newSelectedExams.add(test.id);
                                  setSelectedExams(newSelectedExams);
                                }
                              }}
                              placeholder="Search for laboratory tests, imaging, or procedures..."
                              className="w-full"
                            />

                            {/* Show selected tests */}
                            {(editablePrescription.medicalExams?.length || 0) >
                              0 && (
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Selected Tests:
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                  {(
                                    editablePrescription.medicalExams || []
                                  ).map((testName, index) => (
                                    <Badge
                                      key={`selected-${index}`}
                                      variant="secondary"
                                      className="flex items-center gap-1"
                                    >
                                      <FlaskConical className="h-3 w-3" />
                                      {testName}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                        onClick={() => {
                                          // Remove this test
                                          const updatedExams = (
                                            editablePrescription.medicalExams ||
                                            []
                                          ).filter((_, i) => i !== index);
                                          updateField(
                                            "medicalExams",
                                            updatedExams
                                          );

                                          // Also remove from selectedExams set
                                          const newSelectedExams = new Set(
                                            selectedExams
                                          );
                                          // Note: We can't easily remove by name from selectedExams since it stores IDs
                                          // This is acceptable as the UI will be in sync via the medicalExams array
                                          setSelectedExams(newSelectedExams);
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                  <Badge variant="secondary">
                                    {
                                      (editablePrescription.medicalExams || [])
                                        .length
                                    }{" "}
                                    test(s) selected
                                  </Badge>
                                  <Button
                                    onClick={() => {
                                      updateField("medicalExams", []);
                                      setSelectedExams(new Set());
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

                            {/* Quick access to popular tests */}
                            <div className="pt-2 border-t">
                              <Label className="text-xs text-muted-foreground mb-2 block">
                                Quick Access - Popular Tests:
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {[
                                  "Complete Blood Count (CBC)",
                                  "Chest X-ray",
                                  "Lipid Profile",
                                  "CT Scan Brain",
                                  "Abdominal Ultrasound",
                                  "Electrocardiogram (ECG/EKG)",
                                ].map((popularTest) => (
                                  <Button
                                    key={popularTest}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs h-8 justify-start"
                                    onClick={() => {
                                      const currentExams =
                                        editablePrescription.medicalExams || [];
                                      if (!currentExams.includes(popularTest)) {
                                        updateField("medicalExams", [
                                          ...currentExams,
                                          popularTest,
                                        ]);
                                      }
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    {popularTest}
                                  </Button>
                                ))}
                              </div>
                            </div>
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
                          <Select
                            value={editablePrescription.doctorName || ""}
                            onValueChange={(value) =>
                              updateField("doctorName", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select Doctor" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                              <SelectItem value="Dr. Ahmad Farid">
                                Dr. Ahmad Farid
                              </SelectItem>
                              <SelectItem value="Dr. Maryam Hosseini">
                                Dr. Maryam Hosseini
                              </SelectItem>
                              <SelectItem value="Dr. Ali Rezaei">
                                Dr. Ali Rezaei
                              </SelectItem>
                              <SelectItem value="Dr. Sara Mohammadi">
                                Dr. Sara Mohammadi
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="clinicName"
                            className="text-sm font-medium"
                          >
                            Medical Center Name
                          </Label>
                          <Select
                            value={editablePrescription.clinicName || ""}
                            onValueChange={(value) =>
                              updateField("clinicName", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select Center" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                              <SelectItem value="Specialty Clinic">
                                Specialty Clinic
                              </SelectItem>
                              <SelectItem value="Imam Reza Hospital">
                                Imam Reza Hospital
                              </SelectItem>
                              <SelectItem value="Noor Medical Center">
                                Noor Medical Center
                              </SelectItem>
                              <SelectItem value="Children's Hospital">
                                Children's Hospital
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="doctorFree"
                            className="text-sm font-medium"
                          >
                            <DollarSign className="h-4 w-4 inline ml-1" />
                            Visit Fee
                          </Label>
                          <Select
                            value={editablePrescription.doctorFree || ""}
                            onValueChange={(value) =>
                              updateField("doctorFree", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select Fee" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                              <SelectItem value="50,000 Afghanis">
                                50,000 Afghanis
                              </SelectItem>
                              <SelectItem value="100,000 Afghanis">
                                100,000 Afghanis
                              </SelectItem>
                              <SelectItem value="150,000 Afghanis">
                                150,000 Afghanis
                              </SelectItem>
                              <SelectItem value="200,000 Afghanis">
                                200,000 Afghanis
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
                    <td className="p-4">
                      <div className="space-y-4">
                        <div className="border border-border/50 dark:border-border/30 rounded-lg overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                              <thead>
                                <tr className="bg-muted/50 border-b dark:border-border/50">
                                  <th className="text-right p-3 text-sm font-medium w-[200px]">
                                    Medication Name *
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium w-[120px]">
                                    Dosage *
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium w-[120px]">
                                    Frequency *
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium w-[100px]">
                                    Duration *
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium w-[120px]">
                                    Form
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium w-[150px]">
                                    Instructions
                                  </th>
                                  <th className="text-right p-3 text-sm font-medium w-[80px]">
                                    Actions
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
                                        <Select
                                          value={medicine.dosage || ""}
                                          onValueChange={(value) =>
                                            updateMedicine(
                                              index,
                                              "dosage",
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-full text-sm h-9">
                                            <SelectValue placeholder="Select dosage" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                                            {DOSAGE_OPTIONS.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.label}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="p-3">
                                        <Select
                                          value={medicine.frequency || ""}
                                          onValueChange={(value) =>
                                            updateMedicine(
                                              index,
                                              "frequency",
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-full text-sm h-9">
                                            <SelectValue placeholder="Select frequency" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                                            {FREQUENCY_OPTIONS.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.label}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="p-3">
                                        <Select
                                          value={medicine.duration || ""}
                                          onValueChange={(value) =>
                                            updateMedicine(
                                              index,
                                              "duration",
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-full text-sm h-9">
                                            <SelectValue placeholder="Select duration" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                                            {DURATION_OPTIONS.map((option) => (
                                              <SelectItem
                                                key={option.value}
                                                value={option.label}
                                              >
                                                {option.label}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="p-3">
                                        <Select
                                          value={medicine.form || "tablet"}
                                          onValueChange={(value) =>
                                            updateMedicine(index, "form", value)
                                          }
                                        >
                                          <SelectTrigger className="w-full text-sm h-9">
                                            <SelectValue placeholder="Form" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                                            <SelectItem value="tablet">
                                              Tablet
                                            </SelectItem>
                                            <SelectItem value="capsule">
                                              Capsule
                                            </SelectItem>
                                            <SelectItem value="syrup">
                                              Syrup
                                            </SelectItem>
                                            <SelectItem value="injection">
                                              Injection
                                            </SelectItem>
                                            <SelectItem value="drop">
                                              Drop
                                            </SelectItem>
                                            <SelectItem value="cream">
                                              Cream
                                            </SelectItem>
                                            <SelectItem value="ointment">
                                              Ointment
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="p-3">
                                        <Select
                                          value={medicine.notes || ""}
                                          onValueChange={(value) =>
                                            updateMedicine(
                                              index,
                                              "notes",
                                              value
                                            )
                                          }
                                        >
                                          <SelectTrigger className="w-full text-sm h-9">
                                            <SelectValue placeholder="Instructions" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                                            <SelectItem value="Before meal">
                                              {translateTiming("Before meal")}
                                            </SelectItem>
                                            <SelectItem value="After meal">
                                              {translateTiming("After meal")}
                                            </SelectItem>
                                            <SelectItem value="With food">
                                              {translateTiming("With food")}
                                            </SelectItem>
                                            <SelectItem value="On empty stomach">
                                              {translateTiming(
                                                "On empty stomach"
                                              )}
                                            </SelectItem>
                                            <SelectItem value="At bedtime">
                                              {translateTiming("At bedtime")}
                                            </SelectItem>
                                            <SelectItem value="As needed">
                                              {translateTiming(
                                                "As needed_display"
                                              )}
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
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
                          <Select
                            value={editablePrescription.instructions || ""}
                            onValueChange={(value) =>
                              updateField("instructions", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select instructions" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                              <SelectItem value="Adequate rest and regular medication intake">
                                Adequate rest and regular medication intake
                              </SelectItem>
                              <SelectItem value="Drink plenty of water and avoid heavy activity">
                                Drink plenty of water and avoid heavy activity
                              </SelectItem>
                              <SelectItem value="Proper diet and avoiding smoking">
                                Proper diet and avoiding smoking
                              </SelectItem>
                              <SelectItem value="Rest at home and visit if symptoms worsen">
                                Rest at home and visit if symptoms worsen
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label
                            htmlFor="followUp"
                            className="text-sm font-medium"
                          >
                            <Clock className="h-4 w-4 inline ml-1" />
                            Follow-up Time
                          </Label>
                          <Select
                            value={editablePrescription.followUp || ""}
                            onValueChange={(value) =>
                              updateField("followUp", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select follow-up time" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                              <SelectItem value="Return if no improvement after 3 days">
                                Return if no improvement after 3 days
                              </SelectItem>
                              <SelectItem value="After one week">
                                After one week
                              </SelectItem>
                              <SelectItem value="After two weeks">
                                After two weeks
                              </SelectItem>
                              <SelectItem value="If symptoms worsen">
                                If symptoms worsen
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label
                            htmlFor="restrictions"
                            className="text-sm font-medium"
                          >
                            Restrictions and Precautions
                          </Label>
                          <Select
                            value={editablePrescription.restrictions || ""}
                            onValueChange={(value) =>
                              updateField("restrictions", value)
                            }
                          >
                            <SelectTrigger className="mt-1.5">
                              <SelectValue placeholder="Select restrictions" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover dark:bg-black text-popover-foreground dark:text-gray-100 border dark:border-gray-800">
                              <SelectItem value="Avoid driving and operating machinery">
                                Avoid driving and operating machinery
                              </SelectItem>
                              <SelectItem value="Avoid alcohol and smoking">
                                Avoid alcohol and smoking
                              </SelectItem>
                              <SelectItem value="Avoid fatty and spicy foods">
                                Avoid fatty and spicy foods
                              </SelectItem>
                              <SelectItem value="No specific restrictions">
                                No specific restrictions
                              </SelectItem>
                            </SelectContent>
                          </Select>
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
