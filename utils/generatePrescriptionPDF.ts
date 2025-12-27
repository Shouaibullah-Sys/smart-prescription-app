// utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import "../vazirmatn-normal.js"; // Unicode font (Vazirmatn) already converted to JS

export interface Medication {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  form?: string;
  route?: string;
  timing?: string;
  withFood?: boolean;
  notes?: string;
}

export interface VoicePrescription {
  _id: string;
  patientName: string;
  patientAge?: string;
  patientGender?: string;
  patientPhone?: string;
  patientAddress?: string;
  allergies?: string[];
  currentMedications?: string[];
  medicationUsage?: string; // Legacy field
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  chiefComplaint?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  pulseRate?: string;
  heartRate?: string;
  bloodPressure?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  physicalExam?: string;
  medicalExams?: string[];
  examNotes?: string;
  medicines: Medication[];
  instructions?: string;
  followUp?: string;
  restrictions?: string;
  doctorName: string;
  doctorLicenseNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  date: string;
  transcription?: string;
  source?: string;
  status?: string;
}

/**
 * Helper function to format vital signs value or return "N/A" if empty
 */
function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
}

/**
 * Helper function to get all vital signs in a formatted string
 */
function getVitalSignsString(prescription: VoicePrescription): string {
  const vitals = [
    `PR: ${formatVitalValue(prescription.pulseRate)} bpm`,
    `BP: ${formatVitalValue(prescription.bloodPressure)}`,
    `HR: ${formatVitalValue(prescription.heartRate)} bpm`,
    `Temp: ${formatVitalValue(prescription.temperature)}°C`,
    `RP: ${formatVitalValue(prescription.respiratoryRate)}/min`,
    `SpO₂: ${formatVitalValue(prescription.oxygenSaturation)}%`,
    `Weight: ${formatVitalValue(prescription.weight)} kg`,
    `Height: ${formatVitalValue(prescription.height)} cm`,
    `BMI: ${formatVitalValue(prescription.bmi)}`,
  ];

  return vitals.join(" | ");
}

/**
 * Helper function to get patient information in one line
 */
function getPatientInfoString(prescription: VoicePrescription): string {
  const parts = [
    `Name: ${prescription.patientName || "N/A"}`,
    `Age: ${prescription.patientAge || "N/A"}`,
    `Gender: ${prescription.patientGender || "N/A"}`,
    `Phone: ${prescription.patientPhone || "N/A"}`,
    `Status: ${prescription.status || "N/A"}`,
    `Date: ${
      prescription.date
        ? formatJalali(new Date(prescription.date), "yyyy/MM/dd")
        : formatJalali(new Date(), "yyyy/MM/dd")
    }`,
  ];

  return parts.join(" | ");
}

/**
 * Helper function to format medication for table display (single line)
 */
function formatMedicationForTable(med: Medication, index: number): string {
  const parts = [
    `${index + 1}. ${med.medicine || "N/A"}`,
    `Dose: ${med.dosage || "N/A"}`,
    `Freq: ${med.frequency || "N/A"}`,
    `Dur: ${med.duration || "N/A"}`,
  ];

  return parts.join(" | ");
}

/**
 * Check if text contains Persian/Arabic characters
 */
function hasPersianOrArabic(text: string): boolean {
  // Persian/Arabic Unicode ranges
  const persianRange =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRange.test(text);
}

/**
 * Helper function to add Persian text with fallback fonts
 */
function addPersianTextToPDF(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: any
) {
  const style = options?.style || "normal";
  const fontSize = options?.fontSize || doc.getFontSize();

  // Save current font size
  const currentFontSize = doc.getFontSize();

  // Set font size if specified
  if (options?.fontSize) {
    doc.setFontSize(fontSize);
  }

  try {
    // First try with Vazirmatn
    doc.setFont("vazirmatn", style);
    doc.text(text, x, y, options);
  } catch (e) {
    // Fallback to built-in font that supports Arabic/Persian
    console.warn(
      "Vazirmatn failed, using fallback font for:",
      text.substring(0, 20)
    );

    // Try 'arabic' font (if available in your jsPDF setup)
    try {
      doc.setFont("arabic", style);
      doc.text(text, x, y, options);
    } catch (e2) {
      // Last resort: use default font
      doc.setFont("helvetica", style);
      doc.text(text, x, y, options);
    }
  }

  // Restore font size if it was changed
  if (options?.fontSize) {
    doc.setFontSize(currentFontSize);
  }
}

/**
 * Elegant bilingual (English + Dari) PDF prescription with themed design.
 */
export async function generatePrescriptionPDF(
  prescription: VoicePrescription
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 10;

  // --- THEME COLORS ---
  const primary = [42, 94, 168];
  const accent = [66, 133, 244];
  const bgLight = [244, 247, 252];
  const textDark = [40, 40, 40];

  // --- WATERMARK BACKGROUND ---
  // Load and add logo as watermark
  const logoUrl = "/logo.png";
  let logoBase64: string | undefined = undefined;

  try {
    const response = await fetch(logoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.statusText}`);
    }
    const blob = await response.blob();
    logoBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    // Add watermark to background
    // Set watermark opacity (0.1 = 10% opacity)
    (doc as any).setGState(new (doc as any).GState({ opacity: 0.1 }));

    // Calculate watermark dimensions and position
    const watermarkWidth = 400;
    const watermarkHeight = 400;
    const watermarkX = (pageWidth - watermarkWidth) / 2;
    const watermarkY = (pageHeight - watermarkHeight) / 2;

    // Add watermark image
    doc.addImage(
      logoBase64,
      "PNG",
      watermarkX,
      watermarkY,
      watermarkWidth,
      watermarkHeight
    );

    // Reset opacity for other content
    (doc as any).setGState(new (doc as any).GState({ opacity: 1.0 }));
  } catch (error) {
    console.warn("Could not load watermark logo:", error);
    // Continue without watermark if logo can't be loaded
  }

  // --- NEW PROFESSIONAL HEADER - ATTACHED TO TOP ---

  // Load logo for header (reuse if already loaded, or load separately)
  let headerLogo: string;
  try {
    if (logoBase64) {
      headerLogo = logoBase64;
    } else {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      headerLogo = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.warn("Could not load header logo:", error);
    // Continue without header logo if it can't be loaded
    headerLogo = "";
  }

  // Top decorative line at the very top
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(2);
  doc.line(40, y, pageWidth - 40, y);

  y += 15;

  // Logo in center
  if (headerLogo) {
    const logoW = 70;
    const logoH = 70;
    const logoX = pageWidth / 2 - logoW / 2;
    const logoY = y;
    doc.addImage(headerLogo, "PNG", logoX, logoY, logoW, logoH);
  }

  // Left side - English information
  const leftStartX = 50;
  let leftY = y + 15;

  // Hospital/Clinic Name (English) - Bold
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(prescription.clinicName || "Medical Center", leftStartX, leftY);

  leftY += 18;

  // Doctor Name (English)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(prescription.doctorName, leftStartX, leftY);

  leftY += 14;

  // License Number (if available)
  if (prescription.doctorLicenseNumber) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(`License: ${prescription.doctorLicenseNumber}`, leftStartX, leftY);
    leftY += 12;
  }

  // Qualifications (English) - Multiple lines
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  const englishQualifications = [
    "Consultant Physician",
    "Medical Doctor (MD)",
    "Licensed Healthcare Provider",
  ];

  englishQualifications.forEach((line, index) => {
    doc.text(line, leftStartX, leftY + index * 9);
  });

  // Right side - Persian information
  const rightStartX = pageWidth - 50;
  let rightY = y + 15;

  // Hospital/Clinic Name (Persian) - Bold
  doc.setTextColor(primary[0], primary[1], primary[2]);
  const clinicNamePersian =
    prescription.clinicName === "Specialty Clinic"
      ? "کلینیک تخصصی"
      : prescription.clinicName === "Imam Reza Hospital"
      ? "شفاخانه امام رضا"
      : prescription.clinicName === "Noor Medical Center"
      ? "مرکز طبی نور"
      : prescription.clinicName === "Children's Hospital"
      ? "شفاخانه کودکان"
      : "مرکز طبی";
  addPersianTextToPDF(doc, clinicNamePersian, rightStartX, rightY, {
    align: "right",
    style: "normal",
    fontSize: 16,
  });

  rightY += 18;

  // Doctor Name (Persian)
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const doctorNamePersian =
    prescription.doctorName === "Dr. Ahmad Farid"
      ? "داکتر احمد فرید"
      : prescription.doctorName === "Dr. Maryam Hosseini"
      ? "داکتر مریم حسینی"
      : prescription.doctorName === "Dr. Ali Rezaei"
      ? "داکتر علی رضایی"
      : prescription.doctorName === "Dr. Sara Mohammadi"
      ? "داکتر سارا محمدی"
      : prescription.doctorName;
  addPersianTextToPDF(doc, doctorNamePersian, rightStartX, rightY, {
    align: "right",
    style: "normal",
    fontSize: 12,
  });

  rightY += 14;

  // License Number (Persian)
  if (prescription.doctorLicenseNumber) {
    doc.setFontSize(8);
    addPersianTextToPDF(
      doc,
      `جواز: ${prescription.doctorLicenseNumber}`,
      rightStartX,
      rightY,
      {
        align: "right",
        style: "normal",
        fontSize: 8,
      }
    );
    rightY += 12;
  }

  // Qualifications (Persian) - Multiple lines
  doc.setFontSize(8);

  const persianQualifications = [
    "داکتر معالج متخصص",
    "دکتر طب (MD)",
    "ارائه دهنده مجاز خدمات صحی",
  ];

  persianQualifications.forEach((line, index) => {
    addPersianTextToPDF(doc, line, rightStartX, rightY + index * 9, {
      align: "right",
      style: "normal",
      fontSize: 8,
    });
  });

  // Bottom decorative line
  y = y + (headerLogo ? 70 : 0) + 40;
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(1.5);
  doc.line(40, y, pageWidth - 40, y);

  y += 15;

  // === SECTIONS ===
  const drawSectionHeader = (en: string, fa: string) => {
    y += 25;
    // Accent bar
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(40, y - 16, 6, 24, "F");

    // Section box
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(40, y - 16, pageWidth - 80, 24, 6, 6, "FD");

    // Text
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(en, 60, y);
    addPersianTextToPDF(doc, fa, pageWidth - 60, y, {
      align: "right",
      style: "normal",
    });
    y += 12;
  };

  const addSeparator = () => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    y += 8;
    doc.line(55, y, pageWidth - 55, y);
    y += 8;
  };

  // --- PATIENT INFORMATION WITH PRESCRIPTION ID AND DATE ---
  y += 4;

  // Format date
  const formattedDate = prescription.date
    ? formatJalali(new Date(prescription.date), "yyyy/MM/dd")
    : formatJalali(new Date(), "yyyy/MM/dd");

  // First line: Prescription ID at the top
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("Prescription ID:", 60, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(prescription._id, 140, y);

  // Patient Information on one line
  y += 16;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text("Patient Information:", 60, y);

  // Calculate position for data
  const headerWidth = doc.getTextWidth("Patient Information:");
  const dataX = 60 + headerWidth + 10;

  // Build patient info string with all data
  const patientInfoParts = [
    `Name: ${prescription.patientName || "N/A"}`,
    `Age: ${prescription.patientAge || "N/A"}`,
    `Gender: ${prescription.patientGender || "N/A"}`,
    `Phone: ${prescription.patientPhone || "N/A"}`,
    `Status: ${prescription.status || "N/A"}`,
    `Date: ${formattedDate}`,
  ];

  const patientInfoString = patientInfoParts.join(" | ");

  // Determine which font to use for patient info
  const patientInfoContainsPersian = hasPersianOrArabic(patientInfoString);

  if (patientInfoContainsPersian) {
    addPersianTextToPDF(doc, patientInfoString, dataX, y, {
      style: "normal",
      fontSize: 9,
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(patientInfoString, dataX, y);
  }

  y += 14;

  addSeparator();

  // --- VITAL SIGNS & CLINICAL DATA ---
  const vitalSignsEnglish = getVitalSignsString(prescription);

  const hasVitalSigns = [
    prescription.pulseRate,
    prescription.bloodPressure,
    prescription.heartRate,
    prescription.temperature,
    prescription.respiratoryRate,
    prescription.oxygenSaturation,
    prescription.weight,
    prescription.height,
    prescription.bmi,
  ].some((v) => v && v.trim() !== "");

  const hasAllergies =
    prescription.allergies && prescription.allergies.length > 0;
  const hasCurrentMedications =
    (prescription.currentMedications &&
      prescription.currentMedications.length > 0) ||
    (prescription.medicationUsage &&
      prescription.medicationUsage.trim() !== "");

  if (hasVitalSigns || hasAllergies || hasCurrentMedications) {
    drawSectionHeader(
      "Vital Signs & Clinical Data",
      "علائم حیاتی و داده‌های بالینی"
    );
    y += 8;

    // Vital Signs - One line in English
    if (hasVitalSigns) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Vital Signs:", 60, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(vitalSignsEnglish, 60, (y += 14));

      y += 20;
    }

    // Allergies - with bilingual support
    if (hasAllergies) {
      const allergiesText = prescription.allergies?.join(", ") || "";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Allergies:", 60, y);

      const allergiesContainPersian = hasPersianOrArabic(allergiesText);

      if (allergiesContainPersian) {
        addPersianTextToPDF(doc, allergiesText, 60, (y += 14), {
          style: "normal",
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(allergiesText, 60, (y += 14));
      }

      addPersianTextToPDF(doc, "حساسیت:", pageWidth - 60, y, {
        align: "right",
        style: "normal",
      });

      y += 20;
    }

    // Current Medications - with bilingual support
    if (hasCurrentMedications) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Current Medications:", 60, y);

      // Handle both new array format and legacy string format
      let medicationsText = "";
      if (
        prescription.currentMedications &&
        prescription.currentMedications.length > 0
      ) {
        medicationsText = prescription.currentMedications.join(", ");
      } else if (prescription.medicationUsage) {
        medicationsText = prescription.medicationUsage;
      }

      const medicationUsageContainsPersian =
        hasPersianOrArabic(medicationsText);

      if (medicationUsageContainsPersian) {
        addPersianTextToPDF(doc, medicationsText, 60, (y += 14), {
          style: "normal",
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(medicationsText, 60, (y += 14));
      }

      addPersianTextToPDF(doc, "دواهای فعلی:", pageWidth - 60, y, {
        align: "right",
        style: "normal",
      });

      y += 20;
    }

    addSeparator();
  }

  // --- CHIEF COMPLAINT ---
  if (
    prescription.chiefComplaint &&
    prescription.chiefComplaint.trim() !== ""
  ) {
    drawSectionHeader("Chief Complaint", "شکایت اصلی");
    y += 10;

    const chiefComplaintContainsPersian = hasPersianOrArabic(
      prescription.chiefComplaint
    );

    const complaintLines = doc.splitTextToSize(
      prescription.chiefComplaint,
      pageWidth - 120
    );

    if (chiefComplaintContainsPersian) {
      complaintLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(doc, line, 60, y + index * 12, { style: "normal" });
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(complaintLines, 60, y);
    }

    y += complaintLines.length * 12 + 10;
    addSeparator();
  }

  // --- MEDICAL HISTORY ---
  const hasMedicalHistory =
    (prescription.pastMedicalHistory &&
      prescription.pastMedicalHistory.trim() !== "") ||
    (prescription.familyHistory && prescription.familyHistory.trim() !== "") ||
    (prescription.socialHistory && prescription.socialHistory.trim() !== "");

  if (hasMedicalHistory) {
    drawSectionHeader("Medical History", "تاریخچه طبی");
    y += 10;

    if (
      prescription.pastMedicalHistory &&
      prescription.pastMedicalHistory.trim() !== ""
    ) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Past Medical History:", 60, y);

      const pastHistoryLines = doc.splitTextToSize(
        prescription.pastMedicalHistory,
        pageWidth - 120
      );

      const pastHistoryContainsPersian = hasPersianOrArabic(
        prescription.pastMedicalHistory
      );

      if (pastHistoryContainsPersian) {
        pastHistoryLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(doc, line, 60, y + 14 + index * 12, {
            style: "normal",
          });
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(pastHistoryLines, 60, y + 14);
      }

      y += pastHistoryLines.length * 12 + 20;
    }

    if (
      prescription.familyHistory &&
      prescription.familyHistory.trim() !== ""
    ) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Family History:", 60, y);

      const familyHistoryLines = doc.splitTextToSize(
        prescription.familyHistory,
        pageWidth - 120
      );

      const familyHistoryContainsPersian = hasPersianOrArabic(
        prescription.familyHistory
      );

      if (familyHistoryContainsPersian) {
        familyHistoryLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(doc, line, 60, y + 14 + index * 12, {
            style: "normal",
          });
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(familyHistoryLines, 60, y + 14);
      }

      y += familyHistoryLines.length * 12 + 20;
    }

    if (
      prescription.socialHistory &&
      prescription.socialHistory.trim() !== ""
    ) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Social History:", 60, y);

      const socialHistoryLines = doc.splitTextToSize(
        prescription.socialHistory,
        pageWidth - 120
      );

      const socialHistoryContainsPersian = hasPersianOrArabic(
        prescription.socialHistory
      );

      if (socialHistoryContainsPersian) {
        socialHistoryLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(doc, line, 60, y + 14 + index * 12, {
            style: "normal",
          });
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(socialHistoryLines, 60, y + 14);
      }

      y += socialHistoryLines.length * 12 + 20;
    }

    addSeparator();
  }

  // --- PHYSICAL EXAMINATION ---
  if (prescription.physicalExam && prescription.physicalExam.trim() !== "") {
    drawSectionHeader("Physical Examination", "معاینه فزیکی");
    y += 10;

    const physicalExamContainsPersian = hasPersianOrArabic(
      prescription.physicalExam
    );

    const physicalExamLines = doc.splitTextToSize(
      prescription.physicalExam,
      pageWidth - 120
    );

    if (physicalExamContainsPersian) {
      physicalExamLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(doc, line, 60, y + index * 12, { style: "normal" });
      });
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(physicalExamLines, 60, y);
    }

    y += physicalExamLines.length * 12 + 10;
    addSeparator();
  }

  // --- MEDICAL EXAMS & TESTS ---
  const hasMedicalExams =
    (prescription.medicalExams && prescription.medicalExams.length > 0) ||
    (prescription.examNotes && prescription.examNotes.trim() !== "");

  if (hasMedicalExams) {
    drawSectionHeader("Laboratory Tests and Imaging", "آزمایشات و تصویربرداری");
    y += 10;

    if (prescription.medicalExams && prescription.medicalExams.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Ordered Tests:", 60, y);

      const testsText = prescription.medicalExams.join(", ");
      const testsContainPersian = hasPersianOrArabic(testsText);

      if (testsContainPersian) {
        addPersianTextToPDF(doc, testsText, 60, (y += 14), {
          style: "normal",
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(testsText, 60, (y += 14));
      }

      addPersianTextToPDF(doc, "آزمایشات درخواستی:", pageWidth - 60, y, {
        align: "right",
        style: "normal",
      });

      y += 20;
    }

    if (prescription.examNotes && prescription.examNotes.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Test Instructions:", 60, y);

      const examNotesLines = doc.splitTextToSize(
        prescription.examNotes,
        pageWidth - 120
      );

      const examNotesContainPersian = hasPersianOrArabic(
        prescription.examNotes
      );

      if (examNotesContainPersian) {
        examNotesLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(doc, line, 60, y + 14 + index * 12, {
            style: "normal",
          });
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(examNotesLines, 60, y + 14);
      }

      y += examNotesLines.length * 12 + 10;
    }

    addSeparator();
  }

  // --- PRESCRIBED MEDICATIONS (Table-like format with bilingual support) ---
  drawSectionHeader("Prescribed Medications", "دواهای تجویز شده");
  y += 8;

  const medications = prescription.medicines || [];

  if (medications.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No medications prescribed.", 60, (y += 14));
    addPersianTextToPDF(doc, "هیچ دوا تجویز نگردیده است.", pageWidth - 60, y, {
      align: "right",
      style: "normal",
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primary[0], primary[1], primary[2]);

    const headers = ["No.", "Medicine", "Dosage", "Frequency", "Duration"];
    doc.text(headers[0], 60, y);
    doc.text(headers[1], 90, y);
    doc.text(headers[2], 220, y);
    doc.text(headers[3], 310, y);
    doc.text(headers[4], 390, y);

    y += 12;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(60, y - 4, pageWidth - 60, y - 4);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);

    medications.forEach((med: Medication, index: number) => {
      if (y > pageHeight - 80) {
        doc.addPage();
        y = 80;
      }

      doc.setFont("helvetica", "normal");
      doc.text(`${index + 1}.`, 60, y);

      const medicineContainsPersian = hasPersianOrArabic(med.medicine || "");
      if (medicineContainsPersian) {
        addPersianTextToPDF(doc, med.medicine || "N/A", 90, y, {
          maxWidth: 120,
          style: "normal",
        });
      } else {
        doc.text(med.medicine || "N/A", 90, y, { maxWidth: 120 });
      }

      const dosageContainsPersian = hasPersianOrArabic(med.dosage || "");
      if (dosageContainsPersian) {
        addPersianTextToPDF(doc, med.dosage || "N/A", 220, y, {
          maxWidth: 80,
          style: "normal",
        });
      } else {
        doc.text(med.dosage || "N/A", 220, y, { maxWidth: 80 });
      }

      const frequencyContainsPersian = hasPersianOrArabic(med.frequency || "");
      if (frequencyContainsPersian) {
        addPersianTextToPDF(doc, med.frequency || "N/A", 310, y, {
          maxWidth: 70,
          style: "normal",
        });
      } else {
        doc.text(med.frequency || "N/A", 310, y, { maxWidth: 70 });
      }

      const durationContainsPersian = hasPersianOrArabic(med.duration || "");
      if (durationContainsPersian) {
        addPersianTextToPDF(doc, med.duration || "N/A", 390, y, {
          maxWidth: 70,
          style: "normal",
        });
      } else {
        doc.text(med.duration || "N/A", 390, y, { maxWidth: 70 });
      }

      if (med.instructions && med.instructions.trim() !== "") {
        y += 12;

        const instructionsContainPersian = hasPersianOrArabic(
          med.instructions || ""
        );

        if (instructionsContainPersian) {
          addPersianTextToPDF(doc, `Instructions: ${med.instructions}`, 90, y, {
            maxWidth: 300,
            style: "italic",
            fontSize: 8,
          });
        } else {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.text(`Instructions: ${med.instructions}`, 90, y, {
            maxWidth: 300,
          });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
        }
      }

      // Show additional medication details if available
      const additionalDetails = [];
      if (med.form && med.form.trim() !== "") {
        additionalDetails.push(`Form: ${med.form}`);
      }
      if (med.route && med.route.trim() !== "") {
        additionalDetails.push(`Route: ${med.route}`);
      }
      if (med.timing && med.timing.trim() !== "") {
        additionalDetails.push(`Timing: ${med.timing}`);
      }
      if (med.notes && med.notes.trim() !== "") {
        additionalDetails.push(`Notes: ${med.notes}`);
      }

      if (additionalDetails.length > 0) {
        y += 12;
        const detailsText = additionalDetails.join(" | ");
        const detailsContainPersian = hasPersianOrArabic(detailsText);

        if (detailsContainPersian) {
          addPersianTextToPDF(doc, detailsText, 90, y, {
            maxWidth: 350,
            style: "italic",
            fontSize: 7,
          });
        } else {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7);
          doc.setTextColor(textDark[0], textDark[1], textDark[2]);
          doc.text(detailsText, 90, y, {
            maxWidth: 350,
          });
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
        }
      }

      y += 16;
    });
  }
  addSeparator();

  // --- ADDITIONAL INSTRUCTIONS (with bilingual support) ---
  const hasAdditionalInstructions =
    (prescription.instructions && prescription.instructions.trim() !== "") ||
    (prescription.followUp && prescription.followUp.trim() !== "") ||
    (prescription.restrictions && prescription.restrictions.trim() !== "");

  if (hasAdditionalInstructions) {
    drawSectionHeader("Additional Instructions", "دستورات اضافی");
    y += 10;

    if (prescription.instructions && prescription.instructions.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("General Instructions:", 60, y);

      const instructionsContainPersian = hasPersianOrArabic(
        prescription.instructions
      );

      const instructionLines = doc.splitTextToSize(
        prescription.instructions,
        pageWidth - 120
      );

      if (instructionsContainPersian) {
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);

        instructionLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(doc, line, 60, y + 14 + index * 12, {
            style: "normal",
          });
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(instructionLines, 60, y + 14);
      }

      y += instructionLines.length * 12 + 20;
    }

    if (prescription.followUp && prescription.followUp.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Follow-up Time:", 60, y);

      const followUpContainPersian = hasPersianOrArabic(prescription.followUp);

      if (followUpContainPersian) {
        addPersianTextToPDF(doc, prescription.followUp, 60, (y += 14), {
          style: "normal",
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(prescription.followUp, 60, (y += 14));
      }

      addPersianTextToPDF(doc, "زمان مراجعه:", pageWidth - 60, y, {
        align: "right",
        style: "normal",
      });

      y += 20;
    }

    if (prescription.restrictions && prescription.restrictions.trim() !== "") {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("Restrictions and Precautions:", 60, y);

      const restrictionsContainPersian = hasPersianOrArabic(
        prescription.restrictions
      );

      const restrictionLines = doc.splitTextToSize(
        prescription.restrictions,
        pageWidth - 120
      );

      if (restrictionsContainPersian) {
        restrictionLines.forEach((line: string, index: number) => {
          addPersianTextToPDF(doc, line, 60, y + 14 + index * 12, {
            style: "normal",
          });
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        doc.text(restrictionLines, 60, y + 14);
      }

      y += restrictionLines.length * 12 + 10;
    }

    addSeparator();
  }

  // --- VOICE TRANSCRIPTION ---
  if (prescription.transcription) {
    drawSectionHeader("Voice Transcription", "رونوشت صوتی");
    y += 10;

    const transcriptionContainsPersian = hasPersianOrArabic(
      prescription.transcription
    );

    if (transcriptionContainsPersian) {
      doc.setFontSize(9);
      const transcriptionLines = doc.splitTextToSize(
        prescription.transcription,
        pageWidth - 120
      );
      transcriptionLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(doc, line, 60, y + index * 12, { style: "italic" });
      });
    } else {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      const transcriptionLines = doc.splitTextToSize(
        prescription.transcription,
        pageWidth - 120
      );
      doc.text(transcriptionLines, 60, y);
    }
    addSeparator();
  }

  // --- DOCTOR SIGNATURE ---
  drawSectionHeader("Medical Practitioner", "داکتر معالج");
  y += 20;

  const doctorNameContainsPersian = hasPersianOrArabic(prescription.doctorName);

  if (doctorNameContainsPersian) {
    addPersianTextToPDF(doc, prescription.doctorName, 60, y, {
      style: "bold",
      fontSize: 12,
    });
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(prescription.doctorName, 60, y);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Medical Practitioner", 60, (y += 14));

  addPersianTextToPDF(doc, prescription.doctorName, pageWidth - 60, y - 14, {
    align: "right",
    style: "normal",
  });
  addPersianTextToPDF(doc, "داکتر معالج", pageWidth - 60, y, {
    align: "right",
    style: "normal",
  });

  y += 40;
  doc.setDrawColor(90, 90, 90);
  doc.setLineWidth(0.5);
  doc.line(60, y, 220, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Signature & Stamp", 60, y + 10);

  // Footer
  const footerY = pageHeight - 60;
  const qrCodeSize = 40;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(pageWidth - 80, footerY - 10, qrCodeSize, qrCodeSize);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("QR Code", pageWidth - 60, footerY + 25, { align: "center" });
  doc.text("Verify", pageWidth - 60, footerY + 32, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "normal");

  // Add background for the digital prescription text
  const digitalText = "این یک نسخه دیجیتال تولید شده توسط کامپیوتر است.";
  try {
    doc.setFont("vazirmatn", "normal");
    const textWidth = doc.getTextWidth(digitalText);
    const fontSize = doc.getFontSize();
    const padding = 4;
    const bgWidth = textWidth + 2 * padding;
    const bgHeight = fontSize + 2 * padding;
    const bgX = (pageWidth - bgWidth) / 2;
    const bgY = footerY + 45 - padding - fontSize / 2;
    doc.setFillColor(250, 250, 250); // Light gray background
    doc.rect(bgX, bgY, bgWidth, bgHeight, "F");
  } catch (e) {
    console.warn("Could not add background for digital text:", e);
  }

  addPersianTextToPDF(doc, digitalText, pageWidth / 2, footerY + 45, {
    align: "center",
    style: "normal",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(primary[0], primary[1], primary[2]);
  doc.text(
    prescription.clinicName || "Medical Center",
    pageWidth / 2,
    footerY - 20,
    {
      align: "center",
    }
  );

  const clinicNamePersianFooter =
    prescription.clinicName === "Specialty Clinic"
      ? "کلینیک تخصصی"
      : prescription.clinicName === "Imam Reza Hospital"
      ? "شفاخانه امام رضا"
      : prescription.clinicName === "Noor Medical Center"
      ? "مرکز طبی نور"
      : prescription.clinicName === "Children's Hospital"
      ? "شفاخانه کودکان"
      : "مرکز طبی";
  addPersianTextToPDF(
    doc,
    clinicNamePersianFooter,
    pageWidth / 2,
    footerY - 10,
    {
      align: "center",
      style: "normal",
    }
  );

  // Save
  let prescriptionDate: Date;
  try {
    prescriptionDate = new Date(prescription.date);
    if (isNaN(prescriptionDate.getTime())) {
      prescriptionDate = new Date();
    }
  } catch (error) {
    prescriptionDate = new Date();
  }

  const fileName = `prescription-${prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${format(prescriptionDate, "yyyy-MM-dd")}.pdf`;

  doc.save(fileName);
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;
