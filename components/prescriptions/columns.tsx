// components/prescriptions/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Prescription } from "../../types/prescription";
import {
  Prescription as DbPrescription,
  Medicine as DbMedicine,
} from "../../db/schema";
import { Button } from "@/components/ui/button";
import { Download, Eye, Calendar, User, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { format as formatJalali } from "date-fns-jalali";
import { downloadPrescriptionPDF } from "../../utils/generatePrescriptionPDF";
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

  // Convert custom Prescription type to database Prescription type
  const convertToDbPrescription = (
    prescription: Prescription
  ): DbPrescription & { medicines: DbMedicine[] } => {
    // Ensure required string fields for notNull() database constraints
    const safeUserId = prescription.userId || "unknown-user";
    const safePatientName = prescription.patientName || "نامشخص";
    const safeDiagnosis = prescription.diagnosis || "تشخیص نشده";
    const safeDoctorName = prescription.doctorName || "دکتر";

    return {
      id: prescription.id,
      userId: safeUserId,
      patientName: safePatientName,
      patientAge: prescription.patientAge || null,
      patientGender: prescription.patientGender || null,
      patientPhone: prescription.patientPhone || null,
      patientAddress: prescription.patientAddress || null,
      diagnosis: safeDiagnosis,
      chiefComplaint: prescription.chiefComplaint || null,
      historyOfPresentIllness: prescription.historyOfPresentIllness || null,
      physicalExamination: prescription.physicalExamination || null,
      differentialDiagnosis: prescription.differentialDiagnosis || null,
      pulseRate: prescription.pulseRate || null,
      bloodPressure: prescription.bloodPressure || null,
      temperature: prescription.temperature || null,
      respiratoryRate: prescription.respiratoryRate || null,
      oxygenSaturation: prescription.oxygenSaturation || null,
      allergies: prescription.allergies || [],
      currentMedications: prescription.currentMedications || [],
      pastMedicalHistory: prescription.pastMedicalHistory || null,
      familyHistory: prescription.familyHistory || null,
      socialHistory: prescription.socialHistory || null,
      instructions: prescription.instructions || "",
      followUp: prescription.followUp || null,
      restrictions: prescription.restrictions || null,
      doctorName: safeDoctorName,
      doctorLicenseNumber: prescription.doctorLicenseNumber || null,
      clinicName: prescription.clinicName || null,
      clinicAddress: prescription.clinicAddress || null,
      doctorFree: prescription.doctorFree || null,
      prescriptionDate: new Date(prescription.prescriptionDate || new Date()),
      prescriptionNumber: prescription.prescriptionNumber || null,
      source: prescription.source || null,
      status: prescription.status || "active",
      createdAt: new Date(prescription.createdAt || Date.now()),
      updatedAt: new Date(prescription.updatedAt || Date.now()),
      aiConfidence: prescription.aiConfidence || null,
      aiModelUsed: prescription.aiModelUsed || null,
      processingTime: prescription.processingTime || null,
      rawAiResponse: prescription.rawAiResponse || null,
      medicines: prescription.medicines.map((med) => ({
        id: med.id,
        prescriptionId: med.prescriptionId,
        medicine: med.medicine,
        dosage: med.dosage,
        form: med.form || null,
        frequency: med.frequency,
        duration: med.duration,
        route: med.route || null,
        timing: med.timing || null,
        withFood: med.withFood || false,
        instructions: med.instructions || null,
        notes: med.notes || null,
        createdAt: new Date(med.createdAt || Date.now()),
        updatedAt: new Date(med.updatedAt || Date.now()),
      })),
    };
  };

  const handleDownload = async (prescription: Prescription) => {
    try {
      setDownloadingId(prescription.id);
      const dbPrescription = convertToDbPrescription(prescription);
      await downloadPrescriptionPDF(dbPrescription);
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
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.original.patientName}</span>
        </div>
      ),
    },
    {
      accessorKey: "diagnosis",
      header: "تشخیص",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.diagnosis}>
          {row.original.diagnosis}
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
            <Calendar className="h-4 w-4 text-gray-500" />
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
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
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
          active: { label: "فعال", color: "bg-green-100 text-green-800" },
          completed: { label: "تکمیل شده", color: "bg-blue-100 text-blue-800" },
          cancelled: { label: "لغو شده", color: "bg-red-100 text-red-800" },
          draft: { label: "پیش‌نویس", color: "bg-yellow-100 text-yellow-800" },
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
              className="flex items-center gap-1 h-8"
            >
              <Eye className="h-4 w-4" />
              جزئیات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(prescription)}
              disabled={isDownloading}
              className="flex items-center gap-1 h-8"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                  ...
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
              className="flex items-center gap-1 h-8"
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
