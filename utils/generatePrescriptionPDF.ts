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
  allergies?: string[];
  currentMedications?: string[];
  medicationUsage?: string;
  familyHistory?: string;
  socialHistory?: string;
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
      labExams: number;
      diagnosis: number;
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
      labExams: boolean;
      diagnosis: boolean;
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
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
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
      title: 14,
      subtitle: 12,
      heading: 10,
      subheading: 9,
      body: 8,
      small: 7,
      tiny: 6,
      micro: 5,
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
      labExams: 90, // 90pt height (more space for lists)
      diagnosis: 60, // 60pt height
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
    include: ["name", "age", "gender", "date", "weight", "height", "bmi"],
  },

  clinicalHistory: {
    show: true,
    sections: {
      chiefComplaint: true,
      medicalHistory: true,
      labExams: true,
      diagnosis: true,
      familyHistory: true,
      socialHistory: true,
      examNotes: true,
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
      height: 18,
      gap: 2,
      borderRadius: 2,
    },
    include: ["pulse", "bp", "heart", "temp", "respiratory", "oxygen"],
    showUnits: true,
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
      rowHeight: 18, // Smaller row height
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

// ==================== HELPER FUNCTIONS ====================

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

  // Draw section background
  doc.setFillColor(...config.colors.sectionBg);
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.3);

  if (config.clinicalHistory.boxStyle === "rounded") {
    // Use rect instead of roundedRect for compatibility
    doc.rect(x, y, width, height, "FD");
  } else {
    doc.rect(x, y, width, height, "FD");
  }

  // Draw left accent bar
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 3, height, "F");

  // Section title
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.sectionHeader);
  doc.text(title, x + padding.left + 5, y + padding.top + 8);

  // Draw a subtle divider under title
  doc.setDrawColor(...config.colors.divider);
  doc.setLineWidth(0.2);
  doc.line(
    x + padding.left,
    y + padding.top + 12,
    x + width - padding.right,
    y + padding.top + 12
  );

  // Content area
  const contentY =
    y + padding.top + config.typography.fontSizes.subheading * 1.2 + 5;

  // Optimize font size for content
  let fontSize = config.typography.fontSizes.tiny;
  if (config.clinicalHistory.autoFontSize) {
    fontSize = optimizeFontSizeForContent(
      doc,
      content,
      contentWidth,
      contentHeight,
      config
    );
  }

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...config.colors.textDark);

  if (Array.isArray(content) && content.length > 0) {
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

      doc.text(lines[i], x + padding.left, currentY);
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
    sections.push({
      title: "Chief Complaint",
      content: prescription.chiefComplaint,
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
      title: "Medical History",
      content: prescription.pastMedicalHistory,
      height: config.layout.leftSectionHeights.medicalHistory,
    });
    totalHeight +=
      config.layout.leftSectionHeights.medicalHistory +
      config.layout.sectionSpacing;
  }

  if (
    prescription.medicalExams?.length &&
    config.clinicalHistory.sections.labExams
  ) {
    sections.push({
      title: "Lab Exams",
      content: prescription.medicalExams,
      height: config.layout.leftSectionHeights.labExams,
    });
    totalHeight +=
      config.layout.leftSectionHeights.labExams + config.layout.sectionSpacing;
  }

  if (
    prescription.allergies?.length &&
    config.clinicalHistory.sections.diagnosis
  ) {
    sections.push({
      title: "Diagnosis",
      content: prescription.allergies,
      height: config.layout.leftSectionHeights.diagnosis,
    });
    totalHeight +=
      config.layout.leftSectionHeights.diagnosis + config.layout.sectionSpacing;
  }

  if (
    prescription.familyHistory &&
    config.clinicalHistory.sections.familyHistory
  ) {
    sections.push({
      title: "Family History",
      content: prescription.familyHistory,
      height: config.layout.leftSectionHeights.familyHistory,
    });
    totalHeight +=
      config.layout.leftSectionHeights.familyHistory +
      config.layout.sectionSpacing;
  }

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

  if (prescription.examNotes && config.clinicalHistory.sections.examNotes) {
    sections.push({
      title: "Exam Notes",
      content: prescription.examNotes,
      height: config.layout.leftSectionHeights.examNotes,
    });
    totalHeight += config.layout.leftSectionHeights.examNotes;
  }

  // Remove last section spacing
  if (sections.length > 0) {
    totalHeight -= config.layout.sectionSpacing;
  }

  return { totalHeight, sections };
}

function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
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

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = config.page.margins.top;

  // ==================== PATIENT INFORMATION ====================

  if (config.patientInfo.show) {
    const patientBoxWidth =
      pageWidth - config.page.margins.left - config.page.margins.right;

    y += 25;

    // Patient Info Grid - Compact version
    const patientInfoRows = createPatientInfoRows(prescription, config);
    const columnWidth = patientBoxWidth / config.patientInfo.columns;
    const rowHeight = 12;
    let rowY = y;

    doc.setFontSize(config.typography.fontSizes.small);

    for (let i = 0; i < patientInfoRows.length; i++) {
      const info = patientInfoRows[i];
      const col = i % config.patientInfo.columns;
      const row = Math.floor(i / config.patientInfo.columns);
      const xPos = config.page.margins.left + 5 + col * columnWidth;
      const yPos = rowY + row * rowHeight;

      if (config.patientInfo.showLabels) {
        doc.setFont(
          config.typography.defaultFont,
          config.patientInfo.labelStyle
        );
        doc.setTextColor(...config.colors.primary);
        doc.text(info.label + ":", xPos, yPos);

        doc.setFont(config.typography.defaultFont, "normal");
        doc.setTextColor(...config.colors.textDark);
        const labelWidth = doc.getTextWidth(info.label + ": ");
        doc.text(info.value, xPos + labelWidth, yPos);
      } else {
        doc.setTextColor(...config.colors.textDark);
        doc.text(info.value, xPos, yPos);
      }
    }

    y +=
      Math.ceil(patientInfoRows.length / config.patientInfo.columns) *
        rowHeight +
      15;

    // Green divider line
    doc.setDrawColor(...config.colors.divider);
    doc.setLineWidth(0.5);
    doc.line(
      config.page.margins.left,
      y - 5,
      config.page.margins.left + patientBoxWidth,
      y - 5
    );
  }

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

  // SYSTEM EXAMINATIONS
  if (hasSystemExaminations(prescription)) {
    yRight = addCompactSystemExaminations(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // MEDICATIONS - Always show on first page, continue to second if needed
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

  // ==================== SIGNATURE ====================

  if (config.signature.show) {
    const footerHeight = config.footer.show ? config.footer.height : 0;
    const signatureY = Math.min(pageHeight - footerHeight - 40, yRight + 20);
    addCompactSignature(doc, signatureY, pageWidth, prescription, config);
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
      label: "Gender",
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
  doc.text("VITAL SIGNS", x + 10, y + 11);

  y += 22;

  const vitalSigns = [
    {
      key: "pulse",
      label: "Pulse",
      value: prescription.pulseRate,
      unit: "bpm",
    },
    { key: "bp", label: "BP", value: prescription.bloodPressure, unit: "" },
    {
      key: "heart",
      label: "Heart",
      value: prescription.heartRate,
      unit: "bpm",
    },
    { key: "temp", label: "Temp", value: prescription.temperature, unit: "°C" },
    {
      key: "respiratory",
      label: "Resp",
      value: prescription.respiratoryRate,
      unit: "/min",
    },
    {
      key: "oxygen",
      label: "O₂ Sat",
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

    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);

    const textWidth = doc.getTextWidth(valueText);
    const centeredX = cellX + (cellWidth - 5 - textWidth) / 2;
    doc.text(valueText, Math.max(centeredX, cellX + 5), cellY + 18);
  }

  y += rows * cellHeight + 10;
  return y;
}

function addCompactSystemExaminations(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const examinations = [
    { label: "CNS", value: prescription.cnsExamination },
    { label: "Cardio", value: prescription.cardiovascularExamination },
    { label: "Resp", value: prescription.respiratoryExamination },
    { label: "GI", value: prescription.gastrointestinalExamination },
    { label: "MSK", value: prescription.musculoskeletalExamination },
    { label: "GU", value: prescription.genitourinaryExamination },
    { label: "Derm", value: prescription.dermatologicalExamination },
    { label: "ENT", value: prescription.entExamination },
    { label: "Ophth", value: prescription.ophthalmologicalExamination },
  ];

  const validExams = examinations.filter(
    (exam) => exam.value && exam.value.trim()
  );

  if (validExams.length === 0) {
    return y;
  }

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y, 4, 16, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text("SYSTEM EXAMS", x + 10, y + 11);

  y += 22;

  // Draw exams in a compact format
  const maxWidth = width - 20;
  const lineHeight = 9;
  let currentY = y;

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.tiny);
  doc.setTextColor(...config.colors.textDark);

  for (const exam of validExams) {
    if (
      currentY + lineHeight >
      doc.internal.pageSize.getHeight() - config.page.margins.bottom - 50
    ) {
      break;
    }

    // Exam label
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setTextColor(...config.colors.primary);
    doc.text(`${exam.label}:`, x + 10, currentY);

    const labelWidth = doc.getTextWidth(`${exam.label}: `);

    // Exam value (truncated if too long)
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setTextColor(...config.colors.textDark);
    const maxTextWidth = maxWidth - labelWidth - 10;
    const lines = doc.splitTextToSize(exam.value!, maxTextWidth);

    for (let i = 0; i < lines.length; i++) {
      if (i === 0) {
        doc.text(lines[i], x + 10 + labelWidth, currentY);
      } else {
        currentY += lineHeight;
        doc.text(lines[i], x + 10, currentY);
      }
    }

    currentY += lineHeight + 2;
  }

  return currentY + 5;
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
    doc.text("PRESCRIPTIONS", x + 10, y + 11);

    y += 22;

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
  doc.text("PRESCRIPTIONS", x + 10, y + 11);

  y += 22;

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
  y += 4;
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.3);
  doc.line(startX, y, startX + totalWidth, y);
  y += 8;

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
    doc.setFontSize(config.typography.fontSizes.tiny);
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

function addCompactSignature(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const rightSectionX = pageWidth - config.page.margins.right - 200;

  // Signature line with green color
  doc.setDrawColor(...config.colors.primary);
  doc.setLineWidth(config.signature.lineWidth);
  doc.line(rightSectionX, y, rightSectionX + config.signature.lineLength, y);

  // Doctor name
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text(
    prescription.doctorName,
    rightSectionX + config.signature.lineLength / 2,
    y + 15,
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
      y + 25,
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

  // Digital note with green color
  if (config.footer.showDigitalNote) {
    doc.setFontSize(config.typography.fontSizes.micro);
    doc.setTextColor(...config.colors.textDark);
    doc.text("Digitally generated prescription", pageWidth / 2, footerY + 10, {
      align: "center",
    });
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
    prescription.heartRate,
    prescription.temperature,
    prescription.respiratoryRate,
    prescription.oxygenSaturation,
  ].some((v) => v && v.trim() !== "");
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

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;
