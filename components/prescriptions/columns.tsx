// components/prescriptions/columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Prescription } from "../../types/prescription";
import { Button } from "@/components/ui/button";
import { Download, Edit, Calendar, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import {
  downloadPrescriptionPDF,
  VoicePrescription,
} from "../../utils/generatePrescriptionPDF";
import { useState } from "react";

interface ColumnsProps {
  onEdit: (prescription: Prescription) => void;
  onDelete: (prescriptionId: string) => void;
}

export const useColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Prescription>[] => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Convert custom Prescription type to VoicePrescription type for PDF generation
  const convertToVoicePrescription = (
    prescription: Prescription
  ): VoicePrescription => {
    // Ensure required string fields
    const safePatientName = prescription.patientName || "نامشخص";
    const safeDoctorName = prescription.doctorName || "دکتر";

    // Convert medications to Medication format
    const medications = (prescription.medicines || []).map((med) => ({
      medicine: med.medicine || "",
      dosage: med.dosage || "",
      dosagePersian: med.dosagePersian,
      frequency: med.frequency || "",
      frequencyPersian: med.frequencyPersian,
      duration: med.duration || "",
      durationPersian: med.durationPersian,
      instructions: med.instructions || "",
      instructionsPersian: med.instructionsPersian,
      form: med.form,
      formPersian: med.formPersian,
      route: med.route,
      timing: med.timing,
      withFood: med.withFood || false,
      notes: med.notes,
    }));

    // Format date as string for VoicePrescription
    const prescriptionDate =
      prescription.prescriptionDate instanceof Date
        ? prescription.prescriptionDate.toISOString()
        : prescription.prescriptionDate
        ? new Date(prescription.prescriptionDate).toISOString()
        : new Date().toISOString();

    // Create VoicePrescription object with ALL fields
    const voicePrescription: VoicePrescription = {
      _id: prescription.id || `prescription_${Date.now()}`,
      patientName: safePatientName,
      patientAge: prescription.patientAge || "",
      patientGender: prescription.patientGender || "",
      patientAddress: prescription.patientAddress || "",
      allergies: prescription.allergies ?? null,
      currentMedications: prescription.currentMedications ?? null,
      pastMedicalHistory: prescription.pastMedicalHistory || "",
      familyHistory: prescription.familyHistory || "",
      socialHistory: prescription.socialHistory || "",
      chiefComplaint: prescription.chiefComplaint || "",
      weight: prescription.weight || "",
      height: prescription.height || "",
      bmi: prescription.bmi || "",
      pulseRate: prescription.pulseRate || "",
      bloodPressure: prescription.bloodPressure || "",
      temperature: prescription.temperature || "",
      respiratoryRate: prescription.respiratoryRate || "",
      oxygenSaturation: prescription.oxygenSaturation || "",
      physicalExam: prescription.physicalExam || "",
      // THIS IS THE CRITICAL FIELD - Include medicalExams!
      medicalExams: prescription.medicalExams || [],
      examNotes: prescription.examNotes || "",
      // System Examinations
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
      medicines: medications,
      doctorName: safeDoctorName,
      doctorLicenseNumber: prescription.doctorLicenseNumber || "",
      date: prescriptionDate,
      transcription: "",
      source: prescription.source || "manual",
      status: prescription.status || "active",
    };

    // Debug log
    console.log("Converted VoicePrescription:", {
      medicalExams: voicePrescription.medicalExams,
      medicalExamsLength: voicePrescription.medicalExams?.length,
      medicalExamsContent: voicePrescription.medicalExams,
      // System Examinations
      cnsExamination: voicePrescription.cnsExamination,
      cardiovascularExamination: voicePrescription.cardiovascularExamination,
      respiratoryExamination: voicePrescription.respiratoryExamination,
      gastrointestinalExamination:
        voicePrescription.gastrointestinalExamination,
      musculoskeletalExamination: voicePrescription.musculoskeletalExamination,
      genitourinaryExamination: voicePrescription.genitourinaryExamination,
      dermatologicalExamination: voicePrescription.dermatologicalExamination,
      entExamination: voicePrescription.entExamination,
      ophthalmologicalExamination:
        voicePrescription.ophthalmologicalExamination,
    });

    return voicePrescription;
  };

  const handleDownload = async (prescription: Prescription) => {
    try {
      setDownloadingId(prescription.id);

      // Debug logs
      console.log("=== Starting PDF Generation ===");
      console.log("Original prescription ID:", prescription.id);
      console.log("Original medicalExams:", prescription.medicalExams);
      console.log(
        "Original medicalExams length:",
        prescription.medicalExams?.length
      );
      // System Examinations
      console.log("Original CNS Examination:", prescription.cnsExamination);
      console.log(
        "Original Cardiovascular Examination:",
        prescription.cardiovascularExamination
      );
      console.log(
        "Original Respiratory Examination:",
        prescription.respiratoryExamination
      );
      console.log(
        "Original Gastrointestinal Examination:",
        prescription.gastrointestinalExamination
      );
      console.log(
        "Original Musculoskeletal Examination:",
        prescription.musculoskeletalExamination
      );
      console.log(
        "Original Genitourinary Examination:",
        prescription.genitourinaryExamination
      );
      console.log(
        "Original Dermatological Examination:",
        prescription.dermatologicalExamination
      );
      console.log("Original ENT Examination:", prescription.entExamination);
      console.log(
        "Original Ophthalmological Examination:",
        prescription.ophthalmologicalExamination
      );

      const voicePrescription = convertToVoicePrescription(prescription);

      console.log(
        "Voice prescription medicalExams:",
        voicePrescription.medicalExams
      );
      console.log(
        "Voice prescription medicalExams length:",
        voicePrescription.medicalExams?.length
      );
      // System Examinations in Voice Prescription
      console.log("Voice CNS Examination:", voicePrescription.cnsExamination);
      console.log(
        "Voice Cardiovascular Examination:",
        voicePrescription.cardiovascularExamination
      );
      console.log(
        "Voice Respiratory Examination:",
        voicePrescription.respiratoryExamination
      );
      console.log(
        "Voice Gastrointestinal Examination:",
        voicePrescription.gastrointestinalExamination
      );
      console.log(
        "Voice Musculoskeletal Examination:",
        voicePrescription.musculoskeletalExamination
      );
      console.log(
        "Voice Genitourinary Examination:",
        voicePrescription.genitourinaryExamination
      );
      console.log(
        "Voice Dermatological Examination:",
        voicePrescription.dermatologicalExamination
      );
      console.log("Voice ENT Examination:", voicePrescription.entExamination);
      console.log(
        "Voice Ophthalmological Examination:",
        voicePrescription.ophthalmologicalExamination
      );

      await downloadPrescriptionPDF(voicePrescription);

      console.log("=== PDF Generation Complete ===");
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (prescriptionId: string, patientName: string) => {
    if (
      confirm(
        `آیا از حذف نسخه بیمار "${patientName}" اطمینان دارید؟ این عمل غیرقابل بازگشت است.`
      )
    ) {
      onDelete(prescriptionId);
    }
  };

  return [
    {
      accessorKey: "patientName",
      header: "بیمار",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate max-w-[120px]">
              {row.original.patientName}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                {row.original.patientAge} سال
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {row.original.patientGender}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "patientAge",
      header: "سن",
      cell: ({ row }) => (
        <div className="text-center">{row.original.patientAge || "-"}</div>
      ),
    },
    {
      accessorKey: "patientGender",
      header: "جنسیت",
      cell: ({ row }) => (
        <div className="text-center">{row.original.patientGender || "-"}</div>
      ),
    },
    {
      accessorKey: "prescriptionDate",
      header: "تاریخ",
      cell: ({ row }) => {
        const date = row.original.prescriptionDate
          ? new Date(row.original.prescriptionDate)
          : new Date();
        const isToday = date.toDateString() === new Date().toDateString();
        return (
          <div className="flex flex-col items-center gap-1">
            <div
              className={`flex items-center gap-2 text-sm ${
                isToday ? "text-primary font-semibold" : "text-foreground"
              }`}
            >
              <Calendar
                className={`h-4 w-4 ${
                  isToday ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span className="font-medium">
                {formatJalali(date, "yyyy/MM/dd")}
              </span>
            </div>
            {isToday && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                امروز
              </span>
            )}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.prescriptionDate
          ? new Date(rowA.original.prescriptionDate).getTime()
          : 0;
        const dateB = rowB.original.prescriptionDate
          ? new Date(rowB.original.prescriptionDate).getTime()
          : 0;
        return dateA - dateB;
      },
    },
    {
      accessorKey: "medicines",
      header: "داروها",
      cell: ({ row }) => {
        const medicines = row.original.medicines || [];
        const medicationCount = medicines.length;
        const getMedicineLevel = (count: number) => {
          if (count === 0)
            return {
              level: "بدون دارو",
              color: "bg-gray-100 text-gray-600",
              icon: "",
            };
          if (count <= 2)
            return {
              level: "کم",
              color: "bg-green-100 text-green-700",
              icon: "💊",
            };
          if (count <= 4)
            return {
              level: "متوسط",
              color: "bg-yellow-100 text-yellow-700",
              icon: "💊💊",
            };
          return {
            level: "زیاد",
            color: "bg-red-100 text-red-700",
            icon: "💊💊💊",
          };
        };
        const medicineInfo = getMedicineLevel(medicationCount);

        return (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{medicineInfo.icon}</span>
              <span className="text-2xl font-bold text-foreground">
                {medicationCount}
              </span>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${medicineInfo.color}`}
            >
              {medicineInfo.level}
            </span>
            {medicationCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>دارو</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => {
        const status = row.original.status || "active";
        const statusConfig = {
          active: {
            label: "فعال",
            color: "bg-emerald-100 text-emerald-800 border-emerald-200",
            icon: "✓",
            description: "نسخه فعال و قابل استفاده",
          },
          completed: {
            label: "تکمیل شده",
            color: "bg-blue-100 text-blue-800 border-blue-200",
            icon: "✓",
            description: "درمان تکمیل شده",
          },
          cancelled: {
            label: "لغو شده",
            color: "bg-red-100 text-red-800 border-red-200",
            icon: "✗",
            description: "نسخه لغو شده",
          },
          draft: {
            label: "پیش‌نویس",
            color: "bg-amber-100 text-amber-800 border-amber-200",
            icon: "✎",
            description: "پیش‌نویس ذخیره نشده",
          },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
          label: status,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "?",
          description: "وضعیت نامشخص",
        };

        return (
          <div className="flex flex-col items-center gap-1">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${config.color}`}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </div>
            <span
              className="text-xs text-muted-foreground text-center max-w-[80px] truncate"
              title={config.description}
            >
              {config.description}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "عملیات",
      cell: ({ row }) => {
        const prescription = row.original;
        const isDownloading = downloadingId === prescription.id;

        return (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(prescription)}
              className="flex items-center gap-1 h-8 px-3 text-xs sm:text-sm hover:bg-primary/10 hover:border-primary/20 transition-colors"
            >
              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(prescription)}
              disabled={isDownloading}
              className="flex items-center gap-1 h-8 px-3 text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950/20 transition-colors"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-current border-b-2"></div>
                  <span className="sr-only">در حال دانلود...</span>
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">PDF</span>
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleDelete(prescription.id, prescription.patientName)
              }
              className="flex items-center gap-1 h-8 px-3 text-xs sm:text-sm hover:bg-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">حذف</span>
            </Button>
          </div>
        );
      },
    },
  ];
};
