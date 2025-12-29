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

  // Colors - Updated to green theme
  colors: {
    primary: [number, number, number];
    accent: [number, number, number];
    bgLight: [number, number, number];
    textDark: [number, number, number];
    border: [number, number, number];
    tableStriped: [number, number, number];
    warning: [number, number, number];
    success: [number, number, number];
    sectionBg: [number, number, number];
    sectionHeader: [number, number, number];
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

  // Layout Structure
  layout: {
    twoColumn: boolean;
    leftColumnWidth: number;
    rightColumnWidth: number;
    columnGap: number;
    sectionSpacing: number;
    blockSpacing: number;
    lineSpacing: number;
    minSectionHeight: number;
    maxSectionHeight: number;
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

  // Clinical History (Left Column)
  clinicalHistory: {
    show: boolean;
    sections: {
      labExams: boolean;
      allergies: boolean;
      currentMeds: boolean;
      familyHistory: boolean;
      socialHistory: boolean;
    };
    boxStyle: "rounded" | "flat";
    autoHeight: boolean; // New: Enable auto height calculation
    minHeight: number; // Minimum section height
    maxHeight: number; // Maximum section height before overflow
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
    };
  };

  // Instructions
  instructions: {
    show: boolean;
    sections: {
      general: boolean;
      followUp: boolean;
      restrictions: boolean;
    };
    indent: number;
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

  // Page Break Control
  pageBreak: {
    enabled: boolean;
    minBottomMargin: number;
    repeatHeaders: boolean;
  };

  // Debug/Development
  debug: {
    showBorders: boolean;
    showGrid: boolean;
    logPositions: boolean;
    showCalculations: boolean;
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
    primary: [34, 139, 34], // Forest Green
    accent: [50, 205, 50], // Lime Green
    bgLight: [240, 255, 240], // Honeydew
    textDark: [0, 51, 0], // Dark Green
    border: [144, 238, 144], // Light Green
    tableStriped: [245, 255, 245], // Mint Cream
    warning: [255, 215, 0], // Gold
    success: [60, 179, 113], // Medium Sea Green
    sectionBg: [230, 255, 230], // Very Light Green
    sectionHeader: [0, 100, 0], // Dark Green
  },

  typography: {
    defaultFont: "vazirmatn",
    fontSizes: {
      title: 14,
      subtitle: 12,
      heading: 8,
      subheading: 8,
      body: 10,
      small: 9,
      tiny: 8,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
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
    leftColumnWidth: 0.25,
    rightColumnWidth: 0.75,
    columnGap: 15,
    sectionSpacing: 25,
    blockSpacing: 15,
    lineSpacing: 5,
    minSectionHeight: 30,
    maxSectionHeight: 200,
  },

  patientInfo: {
    show: true,
    boxStyle: "rounded",
    borderRadius: 5,
    columns: 4,
    showLabels: true,
    labelStyle: "bold",
    include: ["name", "age", "gender", "date", "weight", "height", "bmi"],
  },

  clinicalHistory: {
    show: true,
    sections: {
      labExams: true,
      allergies: true,
      currentMeds: true,
      familyHistory: true,
      socialHistory: true,
    },
    boxStyle: "rounded",
    autoHeight: true, // Enable dynamic height
    minHeight: 40, // Minimum height for empty sections
    maxHeight: 150, // Maximum height before adding "See more..."
    padding: {
      top: 10,
      bottom: 10,
      left: 12,
      right: 12,
    },
  },

  vitalSigns: {
    show: true,
    gridColumns: 3,
    cell: {
      width: 45,
      height: 20,
      gap: 3,
      borderRadius: 2,
    },
    include: ["pulse", "bp", "heart", "temp", "respiratory", "oxygen"],
    showUnits: true,
  },

  medications: {
    show: true,
    table: {
      headers: [
        "No.",
        "Medicine",
        "Dosage",
        "Frequency",
        "Duration",
        "Instructions",
      ],
      columnWidths: [30, 100, 70, 70, 70, 80],
      rowHeight: 20,
      stripedRows: true,
      showRowNumbers: true,
      showAdditionalDetails: true,
    },
  },

  instructions: {
    show: false,
    sections: {
      general: false,
      followUp: false,
      restrictions: false,
    },
    indent: 20,
  },

  signature: {
    show: true,
    position: "right",
    lineWidth: 0.5,
    lineLength: 200,
    includeTitle: true,
  },

  footer: {
    show: true,
    showPageNumbers: true,
    showDigitalNote: true,
    height: 40,
  },

  pageBreak: {
    enabled: true,
    minBottomMargin: 100,
    repeatHeaders: true,
  },

  debug: {
    showBorders: false,
    showGrid: false,
    logPositions: false,
    showCalculations: false,
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
    return `${englishValue}\n${persianValue}`;
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
 * Calculate dynamic height for content
 */
function calculateContentHeight(
  doc: jsPDF,
  content: string | string[],
  maxWidth: number,
  fontSize: number,
  lineHeightMultiplier: number,
  config: PDFConfig
): number {
  let lines: string[] = [];

  if (Array.isArray(content)) {
    // Handle array content (like lists)
    lines = content.flatMap((item) => doc.splitTextToSize(item, maxWidth));
  } else {
    // Handle string content
    lines = doc.splitTextToSize(content, maxWidth);
  }

  const lineHeight = fontSize * lineHeightMultiplier;
  const totalHeight = lines.length * lineHeight;

  if (config.debug.showCalculations) {
    console.log("Height calculation:", {
      linesCount: lines.length,
      lineHeight,
      totalHeight,
      fontSize,
      maxWidth,
      content: Array.isArray(content) ? content.length : "string",
    });
  }

  return totalHeight;
}

/**
 * Truncate text if it exceeds max height and add "See more..." indicator
 */
function truncateContentToFitHeight(
  doc: jsPDF,
  content: string | string[],
  maxWidth: number,
  maxHeight: number,
  fontSize: number,
  lineHeightMultiplier: number,
  config: PDFConfig
): { content: string | string[]; isTruncated: boolean; usedHeight: number } {
  let lines: string[] = [];
  let isTruncated = false;

  if (Array.isArray(content)) {
    // Handle array content
    const availableLines = Math.floor(
      maxHeight / (fontSize * lineHeightMultiplier)
    );
    let currentLines = 0;
    const truncatedItems: string[] = [];

    for (const item of content) {
      const itemLines = doc.splitTextToSize(item, maxWidth);
      if (currentLines + itemLines.length <= availableLines) {
        truncatedItems.push(item);
        currentLines += itemLines.length;
      } else {
        const remainingLines = availableLines - currentLines;
        if (remainingLines >= 2) {
          // Can fit at least "See more..."
          truncatedItems.push(item);
          isTruncated = true;
          break;
        } else {
          isTruncated = true;
          break;
        }
      }
    }

    if (isTruncated && truncatedItems.length > 0) {
      const lastItem = truncatedItems[truncatedItems.length - 1];
      const lastItemLines = doc.splitTextToSize(lastItem, maxWidth);
      if (lastItemLines.length > 1) {
        // Truncate the last item
        truncatedItems[truncatedItems.length - 1] =
          lastItem.substring(0, Math.floor(lastItem.length * 0.8)) + "...";
      } else {
        truncatedItems.push("See more...");
      }
    }

    return {
      content: truncatedItems,
      isTruncated,
      usedHeight: currentLines * fontSize * lineHeightMultiplier,
    };
  } else {
    // Handle string content
    lines = doc.splitTextToSize(content, maxWidth);
    const maxLines = Math.floor(maxHeight / (fontSize * lineHeightMultiplier));

    if (lines.length > maxLines) {
      isTruncated = true;
      lines = lines.slice(0, maxLines - 1);
      lines[lines.length - 1] =
        lines[lines.length - 1].substring(
          0,
          Math.floor(lines[lines.length - 1].length * 0.8)
        ) + "...";
    }

    return {
      content: lines.join("\n"),
      isTruncated,
      usedHeight: lines.length * fontSize * lineHeightMultiplier,
    };
  }
}

/**
 * Calculate total section height including padding and borders
 */
function calculateSectionHeight(
  doc: jsPDF,
  title: string,
  content: string | string[],
  maxWidth: number,
  config: PDFConfig
): number {
  const titleHeight = config.typography.fontSizes.subheading * 1.5;
  const padding =
    config.clinicalHistory.padding.top + config.clinicalHistory.padding.bottom;

  let contentHeight: number;

  if (Array.isArray(content)) {
    // Calculate height for list items
    const fontSize = config.typography.fontSizes.tiny;
    const lineHeight = fontSize * 1.5;
    let totalLines = 0;

    for (const item of content) {
      const lines = doc.splitTextToSize(
        `${content.indexOf(item) + 1}. ${item}`,
        maxWidth
      );
      totalLines += lines.length;
    }

    contentHeight = totalLines * lineHeight;
  } else {
    // Calculate height for text content
    contentHeight = calculateContentHeight(
      doc,
      content,
      maxWidth,
      config.typography.fontSizes.tiny,
      1.5,
      config
    );
  }

  const totalHeight = titleHeight + contentHeight + padding;

  // Apply min/max constraints
  const constrainedHeight = Math.max(
    config.clinicalHistory.minHeight,
    Math.min(config.clinicalHistory.maxHeight, totalHeight)
  );

  if (config.debug.showCalculations) {
    console.log("Section height calculation:", {
      title,
      titleHeight,
      contentHeight,
      padding,
      totalHeight,
      constrainedHeight,
      type: Array.isArray(content) ? "list" : "text",
      itemsCount: Array.isArray(content) ? content.length : 1,
    });
  }

  return constrainedHeight;
}

/**
 * Auto-detect language preference based on prescription content
 */
function detectLanguagePreference(
  prescription: VoicePrescription
): "english" | "persian" {
  const hasPersianContent = prescription.medicines?.some(
    (med) =>
      med.dosagePersian ||
      med.frequencyPersian ||
      med.durationPersian ||
      med.instructionsPersian ||
      med.formPersian
  );

  return hasPersianContent ? "persian" : "english";
}

function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
}

function checkPageBreak(
  doc: jsPDF,
  currentY: number,
  requiredSpace: number,
  config: PDFConfig
): number {
  if (!config.pageBreak.enabled) return currentY;

  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = config.page.margins.bottom;

  if (
    currentY + requiredSpace >
    pageHeight - config.pageBreak.minBottomMargin
  ) {
    doc.addPage();
    if (config.debug.logPositions) {
      console.log(`Page break at Y=${currentY}, needed ${requiredSpace}px`);
    }
    return config.page.margins.top;
  }
  return currentY;
}

// ==================== DYNAMIC LEFT COLUMN SECTION ====================

interface DynamicSection {
  type: "text" | "list";
  title: string;
  content: string | string[];
  requiredHeight: number;
}

function createDynamicLeftColumnSections(
  prescription: VoicePrescription,
  config: PDFConfig,
  columnWidth: number
): DynamicSection[] {
  const sections: DynamicSection[] = [];
  const paddingWidth =
    columnWidth -
    config.clinicalHistory.padding.left -
    config.clinicalHistory.padding.right;

  // Create a temporary jsPDF instance for height calculations
  const tempDoc = new jsPDF({
    orientation: config.page.orientation,
    unit: config.page.unit,
    format: config.page.format,
  });
  tempDoc.setFont(config.typography.defaultFont);

  // Chief Complaint
  if (prescription.chiefComplaint) {
    const height = calculateSectionHeight(
      tempDoc,
      "Chief Complaint",
      prescription.chiefComplaint,
      paddingWidth,
      config
    );
    sections.push({
      type: "text",
      title: "Chief Complaint",
      content: prescription.chiefComplaint,
      requiredHeight: height,
    });
  }

  // Past Medical History
  if (prescription.pastMedicalHistory) {
    const height = calculateSectionHeight(
      tempDoc,
      "Medical History",
      prescription.pastMedicalHistory,
      paddingWidth,
      config
    );
    sections.push({
      type: "text",
      title: "Medical History",
      content: prescription.pastMedicalHistory,
      requiredHeight: height,
    });
  }

  // Lab Exams
  if (
    config.clinicalHistory.sections.labExams &&
    prescription.medicalExams?.length
  ) {
    const height = calculateSectionHeight(
      tempDoc,
      "Lab Exams",
      prescription.medicalExams,
      paddingWidth,
      config
    );
    sections.push({
      type: "list",
      title: "Lab Exams",
      content: prescription.medicalExams,
      requiredHeight: height,
    });
  }

  // Allergies (Diagnosis)
  if (
    config.clinicalHistory.sections.allergies &&
    prescription.allergies?.length
  ) {
    const height = calculateSectionHeight(
      tempDoc,
      "Diagnosis",
      prescription.allergies,
      paddingWidth,
      config
    );
    sections.push({
      type: "list",
      title: "Diagnosis",
      content: prescription.allergies,
      requiredHeight: height,
    });
  }

  // Family History
  if (
    config.clinicalHistory.sections.familyHistory &&
    prescription.familyHistory
  ) {
    const height = calculateSectionHeight(
      tempDoc,
      "Family History",
      prescription.familyHistory,
      paddingWidth,
      config
    );
    sections.push({
      type: "text",
      title: "Family History",
      content: prescription.familyHistory,
      requiredHeight: height,
    });
  }

  // Social History
  if (
    config.clinicalHistory.sections.socialHistory &&
    prescription.socialHistory
  ) {
    const height = calculateSectionHeight(
      tempDoc,
      "Social History",
      prescription.socialHistory,
      paddingWidth,
      config
    );
    sections.push({
      type: "text",
      title: "Social History",
      content: prescription.socialHistory,
      requiredHeight: height,
    });
  }

  return sections;
}

function addDynamicLeftColumnSection(
  doc: jsPDF,
  section: DynamicSection,
  y: number,
  x: number,
  width: number,
  config: PDFConfig
): number {
  const sectionHeight = section.requiredHeight;
  const padding = config.clinicalHistory.padding;
  const contentWidth = width - padding.left - padding.right;

  // Check if we need to truncate content
  const maxContentHeight =
    sectionHeight -
    padding.top -
    padding.bottom -
    config.typography.fontSizes.subheading * 1.5;

  let displayContent = section.content;
  let isTruncated = false;

  if (config.clinicalHistory.autoHeight) {
    const truncationResult = truncateContentToFitHeight(
      doc,
      section.content,
      contentWidth,
      maxContentHeight,
      config.typography.fontSizes.tiny,
      1.5,
      config
    );

    displayContent = truncationResult.content;
    isTruncated = truncationResult.isTruncated;
  }

  // Draw section background with dynamic height
  doc.setFillColor(...config.colors.sectionBg);
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.5);

  if (config.clinicalHistory.boxStyle === "rounded") {
    doc.roundedRect(x, y - 8, width, sectionHeight, 8, 8, "FD");
  } else {
    doc.rect(x, y - 8, width, sectionHeight, "FD");
  }

  // Draw decorative left border
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 4, sectionHeight, "F");

  // Section title
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.sectionHeader);
  doc.text(section.title, x + padding.left, y + 5);

  // Content
  const contentY =
    y + padding.top + config.typography.fontSizes.subheading * 1.5;

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.tiny);
  doc.setTextColor(...config.colors.textDark);

  if (section.type === "list" && Array.isArray(displayContent)) {
    let currentY = contentY;
    displayContent.forEach((item, index) => {
      const itemText =
        isTruncated &&
        index === displayContent.length - 1 &&
        item === "See more..."
          ? item
          : `${index + 1}. ${item}`;

      const lines = doc.splitTextToSize(itemText, contentWidth);
      lines.forEach((line: string, lineIndex: number) => {
        doc.text(line, x + padding.left, currentY + lineIndex * 14);
      });

      currentY += lines.length * 14 + 3;
    });
  } else {
    const content =
      typeof displayContent === "string"
        ? displayContent
        : Array.isArray(displayContent)
        ? displayContent.join("\n")
        : "";
    const lines = doc.splitTextToSize(content, contentWidth);
    doc.text(lines, x + padding.left, contentY);
  }

  // Add "See more..." indicator if truncated
  if (isTruncated) {
    doc.setFont(config.typography.defaultFont, "italic");
    doc.setFontSize(config.typography.fontSizes.tiny - 1);
    doc.setTextColor(...config.colors.primary);
    doc.text(
      "...",
      x + width - padding.right - 10,
      y + sectionHeight - padding.bottom,
      { align: "right" }
    );
  }

  // Update y position for next section
  return y + sectionHeight + config.layout.blockSpacing;
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
    instructions: {
      ...defaultPDFConfig.instructions,
      ...userConfig?.instructions,
    },
    signature: { ...defaultPDFConfig.signature, ...userConfig?.signature },
    footer: { ...defaultPDFConfig.footer, ...userConfig?.footer },
    pageBreak: { ...defaultPDFConfig.pageBreak, ...userConfig?.pageBreak },
    debug: { ...defaultPDFConfig.debug, ...userConfig?.debug },
  };

  const doc = new jsPDF({
    orientation: config.page.orientation,
    unit: config.page.unit,
    format: config.page.format,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Debug: Show borders if enabled
  if (config.debug.showBorders) {
    doc.setDrawColor(0, 128, 0); // Green border for debug
    doc.setLineWidth(0.5);
    doc.rect(
      config.page.margins.left,
      config.page.margins.top,
      pageWidth - config.page.margins.left - config.page.margins.right,
      pageHeight - config.page.margins.top - config.page.margins.bottom,
      "S"
    );
  }

  let y = config.page.margins.top;

  // ==================== HEADER SECTION ====================

  // Logo disabled - no logo will be displayed
  if (config.logo.enabled) {
    try {
      const response = await fetch(config.logo.url);
      if (response.ok) {
        const blob = await response.blob();
        const logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        let logoX = config.page.margins.left;
        switch (config.logo.position) {
          case "center":
            logoX = (pageWidth - config.logo.width) / 2;
            break;
          case "right":
            logoX = pageWidth - config.logo.width - config.page.margins.right;
            break;
        }

        doc.addImage(
          logoBase64,
          "PNG",
          logoX,
          y,
          config.logo.width,
          config.logo.height
        );
        y += config.logo.height + config.logo.marginBottom;
      }
    } catch (error) {
      console.warn("Could not load logo:", error);
    }
  }

  // ==================== PATIENT INFORMATION ====================

  if (config.patientInfo.show) {
    y += config.layout.blockSpacing;
    y = checkPageBreak(doc, y, 100, config);

    const patientBoxWidth =
      pageWidth - config.page.margins.left - config.page.margins.right;

    // Section Title with green accent
    doc.setFillColor(...config.colors.accent);
    doc.rect(config.page.margins.left, y - 5, 5, 25, "F");

    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.heading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Patient Information", config.page.margins.left + 15, y + 5);

    y += 30;

    // Patient Info Grid
    const patientInfoRows = createPatientInfoRows(prescription, config);
    const columnWidth = patientBoxWidth / config.patientInfo.columns;
    const rowHeight = 16;
    let rowY = y;

    patientInfoRows.forEach((info, index) => {
      const col = index % config.patientInfo.columns;
      const row = Math.floor(index / config.patientInfo.columns);
      const xPos = config.page.margins.left + 10 + col * columnWidth;
      const yPos = rowY + row * rowHeight;

      // Label
      if (config.patientInfo.showLabels) {
        doc.setFont(
          config.typography.defaultFont,
          config.patientInfo.labelStyle
        );
        doc.setFontSize(config.typography.fontSizes.small);
        doc.setTextColor(...config.colors.primary);
        doc.text(info.label, xPos, yPos);
      }

      // Value
      doc.setFont(config.typography.defaultFont, "normal");
      doc.setFontSize(config.typography.fontSizes.small);
      doc.setTextColor(...config.colors.textDark);

      const labelWidth = config.patientInfo.showLabels ? 60 : 0;
      doc.text(info.value, xPos + labelWidth, yPos);
    });

    y +=
      Math.ceil(patientInfoRows.length / config.patientInfo.columns) *
        rowHeight +
      config.layout.blockSpacing;

    // Green line at bottom of patient information
    doc.setDrawColor(...config.colors.accent);
    doc.setLineWidth(1.5);
    doc.line(
      config.page.margins.left,
      y - 10,
      config.page.margins.left + patientBoxWidth,
      y - 10
    );
  }

  // ==================== TWO COLUMN LAYOUT ====================

  let leftColumnX = config.page.margins.left;
  let rightColumnX = config.page.margins.left;
  let leftColumnWidth =
    pageWidth * config.layout.leftColumnWidth - config.page.margins.left;
  let rightColumnWidth =
    pageWidth * config.layout.rightColumnWidth - config.page.margins.right;

  if (config.layout.twoColumn) {
    rightColumnX =
      pageWidth * config.layout.leftColumnWidth + config.layout.columnGap;
    leftColumnWidth =
      pageWidth * config.layout.leftColumnWidth -
      config.page.margins.left -
      config.layout.columnGap / 2;
    rightColumnWidth =
      pageWidth * config.layout.rightColumnWidth -
      config.page.margins.right -
      config.layout.columnGap / 2;

    // Draw vertical separator with green color
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(1);
    doc.line(
      pageWidth * config.layout.leftColumnWidth,
      y,
      pageWidth * config.layout.leftColumnWidth,
      pageHeight - config.page.margins.bottom
    );
  }

  let yLeft = y + config.layout.blockSpacing;
  let yRight = y + config.layout.blockSpacing;

  // ==================== LEFT COLUMN: DYNAMIC CLINICAL HISTORY ====================

  if (config.clinicalHistory.show && config.layout.twoColumn) {
    // Create dynamic sections with calculated heights
    const dynamicSections = createDynamicLeftColumnSections(
      prescription,
      config,
      leftColumnWidth
    );

    // Add each section with its dynamic height
    for (const section of dynamicSections) {
      // Check if we need a page break
      yLeft = checkPageBreak(doc, yLeft, section.requiredHeight + 50, config);

      yLeft = addDynamicLeftColumnSection(
        doc,
        section,
        yLeft,
        leftColumnX,
        leftColumnWidth,
        config
      );
    }
  }

  // ==================== RIGHT COLUMN: MAIN CONTENT ====================

  // VITAL SIGNS
  if (config.vitalSigns.show && hasVitalSigns(prescription)) {
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight = addRightColumnSection(
      doc,
      "vitalSigns",
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // SYSTEM EXAMINATIONS
  if (hasSystemExaminations(prescription)) {
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight = addSystemExaminations(
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
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight += 20;
    yRight = addMedicationsTable(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // Add extra spacing after medications
  yRight += 15;

  // ==================== SIGNATURE ====================

  if (config.signature.show) {
    const footerHeight = config.footer.show ? config.footer.height : 0;
    const signatureY = pageHeight - footerHeight - 80;
    addSignature(doc, signatureY, pageWidth, prescription, config);
  }

  // ==================== FOOTER ====================

  if (config.footer.show) {
    addFooter(doc, pageWidth, pageHeight, prescription, config);
  }

  // ==================== SAVE PDF ====================

  const fileName = generateFileName(prescription);
  doc.save(fileName);
}

// ==================== HELPER FUNCTIONS ====================

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

function addRightColumnSection(
  doc: jsPDF,
  sectionType: string,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const sectionTitles = {
    vitalSigns: "Vital Signs",
    medicalHistory: "Medical History",
  };

  const title = sectionTitles[sectionType as keyof typeof sectionTitles];

  // Section header with green accent
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text(title, x + 15, y + 5);

  y += 25;

  // Section content
  switch (sectionType) {
    case "vitalSigns":
      y = addVitalSignsGrid(doc, y, x, width, prescription, config);
      break;
    case "medicalHistory":
      y = addTextContent(
        doc,
        y,
        x,
        width,
        prescription.pastMedicalHistory!,
        config
      );
      break;
  }

  return y;
}

function addVitalSignsGrid(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const vitalSigns = [
    {
      key: "pulse",
      label: "Pulse Rate",
      value: prescription.pulseRate,
      unit: "bpm",
    },
    {
      key: "bp",
      label: "Blood Pressure",
      value: prescription.bloodPressure,
      unit: "",
    },
    {
      key: "heart",
      label: "Heart Rate",
      value: prescription.heartRate,
      unit: "bpm",
    },
    {
      key: "temp",
      label: "Temperature",
      value: prescription.temperature,
      unit: "°C",
    },
    {
      key: "respiratory",
      label: "Respiratory Rate",
      value: prescription.respiratoryRate,
      unit: "/min",
    },
    {
      key: "oxygen",
      label: "Oxygen Saturation",
      value: prescription.oxygenSaturation,
      unit: "%",
    },
  ];

  const filteredVitals = vitalSigns.filter(
    (vital) => config.vitalSigns.include.includes(vital.key) && vital.value
  );

  const startX = x + 10;
  const startY = y;
  const cellWidth = 55;
  const cellHeight = config.vitalSigns.cell.height;
  const gap = config.vitalSigns.cell.gap;

  // Calculate total width needed for all vital signs
  const totalWidth =
    filteredVitals.length * cellWidth + (filteredVitals.length - 1) * gap;

  // If total width exceeds available width, adjust cell width
  const availableWidth = width - 20;
  let actualCellWidth = cellWidth;

  if (totalWidth > availableWidth) {
    actualCellWidth =
      (availableWidth - (filteredVitals.length - 1) * gap) /
      filteredVitals.length;
  }

  // Draw all vital signs in a single horizontal line with green theme
  filteredVitals.forEach((vital, index) => {
    const cellX = startX + index * (actualCellWidth + gap);
    const cellY = startY;

    // Cell background with light green
    doc.setFillColor(240, 255, 240);
    if (config.vitalSigns.cell.borderRadius > 0) {
      doc.roundedRect(
        cellX,
        cellY,
        actualCellWidth,
        cellHeight,
        config.vitalSigns.cell.borderRadius,
        config.vitalSigns.cell.borderRadius,
        "F"
      );
    } else {
      doc.rect(cellX, cellY, actualCellWidth, cellHeight, "F");
    }

    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.5);
    doc.rect(cellX, cellY, actualCellWidth, cellHeight, "S");

    // Label
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(6);
    doc.setTextColor(...config.colors.primary);

    const shortLabels: Record<string, string> = {
      "Pulse Rate": "Pulse",
      "Blood Pressure": "BP",
      "Heart Rate": "Heart",
      Temperature: "Temp",
      "Respiratory Rate": "Resp",
      "Oxygen Saturation": "O2 Sat",
    };

    const label = shortLabels[vital.label] || vital.label;
    const maxLabelWidth = actualCellWidth - 8;
    const labelWidth = doc.getTextWidth(label);
    let displayLabel = label;

    if (labelWidth > maxLabelWidth) {
      let truncated = label;
      while (
        doc.getTextWidth(truncated + "...") > maxLabelWidth &&
        truncated.length > 0
      ) {
        truncated = truncated.slice(0, -1);
      }
      displayLabel = truncated + (truncated.length < label.length ? "..." : "");
    }

    doc.text(displayLabel, cellX + 4, cellY + 8);

    // Value
    const valueText = config.vitalSigns.showUnits
      ? `${vital.value} ${vital.unit}`.trim()
      : vital.value!;

    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(7);
    doc.setTextColor(...config.colors.textDark);

    const maxValueWidth = actualCellWidth - 8;
    const valueWidth = doc.getTextWidth(valueText);
    let displayValue = valueText;

    if (valueWidth > maxValueWidth) {
      let truncated = valueText;
      while (
        doc.getTextWidth(truncated + "...") > maxValueWidth &&
        truncated.length > 0
      ) {
        truncated = truncated.slice(0, -1);
      }
      displayValue =
        truncated + (truncated.length < valueText.length ? "..." : "");
    }

    const valueTextWidth = doc.getTextWidth(displayValue);
    const centeredX = cellX + (actualCellWidth - valueTextWidth) / 2;
    doc.text(displayValue, Math.max(centeredX, cellX + 4), cellY + 16);
  });

  y += cellHeight + 5;
  return y;
}

function addTextContent(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  text: string,
  config: PDFConfig
): number {
  const lines = doc.splitTextToSize(text, width - 20);

  doc.setFont(config.typography.defaultFont, "normal");
  doc.setFontSize(config.typography.fontSizes.body);
  doc.setTextColor(...config.colors.textDark);
  doc.text(lines, x + 10, y);

  y += lines.length * 12 + 20;
  return y;
}

function addMedicationsTable(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  // Section header with green accent
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text("Prescribed Medications", x + 15, y + 5);

  y += 25;

  const medications = prescription.medicines || [];
  if (medications.length === 0) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No medications prescribed.", x + 12, y);

    y += 20;
    return y;
  }

  // Create headers with green theme
  const headers = config.medications.table.headers;
  const columnWidths = config.medications.table.columnWidths;

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.small);
  doc.setTextColor(...config.colors.primary);

  let xPos = x + 10;
  headers.forEach((header, index) => {
    const padding = index === 0 ? 2 : 8;
    doc.text(header, xPos + padding, y, {
      maxWidth: columnWidths[index] - padding * 2,
    });
    xPos += columnWidths[index];
  });

  // Header separator with green color
  y += 5;
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.5);
  doc.line(x + 10, y, x + width, y);
  y += 10;

  // Medication rows
  medications.forEach((med, index) => {
    y = checkPageBreak(doc, y, config.medications.table.rowHeight + 30, config);

    if (config.pageBreak.repeatHeaders && y === config.page.margins.top) {
      // Re-add headers on new page
      doc.setFont(config.typography.defaultFont, "bold");
      doc.setFontSize(config.typography.fontSizes.small);
      doc.setTextColor(...config.colors.primary);

      let xPos = x + 10;
      headers.forEach((header, i) => {
        const padding = i === 0 ? 2 : 8;
        doc.text(header, xPos + padding, y - 20, {
          maxWidth: columnWidths[i] - padding * 2,
        });
        xPos += columnWidths[i];
      });

      y += 5;
      doc.line(x + 10, y, x + width, y);
      y += 10;
    }

    // Row background with light green for striped rows
    if (config.medications.table.stripedRows && index % 2 === 0) {
      doc.setFillColor(...config.colors.tableStriped);
      doc.rect(
        x + 10,
        y - 8,
        width - 20,
        config.medications.table.rowHeight,
        "F"
      );
    }

    // Row data
    const rowData = [
      config.medications.table.showRowNumbers ? `${index + 1}.` : "",
      med.medicine || "N/A",
      getMedicationField(med, "dosage", config),
      getMedicationField(med, "frequency", config),
      getMedicationField(med, "duration", config),
      getMedicationField(med, "instructions", config),
    ];

    xPos = x + 10;
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);

    rowData.forEach((data, colIndex) => {
      const padding = colIndex === 0 ? 2 : 8;
      const lines = doc.splitTextToSize(
        data,
        columnWidths[colIndex] - padding * 2
      );

      if (lines.length > 1) {
        lines.forEach((line: string, lineIndex: number) => {
          doc.text(line, xPos + padding, y + lineIndex * 10);
        });
      } else {
        doc.text(data, xPos + padding, y, {
          maxWidth: columnWidths[colIndex] - padding * 2,
        });
      }
      xPos += columnWidths[colIndex];
    });

    // Adjust y position for multiline content
    const maxLines = Math.max(
      ...rowData.map((data, colIndex) => {
        const padding = colIndex === 0 ? 2 : 8;
        const lines = doc.splitTextToSize(
          data,
          columnWidths[colIndex] - padding * 2
        );
        return lines.length;
      })
    );

    y += Math.max(config.medications.table.rowHeight, maxLines * 10);

    // Additional details
    if (config.medications.table.showAdditionalDetails) {
      const details = [];
      if (med.form)
        details.push(`Form: ${getMedicationField(med, "form", config)}`);
      if (med.route) details.push(`Route: ${med.route}`);
      if (med.timing) details.push(`Timing: ${med.timing}`);
      if (med.notes) details.push(`Notes: ${med.notes}`);

      if (details.length > 0) {
        const detailsText = details.join(" | ");

        doc.setFont(config.typography.defaultFont, "italic");
        doc.setFontSize(config.typography.fontSizes.tiny);
        doc.setTextColor(...config.colors.primary);
        doc.text(detailsText, x + 45, y, { maxWidth: width - 55 });

        y += 12;
      }
    }

    y += 5;
  });

  return y;
}

function addSignature(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  const halfWidth =
    (pageWidth - config.page.margins.left - config.page.margins.right) / 2;
  const rightSectionX = config.page.margins.left + halfWidth;

  let signatureX;
  switch (config.signature.position) {
    case "left":
      signatureX = rightSectionX;
      break;
    case "center":
      signatureX =
        rightSectionX + (halfWidth - config.signature.lineLength) / 2;
      break;
    case "right":
      signatureX =
        rightSectionX +
        halfWidth -
        config.page.margins.right -
        config.signature.lineLength;
      break;
    default:
      signatureX =
        rightSectionX +
        halfWidth -
        config.page.margins.right -
        config.signature.lineLength;
  }

  // Signature line with green color
  doc.setDrawColor(...config.colors.primary);
  doc.setLineWidth(config.signature.lineWidth);
  doc.line(signatureX, y, signatureX + config.signature.lineLength, y);

  // Doctor name
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text(
    prescription.doctorName,
    signatureX + config.signature.lineLength / 2,
    y + 20,
    { align: "center" }
  );

  // Title
  if (config.signature.includeTitle) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text(
      "Medical Practitioner",
      signatureX + config.signature.lineLength / 2,
      y + 35,
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

  // Page numbers with green color
  if (config.footer.showPageNumbers) {
    doc.setFontSize(config.typography.fontSizes.tiny);
    doc.setTextColor(...config.colors.primary);
    const pageText = `Page 1 of 1`;
    doc.text(pageText, pageWidth - config.page.margins.right, footerY, {
      align: "right",
    });
  }

  // Digital note with green color
  if (config.footer.showDigitalNote) {
    doc.setFontSize(config.typography.fontSizes.tiny);
    doc.setTextColor(...config.colors.textDark);
    doc.text(
      "This is a digitally generated prescription.",
      pageWidth / 2,
      footerY + 15,
      { align: "center" }
    );
  }
}

function generateFileName(prescription: VoicePrescription): string {
  const prescriptionDate = prescription.date
    ? new Date(prescription.date)
    : new Date();
  const formattedDate = format(prescriptionDate, "yyyy-MM-dd");
  return `prescription-${prescription.patientName
    .toLowerCase()
    .replace(/\s+/g, "-")}-${formattedDate}.pdf`;
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

function addSystemExaminations(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  // Section header with green accent
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text("System Examinations", x + 15, y + 5);

  y += 25;

  const examinations = [
    {
      label: "CNS & Neurological Examination",
      value: prescription.cnsExamination,
    },
    {
      label: "Cardiovascular System",
      value: prescription.cardiovascularExamination,
    },
    { label: "Respiratory System", value: prescription.respiratoryExamination },
    {
      label: "Gastrointestinal System",
      value: prescription.gastrointestinalExamination,
    },
    {
      label: "Musculoskeletal System",
      value: prescription.musculoskeletalExamination,
    },
    {
      label: "Genitourinary System",
      value: prescription.genitourinaryExamination,
    },
    {
      label: "Dermatological Examination",
      value: prescription.dermatologicalExamination,
    },
    { label: "ENT Examination", value: prescription.entExamination },
    {
      label: "Ophthalmological Examination",
      value: prescription.ophthalmologicalExamination,
    },
  ];

  // Filter out examinations with no content
  const validExaminations = examinations.filter(
    (exam) => exam.value && exam.value.trim() !== ""
  );

  if (validExaminations.length === 0) {
    return y;
  }

  // Two-column layout
  const columnGap = 20;
  const columnWidth = (width - columnGap) / 2;
  const leftColumnX = x;
  const rightColumnX = x + columnWidth + columnGap;

  // Split examinations into two columns
  const midpoint = Math.ceil(validExaminations.length / 2);
  const leftColumnExams = validExaminations.slice(0, midpoint);
  const rightColumnExams = validExaminations.slice(midpoint);

  // Process left column
  let leftY = y;
  let rightY = y;
  let maxY = y;

  const processExamination = (
    exam: any,
    columnX: number,
    currentY: number,
    colWidth: number
  ) => {
    // Check for page break
    currentY = checkPageBreak(doc, currentY, 60, config);

    // Examination title with green color
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text(exam.label, columnX + 10, currentY);

    currentY += 12;

    // Examination content
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.tiny);
    doc.setTextColor(...config.colors.textDark);

    const lines = doc.splitTextToSize(exam.value, colWidth - 20);
    doc.text(lines, columnX + 10, currentY);

    currentY += lines.length * 10 + 15;
    return currentY;
  };

  // Process left column examinations
  leftColumnExams.forEach((exam) => {
    leftY = processExamination(exam, leftColumnX, leftY, columnWidth);
    maxY = Math.max(maxY, leftY);
  });

  // Process right column examinations
  rightColumnExams.forEach((exam) => {
    rightY = processExamination(exam, rightColumnX, rightY, columnWidth);
    maxY = Math.max(maxY, rightY);
  });

  return maxY;
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;
