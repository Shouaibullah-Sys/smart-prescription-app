// components/create-preset-form.tsx
"use client";

import { useState, useEffect } from "react";
import type { Prescription } from "../types/prescription";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Save,
  Stethoscope,
  Pill,
  AlertCircle,
} from "lucide-react";

interface Medicine {
  id: string;
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  timing: string;
  withFood: boolean;
  instructions: string;
  notes: string;
}

interface CreatePresetFormProps {
  onPresetCreated?: () => void;
  onError?: (error: string) => void;
  preset?: Prescription; // For editing existing presets
  isOpen?: boolean; // For controlled dialog
  onClose?: () => void; // For controlled dialog
  onSuccess?: () => void; // For edit success callback
}

const commonCategories = [
  "Respiratory",
  "Cardiovascular",
  "Endocrine",
  "Psychiatric",
  "Genitourinary",
  "Neurological",
  "Allergy",
  "Musculoskeletal",
  "Gastrointestinal",
  "Dermatology",
  "Infectious Disease",
  "Other",
];

const commonRoutes = [
  "PO (Oral)",
  "IV (Intravenous)",
  "IM (Intramuscular)",
  "SC (Subcutaneous)",
  "Topical",
  "Inhalation",
  "Intranasal",
  "Ophthalmic",
  "Otic",
  "Rectal",
  "Sublingual",
  "Transdermal",
];

const commonFrequencies = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Before meals",
  "After meals",
  "With meals",
];

export default function CreatePresetForm({
  onPresetCreated,
  onError,
  preset, // For editing existing presets
  isOpen: controlledIsOpen, // For controlled dialog
  onClose, // For controlled dialog
  onSuccess, // For edit success callback
}: CreatePresetFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Determine if we're in edit mode
  const isEditMode = !!preset;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    diagnosis: "",
    chiefComplaint: "",
    category: "",
    urgency: "medium" as "low" | "medium" | "high",
    instructions: "",
    followUp: "",
    restrictions: "",
  });

  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "1",
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      route: "",
      timing: "",
      withFood: false,
      instructions: "",
      notes: "",
    },
  ]);

  // Initialize form data when editing a preset
  useEffect(() => {
    if (preset && isEditMode) {
      setFormData({
        name: preset.id || "",
        diagnosis: preset.chiefComplaint || "",
        chiefComplaint: preset.chiefComplaint || "",
        category: getCategoryFromDiagnosis(preset.chiefComplaint || ""),
        urgency: getUrgencyFromCategory(
          getCategoryFromDiagnosis(preset.chiefComplaint || "")
        ),
        instructions: preset.instructions || "",
        followUp: preset.followUp || "",
        restrictions: preset.restrictions || "",
      });

      if (preset.medicines && preset.medicines.length > 0) {
        setMedicines(
          preset.medicines.map((med, index) => ({
            id: (index + 1).toString(),
            medicine: med.medicine || "",
            dosage: med.dosage || "",
            frequency: med.frequency || "",
            duration: med.duration || "",
            route: med.route || "",
            timing: med.timing || "",
            withFood: med.withFood || false,
            instructions: med.instructions || "",
            notes: med.notes || "",
          }))
        );
      } else {
        setMedicines([
          {
            id: "1",
            medicine: "",
            dosage: "",
            frequency: "",
            duration: "",
            route: "",
            timing: "",
            withFood: false,
            instructions: "",
            notes: "",
          },
        ]);
      }

      // If in controlled mode (edit mode), set isOpen based on controlledIsOpen
      if (controlledIsOpen !== undefined) {
        setIsOpen(controlledIsOpen);
      }
    }
  }, [preset, isEditMode, controlledIsOpen]);

  function getCategoryFromDiagnosis(diagnosis: string): string {
    const diagnosisLower = diagnosis.toLowerCase();
    if (
      diagnosisLower.includes("hypertension") ||
      diagnosisLower.includes("cardiovascular")
    ) {
      return "Cardiovascular";
    } else if (
      diagnosisLower.includes("diabetes") ||
      diagnosisLower.includes("endocrine")
    ) {
      return "Endocrine";
    } else if (
      diagnosisLower.includes("anxiety") ||
      diagnosisLower.includes("psychiatric") ||
      diagnosisLower.includes("depression") ||
      diagnosisLower.includes("insomnia")
    ) {
      return "Psychiatric";
    } else if (
      diagnosisLower.includes("uti") ||
      diagnosisLower.includes("genitourinary")
    ) {
      return "Genitourinary";
    } else if (
      diagnosisLower.includes("migraine") ||
      diagnosisLower.includes("neurological")
    ) {
      return "Neurological";
    } else if (
      diagnosisLower.includes("allergic") ||
      diagnosisLower.includes("allergy")
    ) {
      return "Allergy";
    } else if (
      diagnosisLower.includes("arthritis") ||
      diagnosisLower.includes("musculoskeletal") ||
      diagnosisLower.includes("back pain")
    ) {
      return "Musculoskeletal";
    } else if (
      diagnosisLower.includes("gerd") ||
      diagnosisLower.includes("gastroesophageal") ||
      diagnosisLower.includes("gastrointestinal")
    ) {
      return "Gastrointestinal";
    } else if (
      diagnosisLower.includes("pneumonia") ||
      diagnosisLower.includes("bronchitis") ||
      diagnosisLower.includes("otitis") ||
      diagnosisLower.includes("infectious")
    ) {
      return "Infectious Disease";
    } else if (
      diagnosisLower.includes("eczema") ||
      diagnosisLower.includes("dermatitis") ||
      diagnosisLower.includes("dermatology")
    ) {
      return "Dermatology";
    } else {
      return "Respiratory"; // Default category
    }
  }

  function getUrgencyFromCategory(category: string): "low" | "medium" | "high" {
    const urgencyMap: Record<string, "low" | "medium" | "high"> = {
      Cardiovascular: "medium",
      Endocrine: "medium",
      Psychiatric: "medium",
      Genitourinary: "high",
      Neurological: "medium",
      Allergy: "low",
      Musculoskeletal: "medium",
      Respiratory: "low",
      Gastrointestinal: "medium",
      "Infectious Disease": "high",
      Dermatology: "low",
    };
    return urgencyMap[category] || "medium";
  }

  const addMedicine = () => {
    const newId = Date.now().toString();
    setMedicines([
      ...medicines,
      {
        id: newId,
        medicine: "",
        dosage: "",
        frequency: "",
        duration: "",
        route: "",
        timing: "",
        withFood: false,
        instructions: "",
        notes: "",
      },
    ]);
  };

  const removeMedicine = (id: string) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((med) => med.id !== id));
    }
  };

  const updateMedicine = (id: string, field: keyof Medicine, value: any) => {
    setMedicines(
      medicines.map((med) => (med.id === id ? { ...med, [field]: value } : med))
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      onError?.("Preset name is required");
      return false;
    }
    if (!formData.diagnosis.trim()) {
      onError?.("Diagnosis is required");
      return false;
    }
    if (!formData.category) {
      onError?.("Category is required");
      return false;
    }

    // Validate medicines
    for (const med of medicines) {
      if (!med.medicine.trim() || !med.dosage.trim()) {
        onError?.("Medicine name and dosage are required for all medications");
        return false;
      }
    }

    return true;
  };

  const handleDelete = async () => {
    if (!preset || !isEditMode) return;

    if (!preset.id.startsWith("user_")) {
      onError?.("Cannot delete predefined presets");
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/presets/${preset.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete preset");
      }

      handleClose();
      onPresetCreated?.(); // Refresh presets list
    } catch (error) {
      console.error("Error deleting preset:", error);
      onError?.(
        error instanceof Error ? error.message : "Failed to delete preset"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
      // Reset form when closing in create mode
      if (!isEditMode) {
        setFormData({
          name: "",
          diagnosis: "",
          chiefComplaint: "",
          category: "",
          urgency: "medium",
          instructions: "",
          followUp: "",
          restrictions: "",
        });
        setMedicines([
          {
            id: "1",
            medicine: "",
            dosage: "",
            frequency: "",
            duration: "",
            route: "",
            timing: "",
            withFood: false,
            instructions: "",
            notes: "",
          },
        ]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;

      if (isEditMode && preset) {
        // Update existing preset
        response = await fetch(`/api/presets/${preset.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            medicines,
          }),
        });
      } else {
        // Create new preset
        response = await fetch("/api/presets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            medicines,
            source: "user_created",
          }),
        });
      }

      if (!response.ok) {
        throw new Error(
          isEditMode ? "Failed to update preset" : "Failed to create preset"
        );
      }

      handleClose();

      if (isEditMode) {
        onSuccess?.(); // Call success callback for edit mode
      } else {
        onPresetCreated?.(); // Call created callback for create mode
      }
    } catch (error) {
      console.error("Error with preset:", error);
      onError?.(
        error instanceof Error
          ? error.message
          : `Failed to ${isEditMode ? "update" : "create"} preset`
      );
    } finally {
      setLoading(false);
    }
  };

  // Only show trigger button in create mode
  const showTrigger = !isEditMode && !controlledIsOpen;

  return (
    <Dialog
      open={controlledIsOpen ?? isOpen}
      onOpenChange={controlledIsOpen ? undefined : setIsOpen}
    >
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Preset
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="!max-w-[1200px] !w-[95vw] max-h-[95vh] overflow-y-auto px-4">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Stethoscope className="h-5 w-5" />
              {isEditMode ? "Edit Medical Preset" : "Create Medical Preset"}
            </DialogTitle>
            {isEditMode && preset && preset.id.startsWith("user_") && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="ml-auto"
              >
                {deleteLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Preset
              </Button>
            )}
          </div>
          <DialogDescription className="text-base">
            {isEditMode
              ? "Update the medical preset template. Changes will be saved to your presets library."
              : "Create a custom medical preset that can be reused for similar conditions. This template will be saved to your presets library."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Preset Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Common Cold Template"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {commonCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency Level</Label>
                      <Select
                        value={formData.urgency}
                        onValueChange={(value) =>
                          handleInputChange("urgency", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">
                            Medium Priority
                          </SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      placeholder="e.g., Viral Upper Respiratory Tract Infection"
                      value={formData.diagnosis}
                      onChange={(e) =>
                        handleInputChange("diagnosis", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                    <Textarea
                      id="chiefComplaint"
                      placeholder="e.g., Runny nose, sneezing, mild cough for 3 days"
                      value={formData.chiefComplaint}
                      onChange={(e) =>
                        handleInputChange("chiefComplaint", e.target.value)
                      }
                      rows={3}
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructions">General Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="e.g., Rest, increase fluid intake, monitor symptoms"
                      value={formData.instructions}
                      onChange={(e) =>
                        handleInputChange("instructions", e.target.value)
                      }
                      rows={3}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="followUp">Follow-up Instructions</Label>
                    <Textarea
                      id="followUp"
                      placeholder="e.g., Return if symptoms worsen or persist beyond 7 days"
                      value={formData.followUp}
                      onChange={(e) =>
                        handleInputChange("followUp", e.target.value)
                      }
                      rows={2}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restrictions">
                      Restrictions/Contraindications
                    </Label>
                    <Textarea
                      id="restrictions"
                      placeholder="e.g., Avoid alcohol, contraindicated in pregnancy"
                      value={formData.restrictions}
                      onChange={(e) =>
                        handleInputChange("restrictions", e.target.value)
                      }
                      rows={2}
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Medications */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Pill className="h-5 w-5" />
                    Medications
                  </CardTitle>
                  <CardDescription>
                    Add medications that are typically prescribed for this
                    condition
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medicines.map((medicine, index) => (
                    <Card key={medicine.id} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">
                            Medication {index + 1}
                          </Badge>
                          {medicines.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMedicine(medicine.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Medicine Name *</Label>
                            <Input
                              placeholder="e.g., Acetaminophen"
                              value={medicine.medicine}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "medicine",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Dosage *</Label>
                            <Input
                              placeholder="e.g., 500 mg"
                              value={medicine.dosage}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "dosage",
                                  e.target.value
                                )
                              }
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Frequency</Label>
                            <Select
                              value={medicine.frequency}
                              onValueChange={(value) =>
                                updateMedicine(medicine.id, "frequency", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                {commonFrequencies.map((freq) => (
                                  <SelectItem key={freq} value={freq}>
                                    {freq}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              placeholder="e.g., 5 days, Ongoing, PRN"
                              value={medicine.duration}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "duration",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Route</Label>
                            <Select
                              value={medicine.route}
                              onValueChange={(value) =>
                                updateMedicine(medicine.id, "route", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select route" />
                              </SelectTrigger>
                              <SelectContent>
                                {commonRoutes.map((route) => (
                                  <SelectItem key={route} value={route}>
                                    {route}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Timing</Label>
                            <Input
                              placeholder="e.g., With breakfast, Before bed"
                              value={medicine.timing}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "timing",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2 col-span-1 sm:col-span-2">
                            <Label>Instructions</Label>
                            <Input
                              placeholder="e.g., Take with food, Avoid dairy products"
                              value={medicine.instructions}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "instructions",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2 col-span-1 sm:col-span-2">
                            <Label>Notes</Label>
                            <Input
                              placeholder="e.g., Monitor for side effects, Check liver function"
                              value={medicine.notes}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "notes",
                                  e.target.value
                                )
                              }
                            />
                          </div>

                          <div className="flex items-center space-x-2 col-span-1 sm:col-span-2">
                            <input
                              type="checkbox"
                              id={`withFood-${medicine.id}`}
                              checked={medicine.withFood}
                              onChange={(e) =>
                                updateMedicine(
                                  medicine.id,
                                  "withFood",
                                  e.target.checked
                                )
                              }
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`withFood-${medicine.id}`}>
                              Take with food
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMedicine}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Medication
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Disclaimer - Full Width */}
          <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Important Medical Disclaimer
                  </p>
                  <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                    <p>
                      This preset is for reference and educational purposes
                      only. Always verify drug interactions, contraindications,
                      and appropriate dosing for individual patients.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {isEditMode ? "Close" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? "Update Preset" : "Create Preset"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
