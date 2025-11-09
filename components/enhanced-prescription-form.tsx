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
  Edit3,
  User,
  Stethoscope,
  Pill,
  FileText,
  Sparkles,
  Brain,
  Eye,
  Download,
  DollarSign,
} from "lucide-react";
import { Prescription, FormMedicine } from "@/types/prescription";

import { MedicalAIService } from "@/services/huggingfaceService";

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
  // Safe initialization with proper fallbacks
  const [editablePrescription, setEditablePrescription] =
    useState<Prescription>(() => {
      return initializePrescription(prescription);
    });

  const [activeSection, setActiveSection] = useState<
    "patient" | "clinical" | "medicines" | "instructions"
  >("clinical"); // Start with clinical section since AI fills this

  // Re-initialize when prescription prop changes
  useEffect(() => {
    setEditablePrescription(initializePrescription(prescription));
  }, [prescription]);

  function initializePrescription(prescription: Prescription): Prescription {
    // Ensure prescription array exists and has proper structure
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

    // If no prescriptions exist, add an empty one
    const safePrescription =
      initialPrescription.length > 0
        ? initialPrescription
        : [createEmptyMedicine()];

    return {
      // Start with the incoming prescription data
      ...prescription,

      // Ensure required fields exist
      patientName: prescription.patientName || "",
      diagnosis: prescription.diagnosis || "",
      medicines: safePrescription,

      // Enhanced fields with defaults
      patientAge: prescription.patientAge || "",
      patientGender: prescription.patientGender || "",
      patientPhone: prescription.patientPhone || "",
      pulseRate: prescription.pulseRate || "",
      bloodPressure: prescription.bloodPressure || "",
      temperature: prescription.temperature || "",
      respiratoryRate: prescription.respiratoryRate || "",
      oxygenSaturation: prescription.oxygenSaturation || "",
      allergies: Array.isArray(prescription.allergies)
        ? prescription.allergies
        : [],
      currentMedications: Array.isArray(prescription.currentMedications)
        ? prescription.currentMedications
        : [],
      pastMedicalHistory: prescription.pastMedicalHistory || "",
      historyOfPresentIllness: prescription.historyOfPresentIllness || "",
      physicalExamination: prescription.physicalExamination || "",
      differentialDiagnosis: prescription.differentialDiagnosis || "",
      instructions:
        prescription.instructions || "استراحت کافی و مصرف منظم داروها",
      followUp:
        prescription.followUp || "در صورت عدم بهبود پس از 3 روز مراجعه شود",
      restrictions: prescription.restrictions || "",
      doctorName: prescription.doctorName || "دکتر احمدی",
      clinicName: prescription.clinicName || "کلینیک تخصصی",
      doctorFree: prescription.doctorFree || "",
      chiefComplaint: prescription.chiefComplaint || "",
    };
  }

  // Helper function to create empty medicine
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

  const addMedicine = () => {
    const newMedicine = createEmptyMedicine();
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine],
    }));
  };

  const removeMedicine = (index: number) => {
    // Don't remove if it's the only medicine
    if (editablePrescription.medicines.length <= 1) {
      // Instead of removing, clear the fields
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
      alert("لطفاً نام بیمار را وارد کنید");
      return;
    }

    if (!editablePrescription.diagnosis.trim()) {
      alert("لطفاً تشخیص بیماری را وارد کنید");
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
      alert("لطفاً تمام فیلدهای ضروری داروها را پر کنید");
      return;
    }

    await onSave(editablePrescription);
  };

  // Check if AI has filled the clinical data
  const hasAIClinicalData =
    editablePrescription.chiefComplaint ||
    editablePrescription.historyOfPresentIllness ||
    editablePrescription.physicalExamination;

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b">
        <Button
          variant={activeSection === "patient" ? "default" : "ghost"}
          onClick={() => setActiveSection("patient")}
          className="flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          اطلاعات بیمار
        </Button>
        <Button
          variant={activeSection === "clinical" ? "default" : "ghost"}
          onClick={() => setActiveSection("clinical")}
          className="flex items-center gap-2"
        >
          <Stethoscope className="h-4 w-4" />
          معاینات بالینی
          {hasAIClinicalData && <Sparkles className="h-3 w-3 text-green-500" />}
        </Button>
        <Button
          variant={activeSection === "medicines" ? "default" : "ghost"}
          onClick={() => setActiveSection("medicines")}
          className="flex items-center gap-2"
        >
          <Pill className="h-4 w-4" />
          داروها ({editablePrescription.medicines.length})
          {editablePrescription.medicines.length > 0 && (
            <Sparkles className="h-3 w-3 text-green-500" />
          )}
        </Button>
        <Button
          variant={activeSection === "instructions" ? "default" : "ghost"}
          onClick={() => setActiveSection("instructions")}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          دستورات و پیگیری
          {editablePrescription.instructions && (
            <Sparkles className="h-3 w-3 text-green-500" />
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              <CardTitle>تکمیل نسخه پزشکی</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-green-500" />
              <span>تکمیل شده توسط هوش مصنوعی</span>
            </div>
          </div>
          <CardDescription>
            اطلاعات نسخه تولید شده را تکمیل و ویرایش کنید. بخش‌های پر شده توسط
            هوش مصنوعی با علامت ★ مشخص شده‌اند.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information Section */}
          {activeSection === "patient" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
                <div>
                  <Label htmlFor="patientName">نام کامل بیمار *</Label>
                  <Input
                    id="patientName"
                    value={editablePrescription.patientName || ""}
                    onChange={(e) => updateField("patientName", e.target.value)}
                    className="mt-1"
                    placeholder="نام و نام خانوادگی بیمار"
                  />
                </div>
                <div>
                  <Label htmlFor="patientAge">سن</Label>
                  <Input
                    id="patientAge"
                    value={editablePrescription.patientAge || ""}
                    onChange={(e) => updateField("patientAge", e.target.value)}
                    className="mt-1"
                    placeholder="مثلاً 35 سال"
                  />
                </div>
                <div>
                  <Label htmlFor="patientGender">جنسیت</Label>
                  <Select
                    value={editablePrescription.patientGender || ""}
                    onValueChange={(value) =>
                      updateField("patientGender", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="انتخاب جنسیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مرد">مرد</SelectItem>
                      <SelectItem value="زن">زن</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patientPhone">شماره تماس</Label>
                  <Input
                    id="patientPhone"
                    value={editablePrescription.patientPhone || ""}
                    onChange={(e) =>
                      updateField("patientPhone", e.target.value)
                    }
                    className="mt-1"
                    placeholder="09xxxxxxxxx"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg">
                <Label htmlFor="allergies">حساسیت‌ها</Label>
                <Textarea
                  id="allergies"
                  value={editablePrescription.allergies?.join(", ") || ""}
                  onChange={(e) =>
                    updateField(
                      "allergies",
                      e.target.value
                        .split(",")
                        .map((a) => a.trim())
                        .filter((a) => a)
                    )
                  }
                  className="mt-1"
                  placeholder="مثلاً پنی سیلین، آسپیرین"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Clinical Information Section */}
          {activeSection === "clinical" && (
            <div className="space-y-6">
              <div className="bg-linear-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Brain className="h-4 w-4" />
                    <span className="font-medium">تقویت با هوش مصنوعی</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      // Enhance diagnosis with AI
                      const analysis = await MedicalAIService.analyzeSymptoms(
                        editablePrescription.chiefComplaint || "",
                        editablePrescription.historyOfPresentIllness || ""
                      );
                      updateField(
                        "differentialDiagnosis",
                        analysis.differentialDiagnosis
                      );
                      updateField(
                        "physicalExamination",
                        analysis.clinicalNotes
                      );
                    }}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="h-3 w-3" />
                    بهبود با AI
                  </Button>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  از هوش مصنوعی برای بهبود تشخیص افتراقی و یافته‌های معاینه
                  استفاده کنید
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
                <div className="md:col-span-2">
                  <Label
                    htmlFor="chiefComplaint"
                    className="flex items-center gap-2"
                  >
                    شکایت اصلی
                    {editablePrescription.chiefComplaint && (
                      <Sparkles className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                  <Input
                    id="chiefComplaint"
                    value={editablePrescription.chiefComplaint || ""}
                    onChange={(e) =>
                      updateField("chiefComplaint", e.target.value)
                    }
                    className="mt-1"
                    placeholder="شکایت اصلی بیمار"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label
                    htmlFor="historyOfPresentIllness"
                    className="flex items-center gap-2"
                  >
                    تاریخچه بیماری فعلی
                    {editablePrescription.historyOfPresentIllness && (
                      <Sparkles className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                  <Textarea
                    id="historyOfPresentIllness"
                    value={editablePrescription.historyOfPresentIllness || ""}
                    onChange={(e) =>
                      updateField("historyOfPresentIllness", e.target.value)
                    }
                    className="mt-1"
                    placeholder="شرح کامل تاریخچه بیماری"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label
                    htmlFor="physicalExamination"
                    className="flex items-center gap-2"
                  >
                    معاینه فیزیکی
                    {editablePrescription.physicalExamination && (
                      <Sparkles className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                  <Textarea
                    id="physicalExamination"
                    value={editablePrescription.physicalExamination || ""}
                    onChange={(e) =>
                      updateField("physicalExamination", e.target.value)
                    }
                    className="mt-1"
                    placeholder="یافته‌های معاینه فیزیکی"
                    rows={3}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="diagnosis"
                    className="flex items-center gap-2"
                  >
                    تشخیص *
                    {editablePrescription.diagnosis && (
                      <Sparkles className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                  <Input
                    id="diagnosis"
                    value={editablePrescription.diagnosis || ""}
                    onChange={(e) => updateField("diagnosis", e.target.value)}
                    className="mt-1"
                    placeholder="تشخیص نهایی"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="differentialDiagnosis"
                    className="flex items-center gap-2"
                  >
                    تشخیص افتراقی
                    {editablePrescription.differentialDiagnosis && (
                      <Sparkles className="h-3 w-3 text-green-500" />
                    )}
                  </Label>
                  <Input
                    id="differentialDiagnosis"
                    value={editablePrescription.differentialDiagnosis || ""}
                    onChange={(e) =>
                      updateField("differentialDiagnosis", e.target.value)
                    }
                    className="mt-1"
                    placeholder="سایر احتمالات"
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 rounded-lg">
                <div>
                  <Label htmlFor="pulseRate">نبض (در دقیقه)</Label>
                  <Input
                    id="pulseRate"
                    value={editablePrescription.pulseRate || ""}
                    onChange={(e) => updateField("pulseRate", e.target.value)}
                    className="mt-1"
                    placeholder="72"
                  />
                </div>
                <div>
                  <Label htmlFor="bloodPressure">فشار خون</Label>
                  <Input
                    id="bloodPressure"
                    value={editablePrescription.bloodPressure || ""}
                    onChange={(e) =>
                      updateField("bloodPressure", e.target.value)
                    }
                    className="mt-1"
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label htmlFor="temperature">دمای بدن (°C)</Label>
                  <Input
                    id="temperature"
                    value={editablePrescription.temperature || ""}
                    onChange={(e) => updateField("temperature", e.target.value)}
                    className="mt-1"
                    placeholder="36.8"
                  />
                </div>
                <div>
                  <Label htmlFor="respiratoryRate">تعداد تنفس</Label>
                  <Input
                    id="respiratoryRate"
                    value={editablePrescription.respiratoryRate || ""}
                    onChange={(e) =>
                      updateField("respiratoryRate", e.target.value)
                    }
                    className="mt-1"
                    placeholder="16"
                  />
                </div>
                <div>
                  <Label htmlFor="oxygenSaturation">SPO2 (%)</Label>
                  <Input
                    id="oxygenSaturation"
                    value={editablePrescription.oxygenSaturation || ""}
                    onChange={(e) =>
                      updateField("oxygenSaturation", e.target.value)
                    }
                    className="mt-1"
                    placeholder="98"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medicines Section */}
          {activeSection === "medicines" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">لیست داروها</h4>
                  {editablePrescription.medicines.length > 0 && (
                    <Sparkles className="h-3 w-3 text-green-500" />
                  )}
                </div>
                <Button
                  onClick={addMedicine}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  افزودن دارو
                </Button>
              </div>

              {editablePrescription.medicines.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">
                      داروهای پیشنهادی هوش مصنوعی
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    داروها بر اساس تشخیص "{editablePrescription.diagnosis}"
                    پیشنهاد شده‌اند.
                  </p>
                </div>
              )}

              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="text-right p-3 font-medium">
                          نام دارو *
                        </th>
                        <th className="text-right p-3 font-medium">دوز *</th>
                        <th className="text-right p-3 font-medium">فرم</th>
                        <th className="text-right p-3 font-medium">
                          مقدار مصرف *
                        </th>
                        <th className="text-right p-3 font-medium">
                          مدت مصرف *
                        </th>
                        <th className="text-right p-3 font-medium">راه مصرف</th>
                        <th className="text-right p-3 font-medium">توضیحات</th>
                        <th className="text-right p-3 font-medium">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editablePrescription.medicines.map((medicine, index) => (
                        <tr
                          key={medicine.id || index}
                          className="border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <Input
                              value={medicine.medicine || ""}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "medicine",
                                  e.target.value
                                )
                              }
                              placeholder="نام دارو"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.dosage || ""}
                              onChange={(e) =>
                                updateMedicine(index, "dosage", e.target.value)
                              }
                              placeholder="مثلاً 500mg"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={medicine.form || "tablet"}
                              onValueChange={(value) =>
                                updateMedicine(index, "form", value)
                              }
                            >
                              <SelectTrigger className="w-full text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tablet">قرص</SelectItem>
                                <SelectItem value="capsule">کپسول</SelectItem>
                                <SelectItem value="syrup">شربت</SelectItem>
                                <SelectItem value="injection">آمپول</SelectItem>
                                <SelectItem value="drop">قطره</SelectItem>
                                <SelectItem value="cream">کرم</SelectItem>
                                <SelectItem value="ointment">پماد</SelectItem>
                                <SelectItem value="spray">اسپری</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.frequency || ""}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "frequency",
                                  e.target.value
                                )
                              }
                              placeholder="مثلاً هر 8 ساعت"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.duration || ""}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              placeholder="مثلاً 7 روز"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={medicine.route || "oral"}
                              onValueChange={(value) =>
                                updateMedicine(index, "route", value)
                              }
                            >
                              <SelectTrigger className="w-full text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="oral">خوراکی</SelectItem>
                                <SelectItem value="topical">موضعی</SelectItem>
                                <SelectItem value="injection">
                                  تزریقی
                                </SelectItem>
                                <SelectItem value="nasal">بینی</SelectItem>
                                <SelectItem value="ophthalmic">چشمی</SelectItem>
                                <SelectItem value="otic">گوشی</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.notes || ""}
                              onChange={(e) =>
                                updateMedicine(index, "notes", e.target.value)
                              }
                              placeholder="توضیحات مصرف"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeMedicine(index)}
                              disabled={
                                editablePrescription.medicines.length === 1
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Section */}
          {activeSection === "instructions" && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">تکمیل شده توسط هوش مصنوعی</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  دستورات و توصیه‌ها بر اساس تشخیص و شرایط بیمار تولید شده است.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="instructions"
                      className="flex items-center gap-2"
                    >
                      دستورات عمومی
                      {editablePrescription.instructions && (
                        <Sparkles className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Textarea
                      id="instructions"
                      value={editablePrescription.instructions || ""}
                      onChange={(e) =>
                        updateField("instructions", e.target.value)
                      }
                      className="mt-1"
                      placeholder="دستورات عمومی برای بیمار"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="followUp"
                      className="flex items-center gap-2"
                    >
                      دستورات پیگیری
                      {editablePrescription.followUp && (
                        <Sparkles className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Textarea
                      id="followUp"
                      value={editablePrescription.followUp || ""}
                      onChange={(e) => updateField("followUp", e.target.value)}
                      className="mt-1"
                      placeholder="زمان و شرایط مراجعه بعدی"
                      rows={3}
                    />
                  </div>
                  {/* Doctor Free Amount Field */}
                  <div>
                    <Label
                      htmlFor="doctorFree"
                      className="flex items-center gap-2"
                    >
                      <DollarSign className="h-4 w-4" />
                      هزینه ویزیت دکتر
                    </Label>
                    <Input
                      id="doctorFree"
                      value={editablePrescription.doctorFree || ""}
                      onChange={(e) =>
                        updateField("doctorFree", e.target.value)
                      }
                      className="mt-1"
                      placeholder="مبلغ ویزیت پزشک (مثلاً 50,000 افغانی)"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="restrictions"
                      className="flex items-center gap-2"
                    >
                      محدودیت‌ها و پرهیزها
                      {editablePrescription.restrictions && (
                        <Sparkles className="h-3 w-3 text-green-500" />
                      )}
                    </Label>
                    <Textarea
                      id="restrictions"
                      value={editablePrescription.restrictions || ""}
                      onChange={(e) =>
                        updateField("restrictions", e.target.value)
                      }
                      className="mt-1"
                      placeholder="فعالیت‌های ممنوعه و رژیم غذایی"
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctorName">نام پزشک</Label>
                      <Input
                        id="doctorName"
                        value={editablePrescription.doctorName || ""}
                        onChange={(e) =>
                          updateField("doctorName", e.target.value)
                        }
                        className="mt-1"
                        placeholder="نام پزشک معالج"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clinicName">نام مرکز درمانی</Label>
                      <Input
                        id="clinicName"
                        value={editablePrescription.clinicName || ""}
                        onChange={(e) =>
                          updateField("clinicName", e.target.value)
                        }
                        className="mt-1"
                        placeholder="نام کلینیک یا بیمارستان"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-between pt-4 border-t">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setActiveSection(
                    activeSection === "patient"
                      ? "instructions"
                      : activeSection === "clinical"
                      ? "patient"
                      : activeSection === "medicines"
                      ? "clinical"
                      : "medicines"
                  )
                }
              >
                قبلی
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setActiveSection(
                    activeSection === "patient"
                      ? "clinical"
                      : activeSection === "clinical"
                      ? "medicines"
                      : activeSection === "medicines"
                      ? "instructions"
                      : "patient"
                  )
                }
              >
                بعدی
              </Button>
            </div>
            <div className="flex gap-3">
              {/* PDF Preview Button */}

              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                انصراف
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    ذخیره نسخه
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
