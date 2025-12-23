//utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";
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
  patientAge: string;
  patientGender: string;
  allergies: string[];
  pulseRate: string;
  medicationUsage: string;
  relevantPastMedicalHistory: string;
  diagnosis: string;
  medicines: Medication[];
  instructions: string;
  doctorName: string;
  date: string;
  transcription?: string;
  source: string;
  status: string;
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
  let y = 120;

  // --- THEME COLORS ---
  const primary = [42, 94, 168]; // deep blue
  const accent = [66, 133, 244]; // lighter blue
  const bgLight = [244, 247, 252];
  const textDark = [40, 40, 40];

  // --- LOGO ---
  const logoUrl = "/logo.png";
  const logo = await fetch(logoUrl)
    .then((r) => r.blob())
    .then(
      (b) =>
        new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.readAsDataURL(b);
        })
    );

  // --- HEADER ---
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageWidth, 120, "F");

  // Accent gradient line
  doc.setDrawColor(accent[0], accent[1], accent[2]);
  doc.setLineWidth(3);
  doc.line(0, 120, pageWidth, 120);

  // Logo (top-left)
  const logoW = 70;
  const logoH = 70;
  doc.addImage(logo, "PNG", 40, 15, logoW, logoH);

  // Watermark (faint)
  (doc as any).setGState(new (doc as any).GState({ opacity: 0.07 }));
  doc.addImage(
    logo,
    "PNG",
    pageWidth / 2 - 150,
    pageHeight / 2 - 150,
    300,
    300
  );
  (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

  // Header titles
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text("MEDICAL PRESCRIPTION", pageWidth / 2, 50, { align: "center" });

  doc.setFont("vazirmatn", "normal");
  doc.setFontSize(16);
  doc.text("نسخه طبی (سند رسمی)", pageWidth / 2, 80, { align: "center" });

  // Header info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text(`Prescription ID: ${prescription._id}`, 40, 105);
  doc.text(`Date: ${format(new Date(), "PPP")}`, pageWidth - 40, 105, {
    align: "right",
  });

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
    doc.setFont("vazirmatn", "normal");
    doc.text(fa, pageWidth - 60, y, { align: "right" });
    y += 12;
  };

  const addSeparator = () => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    y += 8;
    doc.line(55, y, pageWidth - 55, y);
    y += 8;
  };

  // --- PATIENT INFORMATION (Persian only) ---
  drawSectionHeader("", "معلومات مریض");
  y += 8;
  doc.setFont("vazirmatn", "normal");
  doc.setFontSize(10);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text(`نام مریض: ${prescription.patientName}`, 60, y);
  doc.text(
    `عمر و جنسیت: ${prescription.patientAge}، ${prescription.patientGender}`,
    60,
    (y += 14)
  );
  doc.text(`حالت: ${prescription.status}`, 60, (y += 14));
  addSeparator();

  // --- VITAL SIGNS & CLINICAL DATA ---
  const hasVitalSigns =
    prescription.pulseRate ||
    (prescription.allergies && prescription.allergies.length > 0) ||
    prescription.medicationUsage;
  if (hasVitalSigns) {
    drawSectionHeader(
      "Vital Signs & Clinical Data",
      "علائم حیاتی و داده‌های بالینی"
    );
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    if (prescription.pulseRate) {
      doc.text(`Pulse Rate: ${prescription.pulseRate}`, 60, y);
    }

    if (prescription.allergies && prescription.allergies.length > 0) {
      const allergiesText = prescription.allergies.join(", ");
      doc.text(`Allergies: ${allergiesText}`, 60, (y += 14));
    }

    if (prescription.medicationUsage) {
      doc.text(
        `Current Medications: ${prescription.medicationUsage}`,
        60,
        (y += 14)
      );
    }
    addSeparator();
  }

  // --- PRESCRIBED MEDICATIONS ---
  drawSectionHeader("Prescribed Medications", "دواهای تجویز شده");
  y += 8;

  // Medications
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const medications = prescription.medicines || [];

  if (medications.length === 0) {
    doc.text("No medications prescribed.", 60, (y += 14));
    doc.setFont("vazirmatn", "normal");
    doc.text("هیچ دوا تجویز نگردیده است.", pageWidth - 60, y, {
      align: "right",
    });
  } else {
    medications.forEach((m: Medication, i: number) => {
      y += 25;
      if (y > pageHeight - 180) {
        doc.addPage();
        y = 80;
      }

      // Bullet
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.circle(65, y - 3, 3, "F");

      // Medicine name (English)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(`${i + 1}. ${m.medicine}`, 80, y);

      y += 14;

      // -------- Dosage (English) --------
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`Dosage: ${m.dosage}`, 80, y);

      y += 12;

      // -------- Frequency (Persian) --------
      if (m.frequency) {
        doc.setFont("helvetica", "normal");
        doc.text("Frequency:", 80, y);

        doc.setFont("vazirmatn", "normal");
        doc.text(m.frequency, pageWidth - 80, y, { align: "right" });

        y += 12;
      }

      // -------- Duration (Persian) --------
      if (m.duration) {
        doc.setFont("helvetica", "normal");
        doc.text("Duration:", 80, y);

        doc.setFont("vazirmatn", "normal");
        doc.text(m.duration, pageWidth - 80, y, { align: "right" });

        y += 12;
      }

      // -------- Instructions (Persian – multiline safe) --------
      if (m.instructions) {
        doc.setFont("helvetica", "italic");
        doc.text("Instructions:", 80, y);

        doc.setFont("vazirmatn", "normal");
        const instructionLines = doc.splitTextToSize(
          m.instructions,
          pageWidth - 160
        );
        doc.text(instructionLines, pageWidth - 80, y, { align: "right" });

        y += instructionLines.length * 12;
      }

      // Separator
      if (i < medications.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.line(80, (y += 10), pageWidth - 80, y);
      }
    });
  }
  addSeparator();

  // --- ADDITIONAL NOTES ---
  if (prescription.transcription) {
    drawSectionHeader("Voice Transcription", "رونوشت صوتی");
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const transcriptionLines = doc.splitTextToSize(
      prescription.transcription,
      pageWidth - 120
    );
    doc.text(transcriptionLines, 60, y);
    addSeparator();
  }

  // --- DOCTOR SIGNATURE ---
  drawSectionHeader("Medical Practitioner", "داکتر معالج");
  y += 20;
  doc.setFont("helvetica", "bold");
  doc.text(prescription.doctorName, 60, y);
  doc.setFont("helvetica", "normal");
  doc.text("Medical Practitioner", 60, (y += 12));

  doc.setFont("vazirmatn", "normal");
  doc.text(prescription.doctorName, pageWidth - 60, y - 12, { align: "right" });
  doc.text("داکتر معالج", pageWidth - 60, y, { align: "right" });

  // Signature line
  y += 40;
  doc.setDrawColor(90, 90, 90);
  doc.line(60, y, 220, y);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Signature & Stamp", 60, y + 10);

  // Footer with enhanced information
  const footerY = pageHeight - 60;
  const qrCodeSize = 40;

  // QR Code placeholder
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(1);
  doc.rect(pageWidth - 80, footerY - 10, qrCodeSize, qrCodeSize);
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  doc.text("QR Code", pageWidth - 60, footerY + 25, { align: "center" });
  doc.text("Verify", pageWidth - 60, footerY + 32, { align: "center" });

  // Footer information
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.setFont("helvetica", "normal");

  // Main footer text
  doc.text("This is a computer-generated digital prescription.", 60, footerY, {
    align: "left",
  });
  doc.text(
    "For verification, scan the QR code or visit: www.smartrx.com/verify",
    60,
    footerY + 10,
    { align: "left" }
  );

  // Date and prescription ID
  doc.text(`Generated: ${format(new Date(), "PPP p")}`, 60, footerY + 20, {
    align: "left",
  });
  doc.text(`Prescription ID: ${prescription._id}`, 60, footerY + 30, {
    align: "left",
  });

  // Persian footer
  doc.setFont("vazirmatn", "normal");
  doc.text(
    "این یک نسخه دیجیتال تولید شده توسط کامپیوتر است.",
    pageWidth / 2,
    footerY + 45,
    { align: "center" }
  );

  // Save
  // Validate and handle date properly
  let prescriptionDate: Date;
  try {
    prescriptionDate = new Date(prescription.date);
    // Check if the date is valid
    if (isNaN(prescriptionDate.getTime())) {
      prescriptionDate = new Date(); // Fallback to current date
    }
  } catch (error) {
    prescriptionDate = new Date(); // Fallback to current date if parsing fails
  }

  const fileName = `prescription-${prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${format(prescriptionDate, "yyyy-MM-dd")}.pdf`;

  doc.save(fileName);
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;
