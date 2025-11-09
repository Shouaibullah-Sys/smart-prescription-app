// components/PrescriptionResult.tsx

"use client";

import { useState } from "react";
import { Prescription } from "../types/prescription";

interface PrescriptionResultProps {
  prescription: Prescription;
  onEdit: () => void;
}

export default function PrescriptionResult({
  prescription,
  onEdit,
}: PrescriptionResultProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = async () => {
    const text = formatPrescriptionText(prescription);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrescriptionText = (prescription: Prescription): string => {
    let text = `بیمار: ${prescription.patientName}\n`;
    text += `تشخیص: ${prescription.diagnosis}\n\n`;
    text += "نسخه:\n";

    prescription.medicines.forEach((med, index) => {
      text += `${index + 1}. ${med.medicine} ${med.dosage}\n`;
      text += `   مقدار مصرف: ${med.frequency}\n`;
      text += `   مدت مصرف: ${med.duration}\n`;
      if (med.notes) {
        text += `   توضیحات: ${med.notes}\n`;
      }
      text += "\n";
    });

    return text;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">نسخه تولید شده</h3>
        <div className="flex gap-2">
          <button onClick={copyToClipboard} className="btn-secondary text-sm">
            {copied ? "کپی شد!" : "کپی نسخه"}
          </button>
          <button onClick={onEdit} className="btn-primary text-sm">
            ویرایش مجدد
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              نام بیمار:
            </label>
            <p className="text-lg text-gray-900">{prescription.patientName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">تشخیص:</label>
            <p className="text-lg text-gray-900">{prescription.diagnosis}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">داروها</h4>
        {prescription.medicines.map((medicine, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium text-gray-900">
                {index + 1}. {medicine.medicine} {medicine.dosage}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
              <div>
                <span className="font-medium">مقدار مصرف:</span>
                <p>{medicine.frequency}</p>
              </div>
              <div>
                <span className="font-medium">مدت مصرف:</span>
                <p>{medicine.duration}</p>
              </div>
              {medicine.notes && (
                <div>
                  <span className="font-medium">توضیحات:</span>
                  <p>{medicine.notes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800 text-center">
          💡 این نسخه توسط هوش مصنوعی تولید شده است. لطفاً قبل از استفاده توسط
          پزشک بررسی شود.
        </p>
      </div>
    </div>
  );
}
