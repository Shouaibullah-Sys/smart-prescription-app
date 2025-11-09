// components/editable-prescription-table.tsx
"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
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
  Copy,
  User,
  Stethoscope,
  Pill,
  FileText,
} from "lucide-react";
import { Prescription, FormMedicine } from "@/types/prescription";

interface EditablePrescriptionTableProps {
  prescription: Prescription;
  onSave: (prescription: Prescription) => Promise<void>;
  onCancel: () => void;
  onDelete?: (prescriptionId: string) => Promise<void>;
  isSaving?: boolean;
  mode?: "create" | "edit";
}

export function EditablePrescriptionTable({
  prescription,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  mode = "create",
}: EditablePrescriptionTableProps) {
  const [editablePrescription, setEditablePrescription] =
    useState<Prescription>({
      // Set default values first
      ...{
        patientName: "",
        patientAge: "",
        patientGender: "",
        chiefComplaint: "",
        diagnosis: "",
        prescription: [],
        doctorName: "دکتر احمدی",
        clinicName: "کلینیک تخصصی",
        instructions: "استراحت کافی و مصرف منظم داروها",
        followUp: "در صورت عدم بهبود پس از 3 روز مراجعه شود",
      },

      // Merge with provided prescription (this will override defaults)
      ...prescription,

      // Override prescription array with properly formatted medicines
      medicines:
        prescription.medicines?.map((med) => ({
          id: med.id || Math.random().toString(36).substr(2, 9),
          medicine: med.medicine || "",
          dosage: med.dosage || "",
          frequency: med.frequency || "",
          duration: med.duration || "",
          form: med.form || "tablet",
          route: med.route || "oral",
          timing: med.timing || "after_meal",
          withFood: med.withFood || false,
          instructions: med.instructions || "",
          notes: med.notes || "",
          prescriptionId: prescription.id || "",
        })) || [],
    });

  // Form sections state
  const [activeSection, setActiveSection] = useState<
    "patient" | "clinical" | "medicines" | "instructions"
  >("patient");

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
    const newMedicine: FormMedicine = {
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
      prescriptionId: editablePrescription.id || "",
    };
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine],
    }));
  };

  const removeMedicine = (index: number) => {
    setEditablePrescription((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!editablePrescription.patientName.trim()) {
      alert("لطفاً نام بیمار را وارد کنید");
      return;
    }

    if (!editablePrescription.chiefComplaint?.trim()) {
      alert("لطفاً شکایت اصلی بیمار را وارد کنید");
      return;
    }

    if (!editablePrescription.diagnosis.trim()) {
      alert("لطفاً تشخیص بیماری را وارد کنید");
      return;
    }

    const hasEmptyMedicines = editablePrescription.medicines.some(
      (med) =>
        !med.medicine.trim() ||
        !med.dosage.trim() ||
        !med.frequency.trim() ||
        !med.duration.trim()
    );

    if (hasEmptyMedicines) {
      alert("لطفاً تمام فیلدهای ضروری داروها را پر کنید");
      return;
    }

    if (editablePrescription.medicines.length === 0) {
      alert("حداقل یک دارو باید به نسخه اضافه شود");
      return;
    }

    await onSave(editablePrescription);
  };

  const handleDelete = async () => {
    if (editablePrescription.id && onDelete) {
      if (confirm("آیا از حذف این نسخه اطمینان دارید؟")) {
        await onDelete(editablePrescription.id);
      }
    }
  };

  const duplicatePrescription = () => {
    const duplicated = {
      ...editablePrescription,
      id: Math.random().toString(36).substr(2, 9),
      patientName: `کپی از ${editablePrescription.patientName}`,
      prescriptionNumber: undefined,
      medicines: editablePrescription.medicines.map((med) => ({
        ...med,
        id: Math.random().toString(36).substr(2, 9),
        prescriptionId: "",
      })),
    };
    setEditablePrescription(duplicated);
  };

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
        </Button>
        <Button
          variant={activeSection === "medicines" ? "default" : "ghost"}
          onClick={() => setActiveSection("medicines")}
          className="flex items-center gap-2"
        >
          <Pill className="h-4 w-4" />
          داروها ({editablePrescription.medicines.length})
        </Button>
        <Button
          variant={activeSection === "instructions" ? "default" : "ghost"}
          onClick={() => setActiveSection("instructions")}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          دستورات و پیگیری
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              <CardTitle>
                {mode === "create" ? "ایجاد نسخه پزشکی" : "ویرایش نسخه پزشکی"}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              {mode === "edit" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={duplicatePrescription}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    کپی نسخه
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    حذف نسخه
                  </Button>
                </>
              )}
            </div>
          </div>
          <CardDescription>
            اطلاعات کامل نسخه پزشکی را با دقت وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Patient Information Section */}
          {activeSection === "patient" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label htmlFor="patientName">نام کامل بیمار *</Label>
                  <Input
                    id="patientName"
                    value={editablePrescription.patientName}
                    onChange={(e) =>
                      updateField("patientName", e.target.value || "")
                    }
                    className="mt-1"
                    placeholder="نام و نام خانوادگی بیمار"
                  />
                </div>
                <div>
                  <Label htmlFor="patientAge">سن</Label>
                  <Input
                    id="patientAge"
                    value={editablePrescription.patientAge || ""}
                    onChange={(e) =>
                      updateField("patientAge", e.target.value || "")
                    }
                    className="mt-1"
                    placeholder="مثلاً 35 سال"
                  />
                </div>
                <div>
                  <Label htmlFor="patientGender">جنسیت</Label>
                  <Select
                    value={editablePrescription.patientGender || undefined}
                    onValueChange={(value) =>
                      updateField("patientGender", value || "")
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
                      updateField("patientPhone", e.target.value || "")
                    }
                    className="mt-1"
                    placeholder="09xxxxxxxxx"
                  />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <Label htmlFor="patientAddress">آدرس بیمار</Label>
                <Textarea
                  id="patientAddress"
                  value={editablePrescription.patientAddress || ""}
                  onChange={(e) =>
                    updateField("patientAddress", e.target.value || "")
                  }
                  className="mt-1"
                  placeholder="آدرس کامل بیمار"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Clinical Information Section */}
          {activeSection === "clinical" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg">
                <div className="md:col-span-2">
                  <Label htmlFor="chiefComplaint">شکایت اصلی *</Label>
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
                  <Label htmlFor="historyOfPresentIllness">
                    تاریخچه بیماری فعلی
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
                  <Label htmlFor="physicalExamination">معاینه فیزیکی</Label>
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
                  <Label htmlFor="diagnosis">تشخیص *</Label>
                  <Input
                    id="diagnosis"
                    value={editablePrescription.diagnosis}
                    onChange={(e) => updateField("diagnosis", e.target.value)}
                    className="mt-1"
                    placeholder="تشخیص نهایی"
                  />
                </div>
                <div>
                  <Label htmlFor="differentialDiagnosis">تشخیص افتراقی</Label>
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
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-purple-50 rounded-lg">
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
                <h4 className="font-semibold">لیست داروها</h4>
                <Button
                  onClick={addMedicine}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  افزودن دارو
                </Button>
              </div>

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
                        <th className="text-right p-3 font-medium">
                          زمان مصرف
                        </th>
                        <th className="text-right p-3 font-medium">با غذا</th>
                        <th className="text-right p-3 font-medium">دستورات</th>
                        <th className="text-right p-3 font-medium">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editablePrescription.medicines.map((medicine, index) => (
                        <tr
                          key={medicine.id}
                          className="border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <td className="p-2">
                            <Input
                              value={medicine.medicine}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "medicine",
                                  e.target.value
                                )
                              }
                              placeholder="نام دارو به انگلیسی"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.dosage}
                              onChange={(e) =>
                                updateMedicine(index, "dosage", e.target.value)
                              }
                              placeholder="مثلاً 500mg"
                              className="w-full text-sm"
                            />
                          </td>
                          <td className="p-2">
                            <Select
                              value={medicine.form ?? undefined}
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
                                <SelectItem value="inhaler">اسپری</SelectItem>
                                <SelectItem value="cream">کرم</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.frequency}
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
                              value={medicine.duration}
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
                              value={medicine.route ?? undefined}
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
                                <SelectItem value="inhalation">
                                  استنشاقی
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2">
                            <Select
                              value={medicine.timing ?? undefined}
                              onValueChange={(value) =>
                                updateMedicine(index, "timing", value)
                              }
                            >
                              <SelectTrigger className="w-full text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="before_meal">
                                  قبل از غذا
                                </SelectItem>
                                <SelectItem value="after_meal">
                                  بعد از غذا
                                </SelectItem>
                                <SelectItem value="with_meal">
                                  همراه غذا
                                </SelectItem>
                                <SelectItem value="empty_stomach">
                                  ناشتا
                                </SelectItem>
                                <SelectItem value="anytime">هر زمان</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-2 text-center">
                            <input
                              type="checkbox"
                              checked={medicine.withFood || false}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "withFood",
                                  e.target.checked
                                )
                              }
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              value={medicine.instructions || ""}
                              onChange={(e) =>
                                updateMedicine(
                                  index,
                                  "instructions",
                                  e.target.value
                                )
                              }
                              placeholder="دستورات مصرف"
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

              {editablePrescription.medicines.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  هیچ دارویی اضافه نشده است
                </div>
              )}
            </div>
          )}

          {/* Instructions Section */}
          {activeSection === "instructions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instructions">دستورات عمومی</Label>
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
                    <Label htmlFor="followUp">دستورات پیگیری</Label>
                    <Textarea
                      id="followUp"
                      value={editablePrescription.followUp || ""}
                      onChange={(e) => updateField("followUp", e.target.value)}
                      className="mt-1"
                      placeholder="زمان و شرایط مراجعه بعدی"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="restrictions">محدودیت‌ها و پرهیزها</Label>
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
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                انصراف
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  isSaving || editablePrescription.medicines.length === 0
                }
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
                    {mode === "create" ? "ذخیره نسخه" : "بروزرسانی نسخه"}
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
