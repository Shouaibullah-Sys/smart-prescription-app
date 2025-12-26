// components/prescriptions/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Prescription } from "../../types/prescription";
import { Button } from "@/components/ui/button";
import { Download, Eye, Calendar, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { format as formatJalali } from "date-fns-jalali";
import {
  downloadPrescriptionPDF,
  VoicePrescription,
} from "../../utils/generatePrescriptionPDF";
import { useState } from "react";

interface ColumnsProps {
  onViewDetails: (prescription: Prescription) => void;
  onDelete: (prescriptionId: string) => void;
}

export const useColumns = ({
  onViewDetails,
  onDelete,
}: ColumnsProps): ColumnDef<Prescription>[] => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Convert custom Prescription type to VoicePrescription type for PDF generation
  const convertToVoicePrescription = (
    prescription: Prescription
  ): VoicePrescription => {
    // Ensure required string fields
    const safeUserId = prescription.userId || "unknown-user";
    const safePatientName = prescription.patientName || "نامشخص";

    const safeDoctorName = prescription.doctorName || "دکتر";

    // Convert medications to Medication format
    const medications = prescription.medicines.map((med) => ({
      medicine: med.medicine,
      dosage: med.dosage,
      frequency: med.frequency || "",
      duration: med.duration || "",
      instructions: med.instructions || "",
      form: med.form,
      route: med.route,
      timing: med.timing,
      withFood: med.withFood || false,
      notes: med.notes,
    }));

    // Format date as string for VoicePrescription
    const prescriptionDate =
      prescription.prescriptionDate instanceof Date
        ? prescription.prescriptionDate.toISOString()
        : new Date(prescription.prescriptionDate || Date.now()).toISOString();

    return {
      _id: prescription.id,
      patientName: safePatientName,
      patientAge: prescription.patientAge || "نامشخص",
      patientGender: prescription.patientGender || "نامشخص",
      allergies: prescription.allergies || [],
      pulseRate: prescription.pulseRate || "",
      bloodPressure: prescription.bloodPressure || "",
      temperature: prescription.temperature || "",
      respiratoryRate: prescription.respiratoryRate || "",
      oxygenSaturation: prescription.oxygenSaturation || "",
      medicationUsage: (prescription.currentMedications || []).join(", "),
      relevantPastMedicalHistory: prescription.pastMedicalHistory || "",

      medicines: medications,
      instructions: prescription.instructions || "",
      doctorName: safeDoctorName,
      date: prescriptionDate,
      source: prescription.source || "manual",
      status: prescription.status || "active",
    };
  };

  const handleDownload = async (prescription: Prescription) => {
    try {
      setDownloadingId(prescription.id);
      const voicePrescription = convertToVoicePrescription(prescription);
      await downloadPrescriptionPDF(voicePrescription);
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
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.patientName}</span>
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
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{formatJalali(date, "yyyy/MM/dd")}</span>
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
      header: "تعداد داروها",
      cell: ({ row }) => {
        // Access the medicines field which contains the medicines array
        const medicines = row.original.medicines || [];
        return (
          <div className="text-center">
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-medium px-2 py-1 rounded-full">
              {medicines.length} دارو
            </span>
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
            color:
              "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200",
          },
          completed: {
            label: "تکمیل شده",
            color:
              "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
          },
          cancelled: {
            label: "لغو شده",
            color:
              "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200",
          },
          draft: {
            label: "پیش‌نویس",
            color:
              "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200",
          },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
          label: status,
          color: "bg-gray-100 text-gray-800",
        };

        return (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}
          >
            {config.label}
          </span>
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(prescription)}
              className="flex items-center gap-1 h-8 text-foreground hover:text-foreground hover:bg-accent"
            >
              <Eye className="h-4 w-4" />
              جزئیات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(prescription)}
              disabled={isDownloading}
              className="flex items-center gap-1 h-8 text-foreground hover:text-foreground hover:bg-accent"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-current border-b-2"></div>
                  <span className="sr-only">در حال دانلود...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  PDF
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                handleDelete(prescription.id, prescription.patientName)
              }
              className="flex items-center gap-1 h-8 hover:text-white"
            >
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          </div>
        );
      },
    },
  ];
};
