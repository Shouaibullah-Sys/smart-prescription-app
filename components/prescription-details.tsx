// components/prescription-details.tsx
"use client";

import { Prescription, FormMedicine } from "@/types/prescription";
import {
  Prescription as DbPrescription,
  Medicine as DbMedicine,
} from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Download, Calendar, User, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { downloadPrescriptionPDF } from "@/utils/generatePrescriptionPDF";
import { useState } from "react";

interface PrescriptionDetailsProps {
  prescription: Prescription;
  onClose: () => void;
}

export function PrescriptionDetails({
  prescription,
  onClose,
}: PrescriptionDetailsProps) {
  const [downloading, setDownloading] = useState(false);

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

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const dbPrescription = convertToDbPrescription(prescription);
      await downloadPrescriptionPDF(dbPrescription);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      alert("خطا در تولید PDF. لطفاً دوباره تلاش کنید.");
    } finally {
      setDownloading(false);
    }
  };

  const displayField = (value: any, placeholder: string = "ثبت نشده") => {
    return value || placeholder;
  };

  // Safe access to prescription array with fallback
  const medicines = prescription.medicines || [];

  // Safe access to arrays that might be null
  const allergies = prescription.allergies || [];
  const currentMedications = prescription.currentMedications || [];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {format(
              new Date(prescription.prescriptionDate || new Date()),
              "PPPP",
              {
                locale: faIR,
              }
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            کد نسخه: {prescription.id.slice(0, 8)}...
          </div>
        </div>
        <Button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2"
        >
          {downloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-300 "></div>
              در حال تولید...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              دانلود PDF
            </>
          )}
        </Button>
      </div>

      {/* Patient Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">اطلاعات بیمار</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">نام:</span>{" "}
              {prescription.patientName}
            </div>
            <div>
              <span className="font-medium">سن:</span>{" "}
              {displayField(prescription.patientAge)}
            </div>
            <div>
              <span className="font-medium">جنسیت:</span>{" "}
              {displayField(prescription.patientGender)}
            </div>
            {prescription.patientPhone && (
              <div>
                <span className="font-medium">تلفن:</span>{" "}
                {prescription.patientPhone}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">علائم حیاتی</h3>
          <div className="space-y-2 text-sm">
            {prescription.pulseRate && (
              <div>
                <span className="font-medium">نبض:</span>{" "}
                {prescription.pulseRate}
              </div>
            )}
            {prescription.bloodPressure && (
              <div>
                <span className="font-medium">فشار خون:</span>{" "}
                {prescription.bloodPressure}
              </div>
            )}
            {prescription.temperature && (
              <div>
                <span className="font-medium">دما:</span>{" "}
                {prescription.temperature}
              </div>
            )}
            {prescription.respiratoryRate && (
              <div>
                <span className="font-medium">معدل تنفس:</span>{" "}
                {prescription.respiratoryRate}
              </div>
            )}
            {prescription.oxygenSaturation && (
              <div>
                <span className="font-medium">اشباع اکسیژن:</span>{" "}
                {prescription.oxygenSaturation}%
              </div>
            )}
            {!prescription.pulseRate &&
              !prescription.bloodPressure &&
              !prescription.temperature &&
              !prescription.respiratoryRate &&
              !prescription.oxygenSaturation && (
                <div className="text-gray-500">ثبت نشده</div>
              )}
          </div>
        </div>

        <div className="p-4 rounded-lg">
          <h3 className="font-semibold text-red-900 mb-2">تشخیص</h3>
          <p className="text-sm">{prescription.diagnosis}</p>
          {prescription.differentialDiagnosis && (
            <div className="mt-2">
              <span className="font-medium text-sm">تشخیص تفریقی:</span>
              <p className="text-sm mt-1">
                {prescription.differentialDiagnosis}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Information */}
      {(prescription.chiefComplaint ||
        prescription.historyOfPresentIllness ||
        prescription.physicalExamination) && (
        <div className="p-4 rounded-lg border border-indigo-300">
          <h3 className="font-semibold text-indigo-900 mb-3">
            اطلاعات کلینیکی
          </h3>
          <div className="space-y-3 text-sm">
            {prescription.chiefComplaint && (
              <div>
                <span className="font-medium">شکایت اصلی:</span>
                <p className="mt-1">{prescription.chiefComplaint}</p>
              </div>
            )}
            {prescription.historyOfPresentIllness && (
              <div>
                <span className="font-medium">تاریخچه بیماری فعلی:</span>
                <p className="mt-1">{prescription.historyOfPresentIllness}</p>
              </div>
            )}
            {prescription.physicalExamination && (
              <div>
                <span className="font-medium">معاینه فیزیکی:</span>
                <p className="mt-1">{prescription.physicalExamination}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medications */}
      <div className=" border rounded-lg border-indigo-300">
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            داروهای تجویز شده ({medicines.length})
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {medicines.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              هیچ دارویی برای این نسخه ثبت نشده است.
            </div>
          ) : (
            medicines.map((medicine: FormMedicine, index: number) => (
              <div
                key={medicine.id || index}
                className="border border-indigo-300 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg">
                    {index + 1}. {medicine.medicine} {medicine.dosage}
                  </h4>
                  {medicine.form && (
                    <span className=" dark:text-indigo-300 text-xs font-medium px-2.5 py-0.5 rounded">
                      {medicine.form}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">مقدار مصرف:</span>{" "}
                    {medicine.frequency}
                  </div>
                  <div>
                    <span className="font-medium">مدت مصرف:</span>{" "}
                    {medicine.duration}
                  </div>
                  {medicine.route && (
                    <div>
                      <span className="font-medium">طریقۀ مصرف:</span>{" "}
                      {medicine.route}
                    </div>
                  )}
                  {medicine.timing && (
                    <div>
                      <span className="font-medium">زمان مصرف:</span>{" "}
                      {medicine.timing}
                    </div>
                  )}
                  {medicine.withFood && (
                    <div className="md:col-span-2">
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                        همراه با غذا مصرف شود
                      </span>
                    </div>
                  )}
                  {medicine.instructions && (
                    <div className="md:col-span-2">
                      <span className="font-medium">دستورات مصرف:</span>
                      <p className="mt-1 text-gray-700">
                        {medicine.instructions}
                      </p>
                    </div>
                  )}
                  {medicine.notes && (
                    <div className="md:col-span-2">
                      <span className="font-medium">توضیحات:</span>
                      <p className="mt-1 text-gray-700">{medicine.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(prescription.instructions ||
          prescription.followUp ||
          prescription.restrictions) && (
          <div className="p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-3">
              دستورات و پیگیری
            </h3>
            <div className="space-y-3 text-sm">
              {prescription.instructions && (
                <div>
                  <span className="font-medium">دستورات عمومی:</span>
                  <p className="mt-1">{prescription.instructions}</p>
                </div>
              )}
              {prescription.followUp && (
                <div>
                  <span className="font-medium">مراجعه بعدی:</span>
                  <p className="mt-1">{prescription.followUp}</p>
                </div>
              )}
              {prescription.restrictions && (
                <div>
                  <span className="font-medium">محدودیت‌ها:</span>
                  <p className="mt-1">{prescription.restrictions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(prescription.doctorName || prescription.clinicName) && (
          <div className="p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-3">اطلاعات پزشک</h3>
            <div className="space-y-2 text-sm">
              {prescription.doctorName && (
                <div>
                  <span className="font-medium">پزشک:</span>{" "}
                  {prescription.doctorName}
                </div>
              )}
              {prescription.clinicName && (
                <div>
                  <span className="font-medium">کلینیک:</span>{" "}
                  {prescription.clinicName}
                </div>
              )}
              {prescription.doctorLicenseNumber && (
                <div>
                  <span className="font-medium">شماره پروانه:</span>{" "}
                  {prescription.doctorLicenseNumber}
                </div>
              )}
              {prescription.clinicAddress && (
                <div>
                  <span className="font-medium">آدرس کلینیک:</span>{" "}
                  {prescription.clinicAddress}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Medical History */}
      {(allergies.length > 0 ||
        currentMedications.length > 0 ||
        prescription.pastMedicalHistory ||
        prescription.familyHistory ||
        prescription.socialHistory) && (
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-900 mb-3">سابقه پزشکی</h3>
          <div className="space-y-3 text-sm">
            {allergies.length > 0 && (
              <div>
                <span className="font-medium">حساسیت‌ها:</span>
                <p className="mt-1">{allergies.join(", ")}</p>
              </div>
            )}
            {currentMedications.length > 0 && (
              <div>
                <span className="font-medium">داروهای فعلی:</span>
                <p className="mt-1">{currentMedications.join(", ")}</p>
              </div>
            )}
            {prescription.pastMedicalHistory && (
              <div>
                <span className="font-medium">سابقه بیماری‌ها:</span>
                <p className="mt-1">{prescription.pastMedicalHistory}</p>
              </div>
            )}
            {prescription.familyHistory && (
              <div>
                <span className="font-medium">سابقه فامیلی:</span>
                <p className="mt-1">{prescription.familyHistory}</p>
              </div>
            )}
            {prescription.socialHistory && (
              <div>
                <span className="font-medium">سابقه اجتماعی:</span>
                <p className="mt-1">{prescription.socialHistory}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Information */}
      {(prescription.aiConfidence ||
        prescription.aiModelUsed ||
        prescription.processingTime) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            اطلاعات هوش مصنوعی
          </h3>
          <div className="space-y-2 text-sm">
            {prescription.aiConfidence && (
              <div>
                <span className="font-medium">سطح اطمینان:</span>{" "}
                {prescription.aiConfidence}
              </div>
            )}
            {prescription.aiModelUsed && (
              <div>
                <span className="font-medium">مدل استفاده شده:</span>{" "}
                {prescription.aiModelUsed}
              </div>
            )}
            {prescription.processingTime && (
              <div>
                <span className="font-medium">زمان پردازش:</span>{" "}
                {prescription.processingTime} میلی‌ثانیه
              </div>
            )}
            {prescription.source && (
              <div>
                <span className="font-medium">منبع:</span> {prescription.source}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          بستن
        </Button>
      </div>
    </div>
  );
}
