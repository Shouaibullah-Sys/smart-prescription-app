// utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import "../vazirmatn-normal";

export interface Medication {
  medicine: string;
  dosage: string;
  dosagePersian?: string;
  frequency: string;
  frequencyPersian?: string;
  duration: string;
  durationPersian?: string;
  instructions: string;
  instructionsPersian?: string;
  form?: string;
  formPersian?: string;
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
  patientAddress?: string;
  allergies?: string | null; // Changed from string[] to match main Prescription interface
  currentMedications?: string | null; // Changed from string[] to match main Prescription interface
  medicationUsage?: string;
  familyHistory?: string;
  socialHistory?: string;
  weight?: string;
  height?: string;
  bmi?: string;
  // Comprehensive Body Metrics
  waistCircumference?: string;
  hipCircumference?: string;
  bodyFatPercentage?: string;
  leanBodyMass?: string;
  idealBodyWeight?: string;
  adjustedBodyWeight?: string;
  basalMetabolicRate?: string;
  totalDailyEnergyExpenditure?: string;
  bodySurfaceArea?: string;
  waistToHeightRatio?: string;
  waterRequirement?: string;
  pulseRate?: string;
  bloodPressure?: string;
  temperature?: string;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  physicalExam?: string;
  medicalExams?: string[];
  examNotes?: string;
  // System Examinations
  cnsExamination?: string;
  cardiovascularExamination?: string;
  respiratoryExamination?: string;
  gastrointestinalExamination?: string;
  musculoskeletalExamination?: string;
  genitourinaryExamination?: string;
  dermatologicalExamination?: string;
  entExamination?: string;
  ophthalmologicalExamination?: string;
  // Additional Fields
  chiefComplaint?: string;
  pastMedicalHistory?: string;
  medicalTests?: string[];
  followUp?: string; // Dedicated follow-up instructions field
  medicines: Medication[];
  doctorName: string;
  doctorLicenseNumber?: string;
  date: string;
  transcription?: string;
  source?: string;
  status?: string;
}

// ==================== CONFIGURATION INTERFACE ====================
export interface PDFConfig {
  // Page Layout
  page: {
    orientation: "portrait" | "landscape";
    unit: "pt" | "mm" | "cm" | "in";
    format: "a4" | "letter" | "legal";
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };

  // Language Settings
  language: {
    primary: "english" | "persian";
    fallback: "english" | "persian";
    showBothLanguages: boolean;
    autoDetect: boolean;
  };

  // Colors - Green color theme
  colors: {
    primary: [number, number, number]; // Forest Green
    accent: [number, number, number]; // Lime Green
    secondary: [number, number, number]; // Medium Sea Green
    bgLight: [number, number, number]; // Honeydew
    textDark: [number, number, number]; // Dark Green
    border: [number, number, number]; // Light Green
    tableStriped: [number, number, number]; // Mint Cream
    warning: [number, number, number]; // Gold
    success: [number, number, number]; // Medium Sea Green
    sectionBg: [number, number, number]; // Very Light Green
    sectionHeader: [number, number, number]; // Dark Green
    divider: [number, number, number]; // Pale Green
  };

  // Typography
  typography: {
    defaultFont: string;
    fontSizes: {
      title: number;
      subtitle: number;
      heading: number;
      subheading: number;
      body: number;
      small: number;
      tiny: number;
      micro: number;
    };
    lineHeights: {
      tight: number;
      normal: number;
      loose: number;
    };
  };

  // Logo
  logo: {
    enabled: boolean;
    url: string;
    width: number;
    height: number;
    position: "left" | "center" | "right";
    marginTop: number;
    marginBottom: number;
  };

  // Layout Structure - Simplified for single page guarantee
  layout: {
    twoColumn: boolean;
    leftColumnWidth: number;
    rightColumnWidth: number;
    columnGap: number;
    sectionSpacing: number;
    blockSpacing: number;
    lineSpacing: number;
    // Fixed heights for left column sections
    leftSectionHeights: {
      chiefComplaint: number;
      medicalHistory: number;
      pastMedicalHistory: number;
      labExams: number;
      diagnosis: number;
      allergies: number;
      familyHistory: number;
      socialHistory: number;
      examNotes: number;
    };
  };

  // Patient Info
  patientInfo: {
    show: boolean;
    boxStyle: "rounded" | "flat" | "shadow";
    borderRadius: number;
    columns: number;
    showLabels: boolean;
    labelStyle: "bold" | "normal" | "italic";
    include: string[];
  };

  // Clinical History (Left Column) - Simplified for single page
  clinicalHistory: {
    show: boolean;
    sections: {
      chiefComplaint: boolean;
      medicalHistory: boolean;
      pastMedicalHistory: boolean;
      labExams: boolean;
      diagnosis: boolean;
      allergies: boolean;
      familyHistory: boolean;
      socialHistory: boolean;
      examNotes: boolean;
    };
    boxStyle: "rounded" | "flat";
    autoFontSize: boolean; // Automatically adjust font size to fit content
    minFontSize: number; // Minimum font size for auto adjustment
    padding: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };

  // Vital Signs
  vitalSigns: {
    show: boolean;
    gridColumns: number;
    cell: {
      width: number;
      height: number;
      gap: number;
      borderRadius: number;
    };
    include: string[];
    showUnits: boolean;
  };

  // Body Metrics
  bodyMetrics: {
    show: boolean;
    include: string[];
    showUnits: boolean;
    compactMode: boolean;
  };

  // Medications Table
  medications: {
    show: boolean;
    table: {
      headers: string[];
      columnWidths: number[];
      rowHeight: number;
      stripedRows: boolean;
      showRowNumbers: boolean;
      showAdditionalDetails: boolean;
      maxRowsOnFirstPage: number; // Maximum medication rows on first page
    };
  };

  // Doctor Signature
  signature: {
    show: boolean;
    position: "left" | "center" | "right";
    lineWidth: number;
    lineLength: number;
    includeTitle: boolean;
  };

  // Footer
  footer: {
    show: boolean;
    showPageNumbers: boolean;
    showDigitalNote: boolean;
    height: number;
  };

  // Debug/Development
  debug: {
    showBorders: boolean;
    showGrid: boolean;
    logPositions: boolean;
  };
}

// ==================== DEFAULT CONFIGURATION ====================
export const defaultPDFConfig: PDFConfig = {
  page: {
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    margins: { top: 40, bottom: 40, left: 20, right: 20 },
  },

  language: {
    primary: "english",
    fallback: "persian",
    showBothLanguages: true,
    autoDetect: true,
  },

  colors: {
    // Green color theme
    primary: [34, 139, 34], // Forest Green - main headers
    accent: [50, 205, 50], // Lime Green - accents
    secondary: [60, 179, 113], // Medium Sea Green - secondary elements
    bgLight: [240, 255, 240], // Honeydew - backgrounds
    textDark: [0, 51, 0], // Dark Green - text
    border: [144, 238, 144], // Light Green - borders
    tableStriped: [245, 255, 245], // Mint Cream - table stripes
    warning: [255, 193, 7], // Gold - warnings
    success: [60, 179, 113], // Medium Sea Green - success
    sectionBg: [230, 255, 230], // Very Light Green - section backgrounds
    sectionHeader: [0, 100, 0], // Dark Green - section headers
    divider: [200, 230, 200], // Pale Green - dividers
  },

  typography: {
    defaultFont: "vazirmatn",
    fontSizes: {
      title: 16, // Increased from 14
      subtitle: 14, // Increased from 12
      heading: 12, // Increased from 10
      subheading: 11, // Increased from 9
      body: 10, // Increased from 8
      small: 9, // Increased from 7
      tiny: 8, // Increased from 6
      micro: 7, // Increased from 5
    },
    lineHeights: {
      tight: 1.1,
      normal: 1.3,
      loose: 1.5,
    },
  },

  logo: {
    enabled: false,
    url: "/logo.png",
    width: 80,
    height: 80,
    position: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  layout: {
    twoColumn: true,
    leftColumnWidth: 0.35, // Slightly wider for better readability
    rightColumnWidth: 0.65,
    columnGap: 15,
    sectionSpacing: 10, // Reduced spacing
    blockSpacing: 8, // Reduced block spacing
    lineSpacing: 3, // Reduced line spacing

    // Fixed heights for left column sections (in points)
    leftSectionHeights: {
      chiefComplaint: 50, // 50pt height
      medicalHistory: 70, // 70pt height
      pastMedicalHistory: 70, // 70pt height
      labExams: 120, // 120pt height (increased by 30px for more space)
      diagnosis: 60, // 60pt height
      allergies: 60, // 40pt height
      familyHistory: 50, // 50pt height
      socialHistory: 50, // 50pt height
      examNotes: 40, // 40pt height
    },
  },

  patientInfo: {
    show: true,
    boxStyle: "rounded",
    borderRadius: 3,
    columns: 4,
    showLabels: true,
    labelStyle: "bold",
    include: [
      "name",
      "age",
      "gender",
      "date",
      "weight",
      "height",
      "bmi",
      "waist",
      "bodyFat",
    ],
  },

  clinicalHistory: {
    show: true,
    sections: {
      chiefComplaint: true,
      medicalHistory: true,
      pastMedicalHistory: true,
      labExams: true,
      diagnosis: true,
      allergies: true,
      familyHistory: true,
      socialHistory: true,
      examNotes: false,
    },
    boxStyle: "rounded",
    autoFontSize: true, // Automatically adjust font size
    minFontSize: 5, // Don't go below 5pt
    padding: {
      top: 6,
      bottom: 6,
      left: 8,
      right: 8,
    },
  },

  vitalSigns: {
    show: true,
    gridColumns: 3,
    cell: {
      width: 40, // Smaller cells
      height: 25, // Increased height to accommodate larger fonts
      gap: 2,
      borderRadius: 2,
    },
    include: ["pulse", "bp", "temp", "respiratory", "oxygen"],
    showUnits: true,
  },

  bodyMetrics: {
    show: true,
    include: [
      "waistCircumference",
      "hipCircumference",
      "bodyFatPercentage",
      "leanBodyMass",
      "idealBodyWeight",
      "basalMetabolicRate",
      "bodySurfaceArea",
      "waistToHeightRatio",
      "waterRequirement",
    ],
    showUnits: true,
    compactMode: true,
  },

  medications: {
    show: true,
    table: {
      headers: [
        "#",
        "Medicine",
        "Dosage",
        "Frequency",
        "Duration",
        "Instructions",
      ],
      columnWidths: [15, 90, 60, 60, 60, 70], // Adjusted widths
      rowHeight: 22, // Increased row height to accommodate larger fonts
      stripedRows: true,
      showRowNumbers: true,
      showAdditionalDetails: false, // Disabled for compactness
      maxRowsOnFirstPage: 8, // Max 8 rows on first page
    },
  },

  signature: {
    show: true,
    position: "right",
    lineWidth: 0.5,
    lineLength: 150, // Shorter line
    includeTitle: true,
  },

  footer: {
    show: true,
    showPageNumbers: true,
    showDigitalNote: true,
    height: 30, // Smaller footer
  },

  debug: {
    showBorders: false,
    showGrid: false,
    logPositions: false,
  },
};

// ==================== TRANSLATIONS ====================

/**
 * Persian translations for section headers
 */
const HEADER_TRANSLATIONS = {
  "Chief Complaint": "شکایت اصلی",
  "History of the Chief Complain": "تاریخچه شکایت اصلی",
  "Past Medical History": "تاریخچه طبی گذشته",
  "System Examinations": "معاینات سیستمی",
  "Lab Exams": "معاینات لابراتواری",
  "Medical History": "تاریخچه پزشکی",
  "Social History": "سابقه اجتماعی",
  "Family History": "سابقه خانوادگی",
  Allergies: "حساسیت‌ها",
  "Medical Tests": "آزمایشات پزشکی",
  "Exam Notes": "یادداشت‌های معاینه",
  "Current Medications": "داروهای فعلی",
  "VITAL SIGNS": "علائم حیاتی",
  PRESCRIPTIONS: "نسخه‌ها",
  DIAGNOSIS: "تشخیص",
  "Medical Practitioner": "پزشک معالج",
  "Follow Up": "پیگیری",
};

/**
 * Draw bilingual text with proper font handling
 */
function drawBilingualText(
  doc: jsPDF,
  englishText: string,
  persianText: string,
  x: number,
  y: number,
  config: PDFConfig
): void {
  // English
  doc.setFont("helvetica", "normal");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.text(englishText, x, y);

  if (persianText) {
    const englishWidth = doc.getTextWidth(englishText);

    // Persian (USE VAZIRMATN)
    doc.setFont("vazirmatn", "normal");
    doc.text(persianText, x + englishWidth + 8, y);
  }
}

/**
 * Draw bilingual text with Persian below English (vertical layout)
 */
function drawBilingualTextVertical(
  doc: jsPDF,
  englishText: string,
  persianText: string,
  x: number,
  y: number,
  config: PDFConfig
): number {
  // English
  doc.setFont("helvetica", "normal");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.text(englishText, x, y);

  let currentY = y;

  if (persianText) {
    // Calculate the line height for the current font size
    const lineHeight =
      config.typography.fontSizes.subheading *
      config.typography.lineHeights.normal;

    // Move to next line for Persian
    currentY += lineHeight + 2;

    // Persian (USE VAZIRMATN)
    doc.setFont("vazirmatn", "normal");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.text(persianText, x, currentY);

    // Return the final Y position
    currentY += lineHeight;
  }

  return currentY;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse chief complaint JSON content and format it for display
 */
function parseChiefComplaintContent(chiefComplaint: string): string {
  if (!chiefComplaint || typeof chiefComplaint !== "string") {
    return "No chief complaint recorded";
  }

  try {
    // Try to parse as JSON array first
    const parsed = JSON.parse(chiefComplaint);

    if (Array.isArray(parsed) && parsed.length > 0) {
      // Format each complaint as a numbered list with details
      return parsed
        .map((complaint: any, index: number) => {
          const number = index + 1;
          const text = complaint.text || "No description";
          const symptoms = Array.isArray(complaint.symptoms)
            ? complaint.symptoms
            : [];
          const duration = complaint.duration || "";
          const severity = complaint.severity || "";

          let complaintText = `${number}. ${text}`;

          // Add severity if available and not "Not specified"
          if (severity && severity !== "Not specified") {
            complaintText += ` (${severity})`;
          }

          // Add duration if available
          if (duration) {
            complaintText += ` - Duration: ${duration}`;
          }

          // Add symptoms if available
          if (symptoms.length > 0) {
            complaintText += ` - Symptoms: ${symptoms.join(", ")}`;
          }

          return complaintText;
        })
        .join("\n");
    } else if (typeof parsed === "object" && parsed !== null) {
      // Handle single complaint object
      const text = parsed.text || "No description";
      const symptoms = Array.isArray(parsed.symptoms) ? parsed.symptoms : [];
      const duration = parsed.duration || "";
      const severity = parsed.severity || "";

      let complaintText = text;

      if (severity && severity !== "Not specified") {
        complaintText += ` (${severity})`;
      }

      if (duration) {
        complaintText += ` - Duration: ${duration}`;
      }

      if (symptoms.length > 0) {
        complaintText += ` - Symptoms: ${symptoms.join(", ")}`;
      }

      return complaintText;
    } else {
      // If parsed but not expected format, return as string
      return parsed.toString();
    }
  } catch (error) {
    // If not valid JSON, treat as plain text
    console.warn("Chief complaint is not valid JSON:", error);
    return chiefComplaint;
  }
}

/**
 * Get the appropriate language value from a bilingual field
 */
function getBilingualValue(
  englishValue: string | undefined,
  persianValue: string | undefined,
  config: PDFConfig
): string {
  if (config.language.showBothLanguages && englishValue && persianValue) {
    return `${englishValue} / ${persianValue}`; // Single line format
  }

  if (config.language.primary === "english") {
    return englishValue || persianValue || "";
  }

  return persianValue || englishValue || "";
}

/**
 * Get medication field with bilingual support
 */
function getMedicationField(
  medication: any,
  fieldName: string,
  config: PDFConfig
): string {
  const englishValue = medication[fieldName];
  const persianValue = medication[`${fieldName}Persian`];
  return getBilingualValue(englishValue, persianValue, config);
}

/**
 * Truncate text to fit within a specific width
 */
function truncateTextToWidth(
  doc: jsPDF,
  text: string,
  maxWidth: number,
  fontSize: number
): string {
  doc.setFontSize(fontSize);
  const textWidth = doc.getTextWidth(text);

  if (textWidth <= maxWidth) {
    return text;
  }

  // Truncate with ellipsis
  let truncated = text;
  while (
    truncated.length > 3 &&
    doc.getTextWidth(truncated + "...") > maxWidth
  ) {
    truncated = truncated.substring(0, truncated.length - 1);
  }

  return truncated + "...";
}

/**
 * Optimize font size to fit content in a fixed height
 */
function optimizeFontSizeForContent(
  doc: jsPDF,
  content: string | string[],
  maxWidth: number,
  maxHeight: number,
  config: PDFConfig
): number {
  // Start with the smallest font size
  let fontSize = config.typography.fontSizes.micro;

  // Convert content to lines
  let lines: string[] = [];
  if (Array.isArray(content)) {
    // For arrays (lists), prefix with numbers
    for (let i = 0; i < content.length; i++) {
      const itemLines = doc.splitTextToSize(
        `${i + 1}. ${content[i]}`,
        maxWidth
      );
      lines.push(...itemLines);
    }
  } else {
    // For strings, split normally
    lines = doc.splitTextToSize(content, maxWidth);
  }

  // Try increasing font size until it doesn't fit
  for (
    let fs = config.clinicalHistory.minFontSize;
    fs <= config.typography.fontSizes.body;
    fs += 0.5
  ) {
    doc.setFontSize(fs);
    const lineHeight = fs * config.typography.lineHeights.normal;
    const totalHeight = lines.length * lineHeight;

    if (totalHeight > maxHeight) {
      break;
    }
    fontSize = fs;
  }

  return fontSize;
}

/**
 * Draw a section with content that fits in fixed height
 */
function drawFixedHeightSection(
  doc: jsPDF,
  title: string,
  content: string | string[],
  x: number,
  y: number,
  width: number,
  height: number,
  config: PDFConfig
): void {
  const padding = config.clinicalHistory.padding;
  const contentWidth = width - padding.left - padding.right;
  const contentHeight =
    height -
    padding.top -
    padding.bottom -
    config.typography.fontSizes.subheading * 1.2;

  // Draw section background only (border will be drawn separately for the entire left column)
  doc.setFillColor(...config.colors.sectionBg);
  if (config.clinicalHistory.boxStyle === "rounded") {
    // Use rect instead of roundedRect for compatibility
    doc.rect(x, y, width, height, "F");
  } else {
    doc.rect(x, y, width, height, "F");
  }

  // Draw left accent bar
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 3, height, "F");

  // Section title
  const persianTranslation =
    HEADER_TRANSLATIONS[title as keyof typeof HEADER_TRANSLATIONS];

  // Apply vertical layout to sections that need Persian below English
  const verticalLayoutSections = [
    "History of the Chief Complain",
    "Past Medical History",
    "System Examinations",
  ];

  if (persianTranslation && verticalLayoutSections.includes(title)) {
    // Use vertical layout for these specific sections (Persian below English)
    const titleY = drawBilingualTextVertical(
      doc,
      title,
      persianTranslation,
      x + padding.left + 5,
      y + padding.top + 8,
      config
    );
  } else if (persianTranslation) {
    drawBilingualText(
      doc,
      title,
      persianTranslation,
      x + padding.left + 5,
      y + padding.top + 8,
      config
    );
  } else {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.sectionHeader);
    doc.text(title, x + padding.left + 5, y + padding.top + 8);
  }

  // Draw a subtle divider under title
  doc.setDrawColor(...config.colors.divider);
  doc.setLineWidth(0.2);

  // Calculate divider position based on whether we used vertical layout
  let titleEndY;

  if (persianTranslation && verticalLayoutSections.includes(title)) {
    // For vertical layout, calculate the Y position after both English and Persian
    const lineHeight =
      config.typography.fontSizes.subheading *
      config.typography.lineHeights.normal;
    titleEndY = y + padding.top + 8 + (lineHeight + 2) + lineHeight;
  } else {
    // For horizontal layout, use the original position
    titleEndY = y + padding.top + 12;
  }

  doc.line(x + padding.left, titleEndY, x + width - padding.right, titleEndY);

  // Content area
  const contentY = titleEndY + 5;

  // Optimize font size for content
  let fontSize = config.typography.fontSizes.tiny;
  if (config.clinicalHistory.autoFontSize) {
    // For structured content (Lab Exams), use a different optimization approach
    if (
      typeof content === "object" &&
      content !== null &&
      !Array.isArray(content) &&
      ("medicalExams" in content || "systemExaminations" in content)
    ) {
      // Estimate height for structured content
      let estimatedLines = 0;
      if ((content as any).medicalExams?.length) {
        estimatedLines += (content as any).medicalExams.length;
      }
      if ((content as any).systemExaminations?.length) {
        estimatedLines += (content as any).systemExaminations.length;
      }
      if ((content as any).examNotes) {
        estimatedLines += 3; // Title + exam notes content
      }
      fontSize = optimizeFontSizeForContent(
        doc,
        Array(estimatedLines).fill("Sample text"), // Dummy content for size calculation
        contentWidth,
        contentHeight,
        config
      );
    } else {
      fontSize = optimizeFontSizeForContent(
        doc,
        content,
        contentWidth,
        contentHeight,
        config
      );
    }
  }

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...config.colors.textDark);

  if (
    typeof content === "object" &&
    content !== null &&
    !Array.isArray(content) &&
    ("medicalExams" in content || "systemExaminations" in content)
  ) {
    // Special handling for Lab Exams structured content
    let currentY = contentY;
    const lineHeight = fontSize * config.typography.lineHeights.normal;

    // Draw medical exams as numbered list
    if ((content as any).medicalExams?.length) {
      for (let i = 0; i < (content as any).medicalExams.length; i++) {
        const item = (content as any).medicalExams[i];
        if (currentY + lineHeight > y + height - padding.bottom) {
          // Add "..." if content overflows
          doc.setFont(config.typography.defaultFont, "italic");
          doc.text(
            "...",
            x + width - padding.right - 10,
            y + height - padding.bottom - 2
          );
          break;
        }

        const itemText = `${i + 1}. ${item}`;
        const lines = doc.splitTextToSize(itemText, contentWidth);

        for (let j = 0; j < lines.length; j++) {
          if (currentY + lineHeight > y + height - padding.bottom) break;
          doc.text(lines[j], x + padding.left, currentY);
          currentY += lineHeight;
        }

        currentY += 2; // Small gap between items
      }
    }

    // Add exam notes section if present
    if ((content as any).examNotes) {
      // Add some spacing before exam notes
      currentY += 5;

      // Draw "Exam Notes" title
      doc.setFont(config.typography.defaultFont, "bold");
      doc.setFontSize(fontSize + 1);
      doc.setTextColor(...config.colors.primary);
      doc.text("Exam Notes:", x + padding.left, currentY);
      currentY += lineHeight + 2;

      // Draw exam notes content
      doc.setFont(config.typography.defaultFont, "normal");
      doc.setFontSize(fontSize);
      doc.setTextColor(...config.colors.textDark);

      const examNotesLines = doc.splitTextToSize(
        (content as any).examNotes,
        contentWidth
      );
      for (let i = 0; i < examNotesLines.length; i++) {
        if (currentY + lineHeight > y + height - padding.bottom) {
          // Add "..." if content overflows
          doc.setFont(config.typography.defaultFont, "italic");
          doc.text(
            "...",
            x + width - padding.right - 10,
            y + height - padding.bottom - 2
          );
          break;
        }

        doc.text(examNotesLines[i], x + padding.left, currentY);
        currentY += lineHeight;
      }
    }

    // Handle system examinations if present
    if ((content as any).systemExaminations?.length) {
      // Add some spacing before system examinations
      currentY += 5;

      // Draw system examinations as examination findings
      for (let i = 0; i < (content as any).systemExaminations.length; i++) {
        const exam = (content as any).systemExaminations[i];
        if (currentY + lineHeight > y + height - padding.bottom) {
          // Add "..." if content overflows
          doc.setFont(config.typography.defaultFont, "italic");
          doc.text(
            "...",
            x + width - padding.right - 10,
            y + height - padding.bottom - 2
          );
          break;
        }

        // Draw exam label and value
        doc.setFont(config.typography.defaultFont, "bold");
        doc.setTextColor(...config.colors.primary);
        doc.text(`${exam.label}:`, x + padding.left, currentY);

        const labelWidth = doc.getTextWidth(`${exam.label}: `);
        doc.setFont(config.typography.defaultFont, "normal");
        doc.setTextColor(...config.colors.textDark);

        const maxTextWidth = contentWidth - labelWidth;
        const lines = doc.splitTextToSize(exam.value, maxTextWidth);

        for (let j = 0; j < lines.length; j++) {
          if (currentY + lineHeight > y + height - padding.bottom) break;
          if (j === 0) {
            doc.text(lines[j], x + padding.left + labelWidth, currentY);
          } else {
            currentY += lineHeight;
            doc.text(lines[j], x + padding.left, currentY);
          }
        }

        currentY += lineHeight + 2;
      }
    }
  } else if (Array.isArray(content) && content.length > 0) {
    // Draw as numbered list
    let currentY = contentY;
    const lineHeight = fontSize * config.typography.lineHeights.normal;

    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      if (currentY + lineHeight > y + height - padding.bottom) {
        // Add "..." if content overflows
        doc.setFont(config.typography.defaultFont, "italic");
        doc.text(
          "...",
          x + width - padding.right - 10,
          y + height - padding.bottom - 2
        );
        break;
      }

      const itemText = `${i + 1}. ${item}`;
      const lines = doc.splitTextToSize(itemText, contentWidth);

      for (let j = 0; j < lines.length; j++) {
        if (currentY + lineHeight > y + height - padding.bottom) break;
        doc.text(lines[j], x + padding.left, currentY);
        currentY += lineHeight;
      }

      currentY += 2; // Small gap between items
    }
  } else if (typeof content === "string" && content.trim()) {
    // Draw as text
    const lines = doc.splitTextToSize(content, contentWidth);
    const lineHeight = fontSize * config.typography.lineHeights.normal;
    let currentY = contentY;

    for (let i = 0; i < lines.length; i++) {
      if (currentY + lineHeight > y + height - padding.bottom) {
        // Add "..." if content overflows
        doc.setFont(config.typography.defaultFont, "italic");
        doc.text(
          "...",
          x + width - padding.right - 10,
          y + height - padding.bottom - 2
        );
        break;
      }

      // Special formatting for chief complaint content
      if (title === "Chief Complaint" && lines[i].match(/^\d+\./)) {
        // Make complaint numbers bold
        const numberMatch = lines[i].match(/^(\d+\.)\s*(.*)$/);
        if (numberMatch) {
          const [, number, restText] = numberMatch;

          // Draw number in bold and colored
          doc.setFont(config.typography.defaultFont, "bold");
          doc.setTextColor(...config.colors.primary);
          doc.text(number, x + padding.left, currentY);

          // Draw rest of text in normal font
          doc.setFont(config.typography.defaultFont, "normal");
          doc.setTextColor(...config.colors.textDark);
          doc.text(
            restText,
            x + padding.left + doc.getTextWidth(number) + 2,
            currentY
          );
        } else {
          doc.text(lines[i], x + padding.left, currentY);
        }
      } else {
        doc.text(lines[i], x + padding.left, currentY);
      }

      currentY += lineHeight;
    }
  } else {
    // Empty content
    doc.setFont(config.typography.defaultFont, "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Not specified", x + padding.left, contentY);
  }
}

/**
 * Collect system examinations from prescription data
 */
function collectSystemExaminations(
  prescription: VoicePrescription
): Array<{ label: string; value: string }> {
  const systemExaminations: Array<{ label: string; value: string }> = [];

  const examinationFields = [
    { key: "cnsExamination", label: "Investigation" },
    { key: "cardiovascularExamination", label: "Palpation" },
    { key: "respiratoryExamination", label: "Percussion" },
    {
      key: "gastrointestinalExamination",
      label: "Auscultation",
    },
    { key: "musculoskeletalExamination", label: "Musculoskeletal Examination" },
    { key: "genitourinaryExamination", label: "Genitourinary Examination" },
    { key: "dermatologicalExamination", label: "Dermatological Examination" },
    { key: "entExamination", label: "ENT Examination" },
    {
      key: "ophthalmologicalExamination",
      label: "Ophthalmological Examination",
    },
  ];

  for (const field of examinationFields) {
    const value = (prescription as any)[field.key];
    if (value && typeof value === "string" && value.trim() !== "") {
      systemExaminations.push({
        label: field.label,
        value: value.trim(),
      });
    }
  }

  return systemExaminations;
}

/**
 * Calculate and guarantee all left sections fit on one page
 */
function calculateLeftColumnLayout(
  prescription: VoicePrescription,
  config: PDFConfig
): {
  totalHeight: number;
  sections: Array<{ title: string; content: any; height: number }>;
} {
  const sections: Array<{ title: string; content: any; height: number }> = [];
  let totalHeight = 0;

  // Add mandatory sections with their fixed heights
  if (
    prescription.chiefComplaint &&
    config.clinicalHistory.sections.chiefComplaint
  ) {
    // Parse chief complaint JSON to extract formatted content
    const chiefComplaintContent = parseChiefComplaintContent(
      prescription.chiefComplaint
    );
    sections.push({
      title: "Chief Complaint",
      content: chiefComplaintContent,
      height: config.layout.leftSectionHeights.chiefComplaint,
    });
    totalHeight +=
      config.layout.leftSectionHeights.chiefComplaint +
      config.layout.sectionSpacing;
  }

  if (
    prescription.pastMedicalHistory &&
    config.clinicalHistory.sections.medicalHistory
  ) {
    sections.push({
      title: "History of the Chief Complain",
      content: prescription.pastMedicalHistory,
      height: config.layout.leftSectionHeights.medicalHistory,
    });
    totalHeight +=
      config.layout.leftSectionHeights.medicalHistory +
      config.layout.sectionSpacing;
  }

  if (
    prescription.pastMedicalHistory &&
    config.clinicalHistory.sections.pastMedicalHistory
  ) {
    sections.push({
      title: "Past Medical History",
      content: prescription.pastMedicalHistory,
      height: config.layout.leftSectionHeights.pastMedicalHistory,
    });
    totalHeight +=
      config.layout.leftSectionHeights.pastMedicalHistory +
      config.layout.sectionSpacing;
  }

  // Collect system examinations if they exist
  const systemExams = collectSystemExaminations(prescription);
  if (systemExams.length > 0) {
    sections.push({
      title: "System Examinations",
      content: { systemExaminations: systemExams },
      height: 160, // Reduced from 120 to better fit actual content
    });
    totalHeight += 160 + config.layout.sectionSpacing;
  }

  // Add Diagnosis/Allergies section after System Examinations
  if (prescription.allergies && config.clinicalHistory.sections.diagnosis) {
    sections.push({
      title: "DIAGNOSIS",
      content: prescription.allergies,
      height: config.layout.leftSectionHeights.diagnosis,
    });
    totalHeight +=
      config.layout.leftSectionHeights.diagnosis + config.layout.sectionSpacing;
  }

  // Note: Diagnosis/Allergies section moved to right column

  if (
    prescription.socialHistory &&
    config.clinicalHistory.sections.socialHistory
  ) {
    sections.push({
      title: "Social History",
      content: prescription.socialHistory,
      height: config.layout.leftSectionHeights.socialHistory,
    });
    totalHeight +=
      config.layout.leftSectionHeights.socialHistory +
      config.layout.sectionSpacing;
  }

  // Remove last section spacing
  if (sections.length > 0) {
    totalHeight -= config.layout.sectionSpacing;
  }

  // Ensure minimum height for left column even if no sections
  if (totalHeight === 0) {
    totalHeight = 100; // Minimum height for empty left column
  }

  return { totalHeight, sections };
}

function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
}

/**
 * Enhanced Patient Information Section with All Calculations
 */
/**
 * Enhanced Patient Information Section - Matches PatientInformation.tsx design
 */
/**
 * Enhanced Patient Information Section - 4 columns, no borders, like PatientInformation.tsx
 */
function addEnhancedPatientInformation(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const columnWidth = width;
  const contentX = x;
  let currentY = y;

  // ==================== 4-COLUMN LAYOUT ====================
  const colCount = 4;
  const colWidth = (columnWidth - 20) / colCount;
  const colGap = 5;
  const startX = contentX + 5;

  // Calculate all metrics
  const weight = prescription.weight ? `${prescription.weight} kg` : "N/A";
  const height = prescription.height ? `${prescription.height} cm` : "N/A";
  const bmi = prescription.bmi || "N/A";

  // Calculate additional metrics
  const waist = prescription.waistCircumference
    ? `${prescription.waistCircumference} cm`
    : "N/A";
  const hip = prescription.hipCircumference
    ? `${prescription.hipCircumference} cm`
    : "N/A";
  const idealWeight =
    prescription.idealBodyWeight || calculateIdealWeightFromData(prescription);
  const bmr =
    prescription.basalMetabolicRate || calculateBMRFromData(prescription);
  const bodyFat =
    prescription.bodyFatPercentage || calculateBodyFatFromData(prescription);
  const water =
    prescription.waterRequirement || calculateWaterFromData(prescription);
  const leanMass = prescription.leanBodyMass || "N/A";
  const adjustedWeight = prescription.adjustedBodyWeight || "N/A";
  const tdee = prescription.totalDailyEnergyExpenditure || "N/A";
  const bsa = prescription.bodySurfaceArea || "N/A";

  // Column 1: Personal Information
  let colX = startX;
  let colY = currentY;

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Patient Details", colX, colY);
  colY += 15;

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.body);
  doc.setTextColor(...config.colors.textDark);

  const patientDetails = [
    { label: "Name:", value: prescription.patientName || "N/A" },
    {
      label: "Age:",
      value: prescription.patientAge
        ? `${prescription.patientAge} years`
        : "N/A",
    },
    { label: "Sex:", value: prescription.patientGender || "N/A" },
    { label: "Date:", value: formatDateForDisplay(prescription.date) },
  ];

  for (const detail of patientDetails) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.text(detail.label, colX, colY);

    const labelWidth = doc.getTextWidth(detail.label);
    doc.setFont(config.typography.defaultFont, "normal");
    doc.text(detail.value, colX + labelWidth + 5, colY);
    colY += 12; // Reduced spacing
  }

  // Column 2: Basic Measurements
  colX = startX + colWidth + colGap;
  colY = currentY;

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Basic Metrics", colX, colY);
  colY += 15;

  const basicMetrics = [
    { label: "Weight:", value: weight },
    { label: "Height:", value: height },
  ];

  for (const metric of basicMetrics) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.text(metric.label, colX, colY);

    const labelWidth = doc.getTextWidth(metric.label);
    doc.setFont(config.typography.defaultFont, "normal");
    doc.text(metric.value, colX + labelWidth + 5, colY);
    colY += 12; // Reduced spacing
  }

  // Column 3: BMI & Body Composition
  colX = startX + (colWidth + colGap) * 2;
  colY = currentY;

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Body Composition", colX, colY);
  colY += 15;

  const bodyComposition = [
    { label: "BMI:", value: bmi },
    { label: "Category:", value: getBMICategoryText(bmi) },
    { label: "Body Fat:", value: bodyFat },
  ];

  for (const comp of bodyComposition) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.text(comp.label, colX, colY);

    const labelWidth = doc.getTextWidth(comp.label);
    doc.setFont(config.typography.defaultFont, "normal");
    doc.text(comp.value, colX + labelWidth + 5, colY);
    colY += 12; // Reduced spacing
  }

  // Column 4: Metabolic Calculations
  colX = startX + (colWidth + colGap) * 3;
  colY = currentY;

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Metabolic Data", colX, colY);
  colY += 15;

  const metabolicData = [
    { label: "Ideal Wt:", value: idealWeight },
    { label: "BMR:", value: bmr },
    { label: "Water:", value: water },
  ];

  for (const data of metabolicData) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.text(data.label, colX, colY);

    const labelWidth = doc.getTextWidth(data.label);
    doc.setFont(config.typography.defaultFont, "normal");
    doc.text(data.value, colX + labelWidth + 5, colY);
    colY += 12; // Reduced spacing
  }

  // Update final position
  return y + 60; // Adjust based on content height
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format date for display
 */
function formatDateForDisplay(dateString?: string): string {
  if (!dateString) {
    return format(new Date(), "yyyy/MM/dd");
  }

  try {
    const date = new Date(dateString);
    return format(date, "yyyy/MM/dd");
  } catch (error) {
    return format(new Date(), "yyyy/MM/dd");
  }
}

/**
 * Get BMI category text
 */
function getBMICategoryText(bmiValue: string): string {
  if (bmiValue === "N/A") return "N/A";

  const bmi = parseFloat(bmiValue);
  if (isNaN(bmi)) return "Invalid";

  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obese Class I";
  if (bmi < 40) return "Obese Class II";
  return "Obese Class III";
}

/**
 * Calculate ideal weight from prescription data
 */
function calculateIdealWeightFromData(prescription: VoicePrescription): string {
  if (!prescription.height || !prescription.patientGender) {
    return "N/A";
  }

  const height = parseFloat(prescription.height);
  if (isNaN(height) || height <= 0) return "N/A";

  // Convert cm to inches
  const heightInInches = height / 2.54;
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;
  const totalInches = feet * 12 + inches;

  let idealWeight: number;

  if (prescription.patientGender === "Male") {
    // Hamwi method for men: 48 kg for first 5 feet + 2.7 kg per additional inch
    idealWeight = 48 + 2.7 * (totalInches - 60);
  } else {
    // Hamwi method for women: 45.5 kg for first 5 feet + 2.2 kg per additional inch
    idealWeight = 45.5 + 2.2 * (totalInches - 60);
  }

  return `${idealWeight.toFixed(1)} kg`;
}

/**
 * Calculate BMR from prescription data
 */
function calculateBMRFromData(prescription: VoicePrescription): string {
  if (
    !prescription.weight ||
    !prescription.height ||
    !prescription.patientAge ||
    !prescription.patientGender
  ) {
    return "N/A";
  }

  const weight = parseFloat(prescription.weight);
  const height = parseFloat(prescription.height);
  const age = parseFloat(prescription.patientAge);

  if (isNaN(weight) || isNaN(height) || isNaN(age)) {
    return "N/A";
  }

  // Mifflin-St Jeor Equation
  let bmr: number;
  if (prescription.patientGender === "Male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  return `${bmr.toFixed(0)} kcal/day`;
}

/**
 * Calculate body fat percentage from prescription data
 */
function calculateBodyFatFromData(prescription: VoicePrescription): string {
  if (
    !prescription.patientAge ||
    !prescription.patientGender ||
    !prescription.bmi
  ) {
    return "N/A";
  }

  const bmi = parseFloat(prescription.bmi);
  const age = parseFloat(prescription.patientAge);

  if (isNaN(bmi) || isNaN(age)) {
    return "N/A";
  }

  // Simple BMI-based estimation
  let bodyFat: number;
  if (prescription.patientGender === "Male") {
    bodyFat = 1.2 * bmi + 0.23 * age - 16.2;
  } else {
    bodyFat = 1.2 * bmi + 0.23 * age - 5.4;
  }

  return `${bodyFat.toFixed(1)}%`;
}

/**
 * Calculate water requirement from prescription data
 */
function calculateWaterFromData(prescription: VoicePrescription): string {
  if (!prescription.weight) {
    return "N/A";
  }

  const weight = parseFloat(prescription.weight);
  if (isNaN(weight) || weight <= 0) {
    return "N/A";
  }

  // Base water requirement: 30-35 ml per kg body weight (using average 32.5)
  const baseWater = weight * 32.5;

  return `${baseWater.toFixed(0)} ml/day`;
}

/**
 * Add Follow Up section to the right column before signature
 */
function addFollowUpSection(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  if (!prescription.followUp || !prescription.followUp.trim()) {
    return y; // No follow up content, return same y position
  }

  // Section header with accent line
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);

  const persianTranslation = HEADER_TRANSLATIONS["Follow Up"];
  if (persianTranslation) {
    drawBilingualText(
      doc,
      "FOLLOW UP INSTRUCTIONS",
      persianTranslation,
      x + 10,
      y + 11,
      config
    );
  } else {
    doc.text("FOLLOW UP INSTRUCTIONS", x + 10, y + 11);
  }

  y += 22;

  // Follow up content with background
  const maxWidth = width - 15;
  let currentY = y;

  // Add a light background for the follow up section
  doc.setFillColor(255, 253, 231); // Light yellow background
  doc.rect(x + 5, currentY, width - 10, 60, "F");

  // Add a border
  doc.setDrawColor(...config.colors.warning);
  doc.setLineWidth(0.5);
  doc.rect(x + 5, currentY, width - 10, 60, "S");

  // Draw follow up content
  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.body);
  doc.setTextColor(...config.colors.textDark);

  const followUpLines = doc.splitTextToSize(
    prescription.followUp.trim(),
    maxWidth - 10
  );

  // Start drawing text inside the box
  let textY = currentY + 8;
  const lineHeight =
    config.typography.fontSizes.body * config.typography.lineHeights.normal;

  for (let i = 0; i < followUpLines.length; i++) {
    // Don't overflow the box (max 4-5 lines)
    if (textY + lineHeight > currentY + 55) {
      // Add ellipsis if content is too long
      doc.setFont(config.typography.defaultFont, "italic");
      doc.text("...", x + width - 15, currentY + 55);
      break;
    }

    doc.text(followUpLines[i], x + 10, textY);
    textY += lineHeight;
  }

  return currentY + 65; // Return new Y position (box height + spacing)
}

// ==================== MAIN PDF GENERATION FUNCTION ====================

export async function generatePrescriptionPDF(
  prescription: VoicePrescription,
  userConfig?: Partial<PDFConfig>
): Promise<void> {
  // Merge user config with default config
  const config: PDFConfig = {
    ...defaultPDFConfig,
    ...userConfig,
    page: { ...defaultPDFConfig.page, ...userConfig?.page },
    colors: { ...defaultPDFConfig.colors, ...userConfig?.colors },
    typography: { ...defaultPDFConfig.typography, ...userConfig?.typography },
    logo: { ...defaultPDFConfig.logo, ...userConfig?.logo },
    layout: { ...defaultPDFConfig.layout, ...userConfig?.layout },
    patientInfo: {
      ...defaultPDFConfig.patientInfo,
      ...userConfig?.patientInfo,
    },
    clinicalHistory: {
      ...defaultPDFConfig.clinicalHistory,
      ...userConfig?.clinicalHistory,
    },
    vitalSigns: { ...defaultPDFConfig.vitalSigns, ...userConfig?.vitalSigns },
    medications: {
      ...defaultPDFConfig.medications,
      ...userConfig?.medications,
    },
    signature: { ...defaultPDFConfig.signature, ...userConfig?.signature },
    footer: { ...defaultPDFConfig.footer, ...userConfig?.footer },
    debug: { ...defaultPDFConfig.debug, ...userConfig?.debug },
  };

  const doc = new jsPDF({
    orientation: config.page.orientation,
    unit: config.page.unit,
    format: config.page.format,
  });

  // Set up font support
  doc.setFont("helvetica", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add 200px free space at the top
  const topSpacing = 100;
  let y = config.page.margins.top + topSpacing;

  // ==================== ENHANCED PATIENT INFORMATION SECTION ====================
  const patientSectionWidth =
    pageWidth - config.page.margins.left - config.page.margins.right;
  y = addEnhancedPatientInformation(
    doc,
    y,
    config.page.margins.left,
    patientSectionWidth,
    prescription,
    config
  );

  // Add some spacing after patient information
  y += 20;

  // ==================== TWO COLUMN LAYOUT ====================

  let leftColumnX = config.page.margins.left;
  let rightColumnX = config.page.margins.left;
  let leftColumnWidth = 0;
  let rightColumnWidth = 0;

  if (config.layout.twoColumn) {
    leftColumnWidth =
      pageWidth * config.layout.leftColumnWidth -
      config.page.margins.left -
      config.layout.columnGap / 2;
    rightColumnX = leftColumnX + leftColumnWidth + config.layout.columnGap;
    rightColumnWidth =
      pageWidth * config.layout.rightColumnWidth -
      config.page.margins.right -
      config.layout.columnGap / 2;
  } else {
    leftColumnWidth =
      pageWidth - config.page.margins.left - config.page.margins.right;
    rightColumnWidth = 0;
  }

  let yLeft = y;
  let yRight = y;

  // ==================== LEFT COLUMN: FIXED HEIGHT SECTIONS ====================

  if (config.clinicalHistory.show && config.layout.twoColumn) {
    // Calculate layout to guarantee everything fits
    const leftLayout = calculateLeftColumnLayout(prescription, config);

    // Add vertical separator
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.5);
    doc.line(
      leftColumnX + leftColumnWidth + config.layout.columnGap / 2,
      yLeft,
      leftColumnX + leftColumnWidth + config.layout.columnGap / 2,
      yLeft + leftLayout.totalHeight + 20
    );

    // Draw each section with fixed height
    let currentY = yLeft;
    for (const section of leftLayout.sections) {
      drawFixedHeightSection(
        doc,
        section.title,
        section.content,
        leftColumnX,
        currentY,
        leftColumnWidth,
        section.height,
        config
      );
      currentY += section.height + config.layout.sectionSpacing;
    }

    yLeft = currentY;
  }

  // ==================== RIGHT COLUMN: MAIN CONTENT ====================

  // VITAL SIGNS
  if (config.vitalSigns.show && hasVitalSigns(prescription)) {
    yRight = addCompactVitalSigns(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // BODY METRICS SECTION
  if (config.bodyMetrics.show && hasBodyMetrics(prescription)) {
    yRight = addBodyMetricsSection(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // LAB EXAMS SECTION
  if (prescription.medicalExams?.length || prescription.examNotes) {
    yRight = addLabExamsSection(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // MEDICATIONS
  if (config.medications.show) {
    yRight = addCompactMedicationsTable(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // ==================== ADD FOLLOW UP SECTION ====================
  // THIS IS THE CRITICAL LINE THAT'S MISSING!
  // Add Follow Up section after medications
  if (prescription.followUp && prescription.followUp.trim()) {
    yRight = addFollowUpSection(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // ==================== SIGNATURE ====================

  if (config.signature.show) {
    // Use fixed position at bottom of page
    addCompactSignature(doc, yRight, pageWidth, prescription, config);
  }

  // ==================== FOOTER ====================

  if (config.footer.show) {
    addFooter(doc, pageWidth, pageHeight, prescription, config);
  }

  // ==================== SAVE PDF ====================

  const fileName = generateFileName(prescription);
  doc.save(fileName);
}

// ==================== COMPACT HELPER FUNCTIONS ====================

function createPatientInfoRows(
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const rows = [];
  const fields = config.patientInfo.include;

  const fieldMap: Record<string, { label: string; value: string }> = {
    name: {
      label: "Name",
      value: prescription.patientName || "N/A",
    },
    age: {
      label: "Age",
      value: prescription.patientAge
        ? `${prescription.patientAge} years`
        : "N/A",
    },
    gender: {
      label: "Sex",
      value: prescription.patientGender || "N/A",
    },
    date: {
      label: "Date",
      value: prescription.date
        ? format(new Date(prescription.date), "yyyy/MM/dd")
        : format(new Date(), "yyyy/MM/dd"),
    },
    weight: {
      label: "Weight",
      value: prescription.weight ? `${prescription.weight} kg` : "N/A",
    },
    height: {
      label: "Height",
      value: prescription.height ? `${prescription.height} cm` : "N/A",
    },
    bmi: {
      label: "BMI",
      value: prescription.bmi || "N/A",
    },
    bodyFat: {
      label: "Body Fat",
      value: prescription.bodyFatPercentage
        ? `${prescription.bodyFatPercentage}%`
        : "N/A",
    },
    address: {
      label: "Address",
      value: prescription.patientAddress || "N/A",
    },
  };

  for (const field of fields) {
    if (fieldMap[field]) {
      rows.push({
        label: fieldMap[field].label,
        value: fieldMap[field].value,
      });
    }
  }

  return rows;
}

function addCompactVitalSigns(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  const persianTranslation = HEADER_TRANSLATIONS["VITAL SIGNS"];
  if (persianTranslation) {
    drawBilingualText(
      doc,
      "VITAL SIGNS",
      persianTranslation,
      x + 10,
      y + 11,
      config
    );
  } else {
    doc.text("VITAL SIGNS", x + 10, y + 11);
  }

  y += 22;

  const vitalSigns = [
    {
      key: "pulse",
      label: "PR",
      value: prescription.pulseRate,
      unit: "bpm",
    },
    { key: "bp", label: "BP", value: prescription.bloodPressure, unit: "bp" },
    { key: "temp", label: "Temp", value: prescription.temperature, unit: "°C" },
    {
      key: "respiratory",
      label: "RR",
      value: prescription.respiratoryRate,
      unit: "/min",
    },
    {
      key: "oxygen",
      label: "SPO2",
      value: prescription.oxygenSaturation,
      unit: "%",
    },
  ];

  const filteredVitals = vitalSigns.filter(
    (vital) => config.vitalSigns.include.includes(vital.key) && vital.value
  );

  if (filteredVitals.length === 0) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No vital signs recorded", x + 10, y);
    return y + 15;
  }

  // Compact grid layout
  const cols = 3;
  const rows = Math.ceil(filteredVitals.length / cols);
  const cellWidth = (width - 20) / cols;
  const cellHeight = 25;
  const startX = x + 10;
  const startY = y;

  for (let i = 0; i < filteredVitals.length; i++) {
    const vital = filteredVitals[i];
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cellX = startX + col * cellWidth;
    const cellY = startY + row * cellHeight;

    // Background
    doc.setFillColor(245, 255, 245);
    doc.rect(cellX, cellY, cellWidth - 5, cellHeight - 5, "F");

    // Border
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.3);
    doc.rect(cellX, cellY, cellWidth - 5, cellHeight - 5, "S");

    // Label
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.primary);
    doc.text(vital.label, cellX + 5, cellY + 8);

    // Value
    const valueText =
      config.vitalSigns.showUnits && vital.unit
        ? `${vital.value} ${vital.unit}`.trim()
        : vital.value!;

    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body); // Increased font size for vital sign values to make them more prominent
    doc.setTextColor(...config.colors.textDark);

    const textWidth = doc.getTextWidth(valueText);
    const centeredX = cellX + (cellWidth - 5 - textWidth) / 2;
    doc.text(valueText, Math.max(centeredX, cellX + 5), cellY + 18);
  }

  y += rows * cellHeight + 10;
  return y;
}

function addCompactMedicationsTable(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const medications = prescription.medicines || [];

  // Remove duplicates based on medicine name, dosage, frequency, and duration
  const uniqueMedications = medications.filter((med, index, self) => {
    const key = `${med.medicine}-${med.dosage}-${med.frequency}-${med.duration}`;
    return (
      index ===
      self.findIndex(
        (m) => `${m.medicine}-${m.dosage}-${m.frequency}-${m.duration}` === key
      )
    );
  });

  if (uniqueMedications.length === 0) {
    // Section header
    doc.setFillColor(...config.colors.accent);
    doc.rect(x, y, 4, 16, "F");

    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.heading);
    doc.setTextColor(...config.colors.primary);
    const persianTranslation = HEADER_TRANSLATIONS["PRESCRIPTIONS"];
    if (persianTranslation) {
      drawBilingualText(
        doc,
        "PRESCRIPTIONS",
        persianTranslation,
        x + 10,
        y + 11,
        config
      );
    } else {
      doc.text("PRESCRIPTIONS", x + 10, y + 11);
    }

    y += 28; // Increased spacing from 22 to 28 for consistency

    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No medications prescribed", x + 10, y);

    return y + 15;
  }

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  const persianTranslation = HEADER_TRANSLATIONS["PRESCRIPTIONS"];
  if (persianTranslation) {
    drawBilingualText(
      doc,
      "PRESCRIPTIONS",
      persianTranslation,
      x + 10,
      y + 11,
      config
    );
  } else {
    doc.text("PRESCRIPTIONS", x + 10, y + 11);
  }

  y += 28; // Increased spacing from 22 to 28 for more space between title and table

  const headers = config.medications.table.headers;
  const columnWidths = config.medications.table.columnWidths;
  const startX = x + 5;
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0);

  // Table headers
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.small);
  doc.setTextColor(...config.colors.primary);

  let xPos = startX;
  for (let i = 0; i < headers.length; i++) {
    const padding = i === 0 ? 2 : 5;
    doc.text(headers[i], xPos + padding, y, {
      maxWidth: columnWidths[i] - padding * 2,
    });
    xPos += columnWidths[i];
  }

  // Header line
  y += 6;
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.3);
  doc.line(startX, y, startX + totalWidth, y);
  y += 10;

  // Track if we've added a new page
  let currentPage = 1;
  let rowCount = 0;
  const maxRowsOnFirstPage = config.medications.table.maxRowsOnFirstPage;

  // Process medications with proper pagination
  for (let i = 0; i < uniqueMedications.length; i++) {
    const med = uniqueMedications[i];

    // Check if we need a new page
    if (rowCount >= maxRowsOnFirstPage) {
      doc.addPage();
      y = config.page.margins.top;
      rowCount = 0;
      currentPage++;

      // Repeat headers on new page
      xPos = startX;
      for (let j = 0; j < headers.length; j++) {
        const padding = j === 0 ? 2 : 5;
        doc.text(headers[j], xPos + padding, y, {
          maxWidth: columnWidths[j] - padding * 2,
        });
        xPos += columnWidths[j];
      }
      y += 12;
    }

    // Row background
    if (config.medications.table.stripedRows && i % 2 === 0) {
      doc.setFillColor(...config.colors.tableStriped);
      doc.rect(
        startX,
        y - 5,
        totalWidth,
        config.medications.table.rowHeight,
        "F"
      );
    }

    // Row data
    const rowData = [
      config.medications.table.showRowNumbers ? `${i + 1}.` : "",
      med.medicine || "N/A",
      getMedicationField(med, "dosage", config),
      getMedicationField(med, "frequency", config),
      getMedicationField(med, "duration", config),
      getMedicationField(med, "instructions", config),
    ];

    xPos = startX;
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body); // Increased font size for medication data
    doc.setTextColor(...config.colors.textDark);

    for (let j = 0; j < rowData.length; j++) {
      const padding = j === 0 ? 2 : 5;
      const lines = doc.splitTextToSize(
        rowData[j],
        columnWidths[j] - padding * 2
      );

      for (let k = 0; k < lines.length; k++) {
        if (k === 0) {
          doc.text(lines[k], xPos + padding, y + k * 8);
        } else {
          doc.text(lines[k], xPos + padding, y + k * 8 + 2);
        }
      }
      xPos += columnWidths[j];
    }

    y += config.medications.table.rowHeight + 2;
    rowCount++;
  }

  return y + 10;
}
/**
 * Parse allergies text to array (same logic as MedicalHistory component)
 */
function parseAllergiesText(text: string | undefined): string[] {
  if (!text || typeof text !== "string") return [];

  const trimmedText = text.trim();
  if (!trimmedText) return [];

  // 1. Check if it's in numbered list format (like from PDF)
  // Format: "1. t\n2. e\n3. s\n4. t" or similar
  if (/^\d+\.\s+.+/m.test(trimmedText)) {
    // Split by newline and extract text after number and dot
    return trimmedText
      .split("\n")
      .map((line) => {
        const match = line.match(/^\d+\.\s+(.+)$/);
        return match ? match[1].trim() : line.trim();
      })
      .filter((item) => item.length > 0);
  }

  // 2. Check if it's in bullet point format
  if (/^[•\-*]\s+.+/m.test(trimmedText)) {
    return trimmedText
      .split("\n")
      .map((line) => line.replace(/^[•\-*]\s+/, "").trim())
      .filter((item) => item.length > 0);
  }

  // 3. Handle comma-separated values
  if (trimmedText.includes(",")) {
    return trimmedText
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  // 4. If it's a single item or unknown format, just return it as array
  return [trimmedText];
}

/**
 * Add Diagnosis section to right column (shows allergies)
 */
function addDiagnosisSection(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  if (!prescription.allergies) {
    return y; // No content, return same y position
  }

  // Parse allergies to handle different formats
  const allergies = parseAllergiesText(prescription.allergies);

  if (allergies.length === 0) {
    return y; // No valid allergies found
  }

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  const persianTranslation = HEADER_TRANSLATIONS["DIAGNOSIS"];
  if (persianTranslation) {
    drawBilingualText(
      doc,
      "DIAGNOSIS",
      persianTranslation,
      x + 10,
      y + 11,
      config
    );
  } else {
    doc.text("DIAGNOSIS", x + 10, y + 11);
  }

  y += 22;

  // Diagnosis content (allergies as numbered list)
  const maxWidth = width - 15;
  let currentY = y;

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.body);
  doc.setTextColor(...config.colors.textDark);

  for (let i = 0; i < allergies.length; i++) {
    const allergy = allergies[i];
    const itemText = `${i + 1}. ${allergy}`;

    // Split text if too long
    const lines = doc.splitTextToSize(itemText, maxWidth);

    for (let j = 0; j < lines.length; j++) {
      doc.text(lines[j], x + 5, currentY);
      currentY +=
        config.typography.fontSizes.body * config.typography.lineHeights.normal;
    }

    currentY += 2; // Small gap between items
  }

  return currentY + 8; // Add some spacing after the section
}

function addCompactSignature(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerHeight = config.footer.show ? config.footer.height : 0;

  // Fixed position independent of footer - much higher positioning
  const signatureY = pageHeight - 120;
  const rightSectionX = pageWidth - config.page.margins.right - 200;

  // Signature line with green color
  doc.setDrawColor(...config.colors.primary);
  doc.setLineWidth(config.signature.lineWidth);
  doc.line(
    rightSectionX,
    signatureY,
    rightSectionX + config.signature.lineLength,
    signatureY
  );

  // Doctor name
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text(
    prescription.doctorName,
    rightSectionX + config.signature.lineLength / 2,
    signatureY + 15,
    { align: "center" }
  );

  // Title
  if (config.signature.includeTitle) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);
    doc.text(
      "Medical Practitioner",
      rightSectionX + config.signature.lineLength / 2,
      signatureY + 25,
      { align: "center" }
    );
  }
}

function addFooter(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const footerY = pageHeight - config.footer.height;

  // Only show digital note in footer
  if (config.footer.showDigitalNote) {
    doc.setFontSize(config.typography.fontSizes.micro);
    doc.setTextColor(...config.colors.textDark);
    doc.text(
      "در ختم دوا دوباره مراجعه گردد مهرباني وکړئ د درملنې په پای کې بیرته راشئ.",
      pageWidth / 2,
      footerY - 40,
      {
        align: "center",
      }
    );
  }

  // Optionally, you can still show page numbers here
  if (config.footer.showPageNumbers) {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(config.typography.fontSizes.micro);
      doc.setTextColor(...config.colors.textDark);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - config.page.margins.right - 20,
        pageHeight - config.page.margins.bottom + 10
      );
    }
  }
}

function generateFileName(prescription: VoicePrescription): string {
  const prescriptionDate = prescription.date
    ? new Date(prescription.date)
    : new Date();
  const formattedDate = format(prescriptionDate, "yyyy-MM-dd");
  const name = prescription.patientName.toLowerCase().replace(/\s+/g, "-");
  return `prescription-${name}-${formattedDate}.pdf`;
}

function hasVitalSigns(prescription: VoicePrescription): boolean {
  return [
    prescription.pulseRate,
    prescription.bloodPressure,
    prescription.temperature,
    prescription.respiratoryRate,
    prescription.oxygenSaturation,
  ].some((v) => v && v.trim() !== "");
}

function hasBodyMetrics(prescription: VoicePrescription): boolean {
  return [
    prescription.waistCircumference,
    prescription.hipCircumference,
    prescription.bodyFatPercentage,
    prescription.leanBodyMass,
    prescription.idealBodyWeight,
    prescription.adjustedBodyWeight,
    prescription.basalMetabolicRate,
    prescription.totalDailyEnergyExpenditure,
    prescription.bodySurfaceArea,
    prescription.waistToHeightRatio,
    prescription.waterRequirement,
  ].some((v) => v && v.trim() !== "");
}

/**
 * Add Body Metrics section to PDF
 */
function addBodyMetricsSection(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text("BODY METRICS", x + 10, y + 11);

  y += 22;

  // Body metrics data
  const bodyMetrics = [
    {
      key: "waistCircumference",
      label: "Waist Circumference",
      value: prescription.waistCircumference,
      unit: "cm",
    },
    {
      key: "bodyFatPercentage",
      label: "Body Fat Percentage",
      value: prescription.bodyFatPercentage,
      unit: "%",
    },
    {
      key: "leanBodyMass",
      label: "Lean Body Mass",
      value: prescription.leanBodyMass,
      unit: "kg",
    },
    {
      key: "idealBodyWeight",
      label: "Ideal Body Weight",
      value: prescription.idealBodyWeight,
      unit: "kg",
    },
    {
      key: "adjustedBodyWeight",
      label: "Adjusted Body Weight",
      value: prescription.adjustedBodyWeight,
      unit: "kg",
    },
    {
      key: "basalMetabolicRate",
      label: "Basal Metabolic Rate",
      value: prescription.basalMetabolicRate,
      unit: "kcal/day",
    },
    {
      key: "totalDailyEnergyExpenditure",
      label: "TDEE",
      value: prescription.totalDailyEnergyExpenditure,
      unit: "kcal/day",
    },
    {
      key: "bodySurfaceArea",
      label: "Body Surface Area",
      value: prescription.bodySurfaceArea,
      unit: "m²",
    },
    {
      key: "waistToHeightRatio",
      label: "Waist-to-Height Ratio",
      value: prescription.waistToHeightRatio,
      unit: "",
    },
    {
      key: "waterRequirement",
      label: "Daily Water Requirement",
      value: prescription.waterRequirement,
      unit: "ml",
    },
  ];

  const filteredMetrics = bodyMetrics.filter(
    (metric) => config.bodyMetrics.include.includes(metric.key) && metric.value
  );

  if (filteredMetrics.length === 0) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No body metrics recorded", x + 10, y);
    return y + 15;
  }

  // Display metrics in a compact grid layout
  const cols = config.bodyMetrics.compactMode ? 2 : 3;
  const rows = Math.ceil(filteredMetrics.length / cols);
  const cellWidth = (width - 20) / cols;
  const cellHeight = 30;
  const startX = x + 10;
  const startY = y;

  for (let i = 0; i < filteredMetrics.length; i++) {
    const metric = filteredMetrics[i];
    const row = Math.floor(i / cols);
    const col = i % cols;
    const cellX = startX + col * cellWidth;
    const cellY = startY + row * cellHeight;

    // Background
    doc.setFillColor(250, 250, 250);
    doc.rect(cellX, cellY, cellWidth - 5, cellHeight - 5, "F");

    // Border
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.3);
    doc.rect(cellX, cellY, cellWidth - 5, cellHeight - 5, "S");

    // Label
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.tiny);
    doc.setTextColor(...config.colors.primary);
    doc.text(metric.label, cellX + 5, cellY + 8);

    // Value
    const valueText =
      config.bodyMetrics.showUnits && metric.unit
        ? `${metric.value} ${metric.unit}`.trim()
        : metric.value!;

    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);

    const textWidth = doc.getTextWidth(valueText);
    const centeredX = cellX + (cellWidth - 5 - textWidth) / 2;
    doc.text(valueText, Math.max(centeredX, cellX + 5), cellY + 18);
  }

  y += rows * cellHeight + 10;
  return y;
}

function hasSystemExaminations(prescription: VoicePrescription): boolean {
  const examinationFields = [
    prescription.cnsExamination,
    prescription.cardiovascularExamination,
    prescription.respiratoryExamination,
    prescription.gastrointestinalExamination,
    prescription.musculoskeletalExamination,
    prescription.genitourinaryExamination,
    prescription.dermatologicalExamination,
    prescription.entExamination,
    prescription.ophthalmologicalExamination,
  ];

  return examinationFields.some(
    (value) =>
      value !== undefined &&
      value !== null &&
      typeof value === "string" &&
      value.trim() !== ""
  );
}

/**
 * Add Lab Exams section with gradient 3-column layout to right column
 */
function addLabExamsSection(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  if (!prescription.medicalExams?.length && !prescription.examNotes) {
    return y; // No content, return same y position
  }

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  const persianTranslation = HEADER_TRANSLATIONS["Lab Exams"];
  if (persianTranslation) {
    drawBilingualText(
      doc,
      "Lab Exams",
      persianTranslation,
      x + 10,
      y + 11,
      config
    );
  } else {
    doc.text("Lab Exams", x + 10, y + 11);
  }

  y += 22;

  const medicalExams = prescription.medicalExams || [];
  const examNotes = prescription.examNotes;

  if (medicalExams.length === 0 && !examNotes) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No lab exams recorded", x + 10, y);
    return y + 15;
  }

  // 3-column gradient layout for lab exams
  const cols = 3;
  const columnGap = 8;
  const cellWidth = (width - 20 - (cols - 1) * columnGap) / cols;
  const cellHeight = 25; // Reduced height for each lab exam card (was 60)
  const startX = x + 10;
  const startY = y;

  let currentY = startY;
  let currentCol = 0;

  // Create gradient colors for each column
  const gradientColors: [number, number, number][] = [
    [240, 248, 255], // Light Blue gradient start
    [230, 255, 230], // Light Green gradient start
    [255, 248, 220], // Light Orange gradient start
  ];

  const gradientColorsEnd: [number, number, number][] = [
    [220, 235, 245], // Light Blue gradient end
    [200, 245, 200], // Light Green gradient end
    [245, 235, 200], // Light Orange gradient end
  ];

  // Render medical exams in 3-column layout
  for (let i = 0; i < medicalExams.length; i++) {
    const exam = medicalExams[i];
    const cellX = startX + currentCol * (cellWidth + columnGap);
    const cellY = currentY;

    // Draw gradient background for each cell
    doc.setFillColor(...gradientColors[currentCol]);
    doc.rect(cellX, cellY, cellWidth, cellHeight, "F");

    // Add subtle gradient border
    doc.setDrawColor(...gradientColorsEnd[currentCol]);
    doc.setLineWidth(0.5);
    doc.rect(cellX, cellY, cellWidth, cellHeight, "S");

    // Add left accent bar with different colors for each column
    const accentColors: [number, number, number][] = [
      [100, 149, 237], // Cornflower Blue
      [60, 179, 113], // Medium Sea Green
      [255, 140, 0], // Dark Orange
    ];
    doc.setFillColor(...accentColors[currentCol]);
    doc.rect(cellX, cellY, 3, cellHeight, "F");

    // Exam content
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);

    // Split exam name into lines if too long
    const examLines = doc.splitTextToSize(exam, cellWidth - 12);
    const lineHeight =
      config.typography.fontSizes.body * config.typography.lineHeights.normal;

    let textY = cellY + 12;
    for (let j = 0; j < Math.min(examLines.length, 3); j++) {
      // Max 3 lines per exam
      doc.text(examLines[j], cellX + 6, textY);
      textY += lineHeight;
    }

    // Removed exam number badge - no auto-increment numbers

    // Move to next column or row
    currentCol++;
    if (currentCol >= cols) {
      currentCol = 0;
      currentY += cellHeight + 6; // Gap between rows
    }
  }

  // Update currentY if we have exams
  if (medicalExams.length > 0) {
    const rowsUsed = Math.ceil(medicalExams.length / cols);
    currentY = startY + rowsUsed * cellHeight + (rowsUsed - 1) * 6;
  }

  // Add exam notes if present
  if (examNotes) {
    // Add spacing before exam notes
    currentY += 10;

    // Section title for notes
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Exam Notes:", x + 10, currentY);
    currentY += 12;

    // Notes content
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);

    const notesLines = doc.splitTextToSize(examNotes, width - 20);
    for (let i = 0; i < notesLines.length; i++) {
      doc.text(notesLines[i], x + 10, currentY);
      currentY +=
        config.typography.fontSizes.body * config.typography.lineHeights.normal;
    }
  }

  return currentY + 8; // Add some spacing after the section
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;
