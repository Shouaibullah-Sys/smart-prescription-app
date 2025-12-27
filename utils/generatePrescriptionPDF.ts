// utils/generatePrescriptionPDF.ts

import { jsPDF } from "jspdf";
import { format } from "date-fns";
import { format as formatJalali } from "date-fns-jalali";
import "../vazirmatn-normal.js";

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
  medicationUsage?: string;
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

  // Colors
  colors: {
    primary: [number, number, number]; // [R, G, B]
    accent: [number, number, number];
    bgLight: [number, number, number];
    textDark: [number, number, number];
    border: [number, number, number];
    tableStriped: [number, number, number];
    warning: [number, number, number];
    success: [number, number, number];
  };

  // Typography
  typography: {
    defaultFont: string;
    persianFont: string;
    fallbackFonts: string[];
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
    leftColumnWidth: number; // percentage of page width
    rightColumnWidth: number; // percentage of page width
    columnGap: number;
    sectionSpacing: number;
    blockSpacing: number;
    lineSpacing: number;
  };

  // Patient Info
  patientInfo: {
    show: boolean;
    boxStyle: "rounded" | "flat" | "shadow";
    borderRadius: number;
    columns: number; // Number of columns in patient info grid
    showLabels: boolean;
    labelStyle: "bold" | "normal" | "italic";
    include: string[]; // Fields to include: ['name', 'age', 'gender', 'date', 'weight', 'height', 'bmi', 'phone']
  };

  // Clinical History (Left Column)
  clinicalHistory: {
    show: boolean;
    sections: {
      labExams: boolean;
      allergies: boolean;
      currentMeds: boolean;
      pastMedicalHistory: boolean;
      familyHistory: boolean;
      socialHistory: boolean;
    };
    boxStyle: "rounded" | "flat";
    boxHeight: number; // Default height for text boxes
  };

  // Vital Signs
  vitalSigns: {
    show: boolean;
    gridColumns: number; // Number of columns in the grid
    cell: {
      width: number;
      height: number;
      gap: number;
      borderRadius: number;
    };
    include: string[]; // ['pulse', 'bp', 'heart', 'temp', 'respiratory', 'oxygen']
    showUnits: boolean;
  };

  // Medications Table
  medications: {
    show: boolean;
    table: {
      headers: string[]; // Custom header titles
      persianHeaders: string[]; // Persian header titles
      columnWidths: number[]; // Widths for each column
      rowHeight: number;
      stripedRows: boolean;
      showRowNumbers: boolean;
      showAdditionalDetails: boolean;
    };
  };

  // Additional Instructions
  instructions: {
    show: boolean;
    sections: {
      general: boolean;
      followUp: boolean;
      restrictions: boolean;
    };
    indent: number; // Indentation for content
  };

  // Doctor Signature
  signature: {
    show: boolean;
    position: "left" | "center" | "right";
    lineWidth: number;
    lineLength: number;
    includeTitle: boolean;
    includePersian: boolean;
  };

  // Footer
  footer: {
    show: boolean;
    showPrescriptionId: boolean;
    showPageNumbers: boolean;
    showDigitalNote: boolean;
    height: number;
  };

  // Language Settings
  language: {
    primary: "en" | "fa" | "bilingual";
    titles: {
      // Customizable titles for all sections
      patientInfo: { en: string; fa: string };
      clinicalHistory: { en: string; fa: string };
      vitalSigns: { en: string; fa: string };
      chiefComplaint: { en: string; fa: string };
      physicalExam: { en: string; fa: string };
      medications: { en: string; fa: string };
      instructions: { en: string; fa: string };
      signature: { en: string; fa: string };
    };
  };

  // Page Break Control
  pageBreak: {
    enabled: boolean;
    minBottomMargin: number; // Minimum space required at bottom before page break
    repeatHeaders: boolean; // Repeat table headers on new page
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

  colors: {
    primary: [42, 94, 168],
    accent: [66, 133, 244],
    bgLight: [244, 247, 252],
    textDark: [40, 40, 40],
    border: [200, 200, 200],
    tableStriped: [250, 250, 250],
    warning: [255, 193, 7],
    success: [40, 167, 69],
  },

  typography: {
    defaultFont: "helvetica",
    persianFont: "vazirmatn",
    fallbackFonts: ["arabic", "helvetica"],
    fontSizes: {
      title: 16,
      subtitle: 14,
      heading: 12,
      subheading: 10,
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
    enabled: true,
    url: "/logo.png",
    width: 80,
    height: 80,
    position: "center",
    marginTop: 40,
    marginBottom: 20,
  },

  layout: {
    twoColumn: true,
    leftColumnWidth: 0.25, // 25% of page width
    rightColumnWidth: 0.75, // 75% of page width
    columnGap: 15,
    sectionSpacing: 25,
    blockSpacing: 15,
    lineSpacing: 5,
  },

  patientInfo: {
    show: true,
    boxStyle: "rounded",
    borderRadius: 5,
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
      "phone",
    ],
  },

  clinicalHistory: {
    show: true,
    sections: {
      labExams: true,
      allergies: true,
      currentMeds: true,
      pastMedicalHistory: true,
      familyHistory: true,
      socialHistory: true,
    },
    boxStyle: "rounded",
    boxHeight: 40,
  },

  vitalSigns: {
    show: true,
    gridColumns: 3,
    cell: {
      width: 120,
      height: 35,
      gap: 5,
      borderRadius: 3,
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
      persianHeaders: ["شماره", "دوا", "مقدار", "فراوانی", "مدت", "دستورات"],
      columnWidths: [30, 100, 70, 70, 70, 80],
      rowHeight: 20,
      stripedRows: true,
      showRowNumbers: true,
      showAdditionalDetails: true,
    },
  },

  instructions: {
    show: true,
    sections: {
      general: true,
      followUp: true,
      restrictions: true,
    },
    indent: 20,
  },

  signature: {
    show: true,
    position: "right",
    lineWidth: 0.5,
    lineLength: 200,
    includeTitle: true,
    includePersian: true,
  },

  footer: {
    show: true,
    showPrescriptionId: true,
    showPageNumbers: true,
    showDigitalNote: true,
    height: 40,
  },

  language: {
    primary: "bilingual",
    titles: {
      patientInfo: { en: "Patient Information", fa: "معلومات مریض" },
      clinicalHistory: { en: "Clinical History", fa: "تاریخچه کلینیکی" },
      vitalSigns: { en: "Vital Signs", fa: "علائم حیاتی" },
      chiefComplaint: { en: "Chief Complaint", fa: "شکایت اصلی" },
      physicalExam: { en: "Physical Examination", fa: "معاینه فزیکی" },
      medications: { en: "Prescribed Medications", fa: "دواهای تجویز شده" },
      instructions: { en: "Additional Instructions", fa: "دستورات اضافی" },
      signature: { en: "Medical Practitioner", fa: "داکتر معالج" },
    },
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
  },
};

// ==================== HELPER FUNCTIONS ====================

function formatVitalValue(value?: string): string {
  if (!value || value.trim() === "") {
    return "N/A";
  }
  return value.trim();
}

function hasPersianOrArabic(text: string): boolean {
  const persianRange =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return persianRange.test(text);
}

function addPersianTextToPDF(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: any,
  config: PDFConfig = defaultPDFConfig
) {
  const style = options?.style || "normal";
  const fontSize = options?.fontSize || doc.getFontSize();

  const currentFontSize = doc.getFontSize();
  if (options?.fontSize) {
    doc.setFontSize(fontSize);
  }

  try {
    doc.setFont(config.typography.persianFont, style);
    doc.text(text, x, y, options);
  } catch (e) {
    console.warn(
      "Primary Persian font failed, using fallback:",
      text.substring(0, 20)
    );

    for (const fallbackFont of config.typography.fallbackFonts) {
      try {
        doc.setFont(fallbackFont, style);
        doc.text(text, x, y, options);
        break;
      } catch (e2) {
        continue;
      }
    }
  }

  if (options?.fontSize) {
    doc.setFontSize(currentFontSize);
  }
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
    language: { ...defaultPDFConfig.language, ...userConfig?.language },
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
    doc.setDrawColor(255, 0, 0);
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

  // Logo
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

  // Clinic Information
  const centerX = pageWidth / 2;

  // Clinic Name
  if (prescription.clinicName) {
    y = checkPageBreak(doc, y, 50, config);

    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.title);
    doc.setTextColor(...config.colors.primary);
    doc.text(prescription.clinicName, centerX, y, { align: "center" });

    // Persian clinic name (if available)
    if (config.language.primary !== "en") {
      y += 18;
      const clinicNamePersian = getPersianTranslation(prescription.clinicName);
      addPersianTextToPDF(
        doc,
        clinicNamePersian,
        centerX,
        y,
        {
          align: "center",
          style: "normal",
          fontSize: config.typography.fontSizes.subtitle,
        },
        config
      );
    }
  }

  // Doctor Information
  y += config.layout.sectionSpacing;
  y = checkPageBreak(doc, y, 40, config);

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subtitle);
  doc.setTextColor(...config.colors.textDark);
  doc.text(prescription.doctorName, centerX, y, { align: "center" });

  if (config.language.primary !== "en") {
    y += 16;
    addPersianTextToPDF(
      doc,
      prescription.doctorName,
      centerX,
      y,
      {
        align: "center",
        style: "normal",
        fontSize: config.typography.fontSizes.body,
      },
      config
    );
  }

  // Doctor License Number
  if (prescription.doctorLicenseNumber) {
    y += 18;
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.text(`License: ${prescription.doctorLicenseNumber}`, centerX, y, {
      align: "center",
    });
  }

  // Separator Line
  y += config.layout.sectionSpacing;
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(1);
  doc.line(
    config.page.margins.left,
    y,
    pageWidth - config.page.margins.right,
    y
  );

  // ==================== PATIENT INFORMATION ====================

  if (config.patientInfo.show) {
    y += config.layout.blockSpacing;
    y = checkPageBreak(doc, y, 100, config);

    const patientBoxWidth =
      pageWidth - config.page.margins.left - config.page.margins.right;
    const patientBoxHeight = 70;

    // Background Box
    doc.setFillColor(...config.colors.bgLight);
    doc.setDrawColor(...config.colors.accent);
    doc.setLineWidth(1);

    if (config.patientInfo.boxStyle === "rounded") {
      doc.roundedRect(
        config.page.margins.left,
        y - 10,
        patientBoxWidth,
        patientBoxHeight,
        config.patientInfo.borderRadius,
        config.patientInfo.borderRadius,
        "FD"
      );
    } else {
      doc.rect(
        config.page.margins.left,
        y - 10,
        patientBoxWidth,
        patientBoxHeight,
        config.patientInfo.boxStyle === "shadow" ? "S" : "FD"
      );
    }

    // Section Title
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.heading);
    doc.setTextColor(...config.colors.primary);
    doc.text(
      config.language.titles.patientInfo.en,
      config.page.margins.left + 20,
      y + 5
    );

    if (config.language.primary !== "en") {
      addPersianTextToPDF(
        doc,
        config.language.titles.patientInfo.fa,
        pageWidth - config.page.margins.right - 20,
        y + 5,
        {
          align: "right",
          style: "normal",
          fontSize: config.typography.fontSizes.heading,
        },
        config
      );
    }

    // Patient Info Grid
    const patientInfoRows = createPatientInfoRows(prescription, config);
    const columnWidth = patientBoxWidth / config.patientInfo.columns;
    const rowHeight = 16;
    let rowY = y + 35;

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

      const valueContainsPersian = hasPersianOrArabic(info.value);
      const labelWidth = config.patientInfo.showLabels ? 60 : 0;

      if (valueContainsPersian) {
        addPersianTextToPDF(
          doc,
          info.value,
          xPos + labelWidth,
          yPos,
          { style: "normal", fontSize: config.typography.fontSizes.small },
          config
        );
      } else {
        doc.text(info.value, xPos + labelWidth, yPos);
      }
    });

    y += patientBoxHeight + config.layout.blockSpacing;
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

    // Draw vertical separator
    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.5);
    doc.line(
      pageWidth * config.layout.leftColumnWidth,
      y,
      pageWidth * config.layout.leftColumnWidth,
      pageHeight - config.page.margins.bottom
    );
  }

  let yLeft = y + config.layout.blockSpacing;
  let yRight = y + config.layout.blockSpacing;

  // ==================== LEFT COLUMN: CLINICAL HISTORY ====================

  if (config.clinicalHistory.show && config.layout.twoColumn) {
    const sections = [];

    if (
      config.clinicalHistory.sections.labExams &&
      prescription.medicalExams?.length
    ) {
      sections.push({
        type: "list",
        titleEn: "Lab Exams",
        titleFa: "آزمایشات",
        items: prescription.medicalExams,
      });
    }

    if (
      config.clinicalHistory.sections.allergies &&
      prescription.allergies?.length
    ) {
      sections.push({
        type: "list",
        titleEn: "Allergies",
        titleFa: "حساسیت ها",
        items: prescription.allergies,
      });
    }

    if (
      config.clinicalHistory.sections.currentMeds &&
      prescription.currentMedications?.length
    ) {
      sections.push({
        type: "list",
        titleEn: "Current Medications",
        titleFa: "دواهای فعلی",
        items: prescription.currentMedications,
      });
    }

    if (
      config.clinicalHistory.sections.pastMedicalHistory &&
      prescription.pastMedicalHistory
    ) {
      sections.push({
        type: "text",
        titleEn: "Past Medical History",
        titleFa: "تاریخچه طبی",
        content: prescription.pastMedicalHistory,
      });
    }

    if (
      config.clinicalHistory.sections.familyHistory &&
      prescription.familyHistory
    ) {
      sections.push({
        type: "text",
        titleEn: "Family History",
        titleFa: "تاریخچه فامیلی",
        content: prescription.familyHistory,
      });
    }

    if (
      config.clinicalHistory.sections.socialHistory &&
      prescription.socialHistory
    ) {
      sections.push({
        type: "text",
        titleEn: "Social History",
        titleFa: "تاریخچه اجتماعی",
        content: prescription.socialHistory,
      });
    }

    for (const section of sections) {
      yLeft = checkPageBreak(doc, yLeft, 100, config);
      yLeft = addLeftColumnSection(
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

  // CHIEF COMPLAINT
  if (prescription.chiefComplaint) {
    yRight = checkPageBreak(doc, yRight, 50, config);
    yRight = addRightColumnSection(
      doc,
      "chiefComplaint",
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // PHYSICAL EXAM
  if (prescription.physicalExam) {
    yRight = checkPageBreak(doc, yRight, 50, config);
    yRight = addRightColumnSection(
      doc,
      "physicalExam",
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
    yRight = addMedicationsTable(
      doc,
      yRight,
      rightColumnX,
      rightColumnWidth,
      prescription,
      config
    );
  }

  // ADDITIONAL INSTRUCTIONS
  if (config.instructions.show && hasAdditionalInstructions(prescription)) {
    yRight = checkPageBreak(doc, yRight, 100, config);
    yRight = addInstructionsSection(
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
    const signatureY = Math.max(yLeft, yRight) + config.layout.sectionSpacing;
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
      label: "Name / نام:",
      value: prescription.patientName || "N/A",
    },
    age: {
      label: "Age / عمر:",
      value: prescription.patientAge
        ? `${prescription.patientAge} years`
        : "N/A",
    },
    gender: {
      label: "Gender / جنس:",
      value: prescription.patientGender || "N/A",
    },
    date: {
      label: "Date / تاریخ:",
      value: prescription.date
        ? formatJalali(new Date(prescription.date), "yyyy/MM/dd")
        : formatJalali(new Date(), "yyyy/MM/dd"),
    },
    weight: {
      label: "Weight / وزن:",
      value: prescription.weight ? `${prescription.weight} kg` : "N/A",
    },
    height: {
      label: "Height / قد:",
      value: prescription.height ? `${prescription.height} cm` : "N/A",
    },
    bmi: {
      label: "BMI:",
      value: prescription.bmi || "N/A",
    },
    phone: {
      label: "Phone / تلیفون:",
      value: prescription.patientPhone || "N/A",
    },
    address: {
      label: "Address / آدرس:",
      value: prescription.patientAddress || "N/A",
    },
  };

  for (const field of fields) {
    if (fieldMap[field]) {
      rows.push(fieldMap[field]);
    }
  }

  return rows;
}

function addLeftColumnSection(
  doc: jsPDF,
  section: any,
  y: number,
  x: number,
  width: number,
  config: PDFConfig
): number {
  // Section header
  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.subheading);
  doc.setTextColor(...config.colors.primary);
  doc.text(section.titleEn, x, y);

  if (config.language.primary !== "en") {
    addPersianTextToPDF(
      doc,
      section.titleFa,
      x + width,
      y,
      {
        align: "right",
        style: "normal",
        fontSize: config.typography.fontSizes.subheading,
      },
      config
    );
  }

  y += config.layout.blockSpacing;

  // Content box
  const boxHeight =
    section.type === "list"
      ? Math.max(
          config.clinicalHistory.boxHeight,
          section.items.length * 15 + 20
        )
      : config.clinicalHistory.boxHeight;

  doc.setFillColor(...config.colors.bgLight);
  doc.setDrawColor(...config.colors.border);
  doc.setLineWidth(0.5);

  if (config.clinicalHistory.boxStyle === "rounded") {
    doc.roundedRect(x, y - 5, width, boxHeight, 3, 3, "FD");
  } else {
    doc.rect(x, y - 5, width, boxHeight, "FD");
  }

  // Content
  if (section.type === "list") {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);

    section.items.forEach((item: string, index: number) => {
      const itemText = `${index + 1}. ${item}`;
      if (hasPersianOrArabic(item)) {
        addPersianTextToPDF(
          doc,
          itemText,
          x + 10,
          y + 8 + index * 15,
          {
            style: "normal",
            fontSize: config.typography.fontSizes.small,
          },
          config
        );
      } else {
        doc.text(itemText, x + 10, y + 8 + index * 15);
      }
    });
  } else {
    const contentLines = doc.splitTextToSize(section.content, width - 20);
    if (hasPersianOrArabic(section.content)) {
      contentLines.forEach((line: string, index: number) => {
        addPersianTextToPDF(
          doc,
          line,
          x + 10,
          y + 8 + index * 12,
          {
            style: "normal",
            fontSize: config.typography.fontSizes.small,
          },
          config
        );
      });
    } else {
      doc.setFont(config.typography.defaultFont, "normal");
      doc.setFontSize(config.typography.fontSizes.small);
      doc.setTextColor(...config.colors.textDark);
      doc.text(contentLines, x + 10, y + 8);
    }
  }

  y += boxHeight + config.layout.blockSpacing;
  return y;
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
    vitalSigns: config.language.titles.vitalSigns,
    chiefComplaint: config.language.titles.chiefComplaint,
    physicalExam: config.language.titles.physicalExam,
  };

  const title = sectionTitles[sectionType as keyof typeof sectionTitles];

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text(title.en, x + 15, y + 5);

  if (config.language.primary !== "en") {
    addPersianTextToPDF(
      doc,
      title.fa,
      x + width,
      y + 5,
      {
        align: "right",
        style: "normal",
        fontSize: config.typography.fontSizes.heading,
      },
      config
    );
  }

  y += 25;

  // Section content
  switch (sectionType) {
    case "vitalSigns":
      y = addVitalSignsGrid(doc, y, x, width, prescription, config);
      break;
    case "chiefComplaint":
      y = addTextContent(
        doc,
        y,
        x,
        width,
        prescription.chiefComplaint!,
        config
      );
      break;
    case "physicalExam":
      y = addTextContent(doc, y, x, width, prescription.physicalExam!, config);
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
      persian: "ضربان نبض",
    },
    {
      key: "bp",
      label: "Blood Pressure",
      value: prescription.bloodPressure,
      unit: "",
      persian: "فشار خون",
    },
    {
      key: "heart",
      label: "Heart Rate",
      value: prescription.heartRate,
      unit: "bpm",
      persian: "ضربان قلب",
    },
    {
      key: "temp",
      label: "Temperature",
      value: prescription.temperature,
      unit: "°C",
      persian: "حرارت بدن",
    },
    {
      key: "respiratory",
      label: "Respiratory Rate",
      value: prescription.respiratoryRate,
      unit: "/min",
      persian: "معدل تنفس",
    },
    {
      key: "oxygen",
      label: "Oxygen Saturation",
      value: prescription.oxygenSaturation,
      unit: "%",
      persian: "اکسیجن خون",
    },
  ];

  const filteredVitals = vitalSigns.filter(
    (vital) => config.vitalSigns.include.includes(vital.key) && vital.value
  );

  const startX = x + 10;
  const startY = y;
  const cellWidth = config.vitalSigns.cell.width;
  const cellHeight = config.vitalSigns.cell.height;
  const gap = config.vitalSigns.cell.gap;
  const columns = config.vitalSigns.gridColumns;

  filteredVitals.forEach((vital, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const cellX = startX + col * (cellWidth + gap);
    const cellY = startY + row * (cellHeight + gap);

    // Cell background
    doc.setFillColor(250, 250, 250);
    if (config.vitalSigns.cell.borderRadius > 0) {
      doc.roundedRect(
        cellX,
        cellY,
        cellWidth,
        cellHeight,
        config.vitalSigns.cell.borderRadius,
        config.vitalSigns.cell.borderRadius,
        "F"
      );
    } else {
      doc.rect(cellX, cellY, cellWidth, cellHeight, "F");
    }

    doc.setDrawColor(...config.colors.border);
    doc.setLineWidth(0.5);
    doc.rect(cellX, cellY, cellWidth, cellHeight, "S");

    // Label
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(9);
    doc.setTextColor(...config.colors.primary);
    doc.text(vital.label, cellX + 5, cellY + 12);

    // Persian label
    addPersianTextToPDF(
      doc,
      vital.persian,
      cellX + cellWidth - 5,
      cellY + 12,
      {
        align: "right",
        style: "normal",
        fontSize: 8,
      },
      config
    );

    // Value
    const valueText = config.vitalSigns.showUnits
      ? `${vital.value} ${vital.unit}`.trim()
      : vital.value!;

    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(10);
    doc.setTextColor(...config.colors.textDark);

    const valueWidth = doc.getTextWidth(valueText);
    const centeredX = cellX + (cellWidth - valueWidth) / 2;
    doc.text(valueText, Math.max(centeredX, cellX + 5), cellY + 25);
  });

  const rows = Math.ceil(filteredVitals.length / columns);
  y += rows * (cellHeight + gap) + 10;
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

  if (hasPersianOrArabic(text)) {
    lines.forEach((line: string, index: number) => {
      addPersianTextToPDF(
        doc,
        line,
        x + 10,
        y + index * 12,
        {
          style: "normal",
          fontSize: config.typography.fontSizes.body,
        },
        config
      );
    });
  } else {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text(lines, x + 10, y);
  }

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
  const title = config.language.titles.medications;

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text(title.en, x + 15, y + 5);

  if (config.language.primary !== "en") {
    addPersianTextToPDF(
      doc,
      title.fa,
      x + width,
      y + 5,
      {
        align: "right",
        style: "normal",
        fontSize: config.typography.fontSizes.heading,
      },
      config
    );
  }

  y += 25;

  const medications = prescription.medicines || [];
  if (medications.length === 0) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text("No medications prescribed.", x + 12, y);

    if (config.language.primary !== "en") {
      addPersianTextToPDF(
        doc,
        "هیچ دوا تجویز نگردیده است.",
        x + width,
        y,
        {
          align: "right",
          style: "normal",
        },
        config
      );
    }

    y += 20;
    return y;
  }

  // Table headers
  const headers = config.medications.table.headers;
  const persianHeaders = config.medications.table.persianHeaders;
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

  // Persian headers
  xPos = x + width;
  persianHeaders.reverse().forEach((header, index) => {
    const columnIndex = persianHeaders.length - 1 - index;
    const padding = columnIndex === 0 ? 2 : 8;

    addPersianTextToPDF(
      doc,
      header,
      xPos - padding,
      y,
      {
        align: "right",
        style: "normal",
        fontSize: config.typography.fontSizes.small,
        maxWidth: columnWidths[columnIndex] - padding * 2,
      },
      config
    );

    xPos -= columnWidths[columnIndex];
  });

  // Header separator
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

    // Row background
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
      med.dosage || "N/A",
      med.frequency || "N/A",
      med.duration || "N/A",
      med.instructions || "N/A",
    ];

    xPos = x + 10;
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.small);
    doc.setTextColor(...config.colors.textDark);

    rowData.forEach((data, colIndex) => {
      const padding = colIndex === 0 ? 2 : 8;

      if (hasPersianOrArabic(data)) {
        addPersianTextToPDF(
          doc,
          data,
          xPos + padding,
          y,
          {
            style: "normal",
            fontSize: config.typography.fontSizes.small,
            maxWidth: columnWidths[colIndex] - padding * 2,
          },
          config
        );
      } else {
        doc.text(data, xPos + padding, y, {
          maxWidth: columnWidths[colIndex] - padding * 2,
        });
      }

      xPos += columnWidths[colIndex];
    });

    y += config.medications.table.rowHeight;

    // Additional details
    if (config.medications.table.showAdditionalDetails) {
      const details = [];
      if (med.form) details.push(`Form: ${med.form}`);
      if (med.route) details.push(`Route: ${med.route}`);
      if (med.timing) details.push(`Timing: ${med.timing}`);
      if (med.notes) details.push(`Notes: ${med.notes}`);

      if (details.length > 0) {
        const detailsText = details.join(" | ");

        doc.setFont(config.typography.defaultFont, "italic");
        doc.setFontSize(config.typography.fontSizes.tiny);
        doc.setTextColor(120, 120, 120);

        if (hasPersianOrArabic(detailsText)) {
          addPersianTextToPDF(
            doc,
            detailsText,
            x + 45,
            y,
            {
              style: "italic",
              fontSize: config.typography.fontSizes.tiny,
              maxWidth: width - 55,
            },
            config
          );
        } else {
          doc.text(detailsText, x + 45, y, { maxWidth: width - 55 });
        }

        y += 12;
      }
    }

    y += 5;
  });

  return y;
}

function addInstructionsSection(
  doc: jsPDF,
  y: number,
  x: number,
  width: number,
  prescription: VoicePrescription,
  config: PDFConfig
): number {
  const title = config.language.titles.instructions;

  // Section header
  doc.setFillColor(...config.colors.accent);
  doc.rect(x, y - 8, 5, 22, "F");

  doc.setFont(config.typography.defaultFont, "bold");
  doc.setFontSize(config.typography.fontSizes.heading);
  doc.setTextColor(...config.colors.primary);
  doc.text(title.en, x + 15, y + 5);

  if (config.language.primary !== "en") {
    addPersianTextToPDF(
      doc,
      title.fa,
      x + width,
      y + 5,
      {
        align: "right",
        style: "normal",
        fontSize: config.typography.fontSizes.heading,
      },
      config
    );
  }

  y += 25;

  // General Instructions
  if (config.instructions.sections.general && prescription.instructions) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("General Instructions:", x + 10, y);

    y = addTextContent(
      doc,
      y + config.layout.lineSpacing,
      x + config.instructions.indent,
      width - config.instructions.indent,
      prescription.instructions,
      config
    );
    y += 10;
  }

  // Follow-up
  if (config.instructions.sections.followUp && prescription.followUp) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Follow-up:", x + 10, y);

    y = addTextContent(
      doc,
      y + config.layout.lineSpacing,
      x + config.instructions.indent,
      width - config.instructions.indent,
      prescription.followUp,
      config
    );
    y += 10;
  }

  // Restrictions
  if (config.instructions.sections.restrictions && prescription.restrictions) {
    doc.setFont(config.typography.defaultFont, "bold");
    doc.setFontSize(config.typography.fontSizes.subheading);
    doc.setTextColor(...config.colors.primary);
    doc.text("Restrictions:", x + 10, y);

    y = addTextContent(
      doc,
      y + config.layout.lineSpacing,
      x + config.instructions.indent,
      width - config.instructions.indent,
      prescription.restrictions,
      config
    );
  }

  return y;
}

function addSignature(
  doc: jsPDF,
  y: number,
  pageWidth: number,
  prescription: VoicePrescription,
  config: PDFConfig
) {
  let signatureX;
  switch (config.signature.position) {
    case "left":
      signatureX = config.page.margins.left;
      break;
    case "center":
      signatureX = (pageWidth - config.signature.lineLength) / 2;
      break;
    case "right":
      signatureX =
        pageWidth - config.page.margins.right - config.signature.lineLength;
      break;
    default:
      signatureX =
        pageWidth - config.page.margins.right - config.signature.lineLength;
  }

  // Signature line
  doc.setDrawColor(...config.colors.textDark);
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
    {
      align: "center",
    }
  );

  // Title
  if (config.signature.includeTitle) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.body);
    doc.setTextColor(...config.colors.textDark);
    doc.text(
      config.language.titles.signature.en,
      signatureX + config.signature.lineLength / 2,
      y + 35,
      {
        align: "center",
      }
    );
  }

  // Persian text
  if (config.signature.includePersian && config.language.primary !== "en") {
    addPersianTextToPDF(
      doc,
      prescription.doctorName,
      signatureX + config.signature.lineLength / 2,
      y + 55,
      {
        align: "center",
        style: "normal",
        fontSize: config.typography.fontSizes.subheading,
      },
      config
    );

    addPersianTextToPDF(
      doc,
      config.language.titles.signature.fa,
      signatureX + config.signature.lineLength / 2,
      y + 70,
      {
        align: "center",
        style: "normal",
        fontSize: config.typography.fontSizes.body,
      },
      config
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

  // Prescription ID
  if (config.footer.showPrescriptionId) {
    doc.setFont(config.typography.defaultFont, "normal");
    doc.setFontSize(config.typography.fontSizes.tiny);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Prescription ID: ${prescription._id}`,
      config.page.margins.left,
      footerY
    );
  }

  // Page numbers
  if (config.footer.showPageNumbers) {
    doc.text(`Page 1 of 1`, pageWidth - config.page.margins.right, footerY, {
      align: "right",
    });
  }

  // Digital note
  if (config.footer.showDigitalNote && config.language.primary !== "en") {
    const digitalText = "این یک نسخه دیجیتال تولید شده توسط کامپیوتر است.";
    addPersianTextToPDF(
      doc,
      digitalText,
      pageWidth / 2,
      footerY + 15,
      {
        align: "center",
        style: "normal",
        fontSize: config.typography.fontSizes.tiny,
      },
      config
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

function hasAdditionalInstructions(prescription: VoicePrescription): boolean {
  return !!(
    (prescription.instructions && prescription.instructions.trim() !== "") ||
    (prescription.followUp && prescription.followUp.trim() !== "") ||
    (prescription.restrictions && prescription.restrictions.trim() !== "")
  );
}

function getPersianTranslation(text: string): string {
  const translations: Record<string, string> = {
    "Specialty Clinic": "کلینیک تخصصی",
    "Imam Reza Hospital": "شفاخانه امام رضا",
    "Noor Medical Center": "مرکز طبی نور",
    "Children's Hospital": "شفاخانه کودکان",
    "Dr. Ahmad Farid": "داکتر احمد فرید",
    "Dr. Maryam Hosseini": "داکتر مریم حسینی",
    "Dr. Ali Rezaei": "داکتر علی رضایی",
    "Dr. Sara Mohammadi": "داکتر سارا محمدی",
  };
  return translations[text] || text;
}

// Export with the expected name for backward compatibility
export const downloadPrescriptionPDF = generatePrescriptionPDF;

// ==================== USAGE EXAMPLES ====================

/*
Example 1: Basic usage with default config
generatePrescriptionPDF(prescriptionData);

Example 2: Customize colors and layout
generatePrescriptionPDF(prescriptionData, {
  colors: {
    primary: [220, 38, 38], // Red primary color
    accent: [16, 185, 129], // Green accent
  },
  typography: {
    defaultFont: "times",
    fontSizes: {
      title: 18,
      body: 11,
    }
  }
});

Example 3: Single column layout
generatePrescriptionPDF(prescriptionData, {
  layout: {
    twoColumn: false,
  },
  clinicalHistory: {
    show: false,
  }
});

Example 4: Minimalist design
generatePrescriptionPDF(prescriptionData, {
  colors: {
    primary: [0, 0, 0],
    accent: [0, 0, 0],
    bgLight: [255, 255, 255],
  },
  logo: {
    enabled: false,
  },
  patientInfo: {
    boxStyle: "flat",
  }
});

Example 5: Persian-only layout
generatePrescriptionPDF(prescriptionData, {
  language: {
    primary: "fa",
    titles: {
      patientInfo: { en: "", fa: "اطلاعات بیمار" },
      medications: { en: "", fa: "داروهای تجویزی" },
    }
  }
});
*/
