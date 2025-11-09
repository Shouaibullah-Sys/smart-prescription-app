import { jsPDF } from "jspdf";
import { format } from "date-fns";
import "../vazirmatn-normal.js";
import { Prescription, Medicine } from "@/db/schema";

/** ✅ Draw Persian text safely (RTL) */
function drawPersianText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "right" | "center" = "right"
) {
  doc.setFont("vazirmatn", "normal");
  doc.text(text, x, y, { align });
}

/** ✅ Draw English text (LTR) */
function drawEnglishText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  align: "left" | "center" = "left"
) {
  doc.setFont("helvetica", "normal");
  doc.text(text, x, y, { align });
}

/** ✅ Combine bilingual text line (you can disable one side if needed) */
function drawBilingualLine(
  doc: jsPDF,
  xLeft: number,
  xRight: number,
  y: number,
  enText?: string,
  faText?: string
) {
  if (enText) drawEnglishText(doc, enText, xLeft, y);
  if (faText) drawPersianText(doc, faText, xRight, y);
}

/** ✅ Format helpers */
function formatArrayData(data: string[] | null): string {
  if (!data || !Array.isArray(data)) return "ندارد";
  return data.length > 0 ? data.join("، ") : "ندارد";
}

function formatDateSafe(
  date: Date | null | undefined,
  formatString: string
): string {
  return format(date || new Date(), formatString);
}

/** ✅ Generate bilingual & RTL PDF */
export async function generatePrescriptionPDF(
  prescription: Prescription & { medicines: Medicine[] }
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 120;

  // 🎨 Colors
  const primary: [number, number, number] = [42, 94, 168];
  const accent: [number, number, number] = [66, 133, 244];
  const bgLight: [number, number, number] = [244, 247, 252];
  const textDark: [number, number, number] = [40, 40, 40];

  // === Header ===
  doc.setFillColor(...primary);
  doc.rect(0, 0, pageWidth, 120, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  drawBilingualLine(
    doc,
    pageWidth / 2 - 100,
    pageWidth / 2 + 100,
    50,
    "MEDICAL PRESCRIPTION",
    "نسخه پزشکی"
  );

  // === Helper for Section Headers ===
  function drawSectionHeader(en: string, fa: string) {
    y += 25;
    doc.setFillColor(...accent);
    doc.roundedRect(40, y - 12, pageWidth - 80, 20, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    drawBilingualLine(doc, 60, pageWidth - 60, y + 4, en, fa);
    y += 20;
    doc.setTextColor(...textDark);
  }

  // === Helper for bilingual fields ===
  function addBilingualField(
    enLabel: string,
    value: string | null,
    faLabel: string
  ) {
    if (!value) return;
    y += 12;
    doc.setFontSize(9);
    drawBilingualLine(
      doc,
      60,
      pageWidth - 60,
      y,
      `${enLabel}: ${value}`,
      `${faLabel}: ${value}`
    );
  }

  // --- Patient Info ---
  drawSectionHeader("Patient Information", "معلومات بیمار");
  addBilingualField("Name", prescription.patientName, "نام");
  addBilingualField("Age", prescription.patientAge, "سن");
  addBilingualField("Gender", prescription.patientGender, "جنسیت");
  addBilingualField("Phone", prescription.patientPhone, "شماره تماس");
  addBilingualField("Address", prescription.patientAddress, "آدرس");

  // --- Medical History ---
  drawSectionHeader("Medical History", "سابقه پزشکی");
  addBilingualField(
    "Allergies",
    formatArrayData(prescription.allergies),
    "حساسیت‌ها"
  );
  addBilingualField(
    "Current Medications",
    formatArrayData(prescription.currentMedications),
    "داروهای فعلی"
  );
  addBilingualField(
    "Past History",
    prescription.pastMedicalHistory,
    "سوابق گذشته"
  );
  addBilingualField(
    "Family History",
    prescription.familyHistory,
    "سابقه خانوادگی"
  );

  // --- Diagnosis ---
  drawSectionHeader("Diagnosis", "تشخیص");
  addBilingualField("Primary Diagnosis", prescription.diagnosis, "تشخیص اصلی");

  // --- Medicines ---
  drawSectionHeader("Prescribed Medicines", "داروهای تجویز شده");

  if (!prescription.medicines?.length) {
    y += 12;
    drawBilingualLine(
      doc,
      60,
      pageWidth - 60,
      y,
      "No medicines prescribed.",
      "هیچ دارویی تجویز نشده است"
    );
  } else {
    let i = 1;
    for (const med of prescription.medicines) {
      y += 16;
      if (y > pageHeight - 120) {
        doc.addPage();
        y = 60;
      }

      doc.setFontSize(8);
      drawBilingualLine(
        doc,
        60,
        pageWidth - 60,
        y,
        `${i}. ${med.medicine} (${med.dosage})`,
        `${i}. ${med.medicine} (${med.dosage})`
      );

      const details = [
        med.form && `Form: ${med.form}`,
        med.frequency && `Frequency: ${med.frequency}`,
        med.duration && `Duration: ${med.duration}`,
      ].filter(Boolean);

      const faDetails = [
        med.form && `فرم: ${med.form}`,
        med.frequency && `تکرار: ${med.frequency}`,
        med.duration && `مدت: ${med.duration}`,
      ].filter(Boolean);

      y += 10;
      doc.setFontSize(7);
      drawBilingualLine(
        doc,
        80,
        pageWidth - 80,
        y,
        details.join(" | "),
        faDetails.join(" | ")
      );
      i++;
    }
  }

  // --- Treatment Instructions ---
  drawSectionHeader("Treatment Instructions", "دستورات درمانی");
  addBilingualField("General", prescription.instructions, "دستورات عمومی");
  addBilingualField("Follow-up", prescription.followUp, "پیگیری");
  addBilingualField("Restrictions", prescription.restrictions, "محدودیت‌ها");

  // --- Doctor Info ---
  drawSectionHeader("Medical Practitioner", "اطلاعات داکتر");
  addBilingualField("Doctor", prescription.doctorName, "نام داکتر");
  addBilingualField(
    "License No",
    prescription.doctorLicenseNumber,
    "شماره جواز"
  );
  addBilingualField("Clinic", prescription.clinicName, "کلینیک");
  addBilingualField("Address", prescription.clinicAddress, "آدرس");

  // --- Footer ---
  const footerY = pageHeight - 40;
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  drawBilingualLine(
    doc,
    pageWidth / 2 - 100,
    pageWidth / 2 + 100,
    footerY,
    "Computer-generated prescription. No physical signature required.",
    "این نسخه به‌صورت خودکار تولید شده و نیاز به امضاء ندارد."
  );

  // Save file
  const safeName = prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
  const fileName = `prescription-${safeName}-${formatDateSafe(
    prescription.createdAt,
    "yyyy-MM-dd"
  )}.pdf`;

  doc.save(fileName);
}

export const downloadPrescriptionPDF = generatePrescriptionPDF;
