// types/prescription.ts
export interface FormMedicine {
  id: string;
  medicine: string;
  dosage: string;
  dosagePersian?: string; // Persian translation of dosage
  form?: string;
  formPersian?: string; // Persian translation of form
  frequency: string;
  frequencyPersian?: string; // Persian translation of frequency
  duration: string;
  durationPersian?: string; // Persian translation of duration
  route?: string;
  timing?: string;
  withFood?: boolean;
  instructions?: string;
  instructionsPersian?: string; // Persian translation of instructions
  notes?: string;
  prescriptionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PrescriptionTest {
  id: string;
  prescriptionId: string;
  testId?: string | null; // Optional - can be null when not linking to actual test records
  testName: string;
  notes?: string | null;
  priority?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Prescription {
  id: string;
  userId: string; // Required in database
  title?: string | null;
  patientName: string;
  patientAge?: string | null;
  patientGender?: string | null;
  patientPhone?: string | null;
  patientAddress?: string | null;
  medicines: FormMedicine[]; // Required array, populated from database
  prescriptionTests?: PrescriptionTest[]; // Optional array of prescription tests
  chiefComplaint?: string | null;
  pulseRate?: string | null;
  heartRate?: string | null;
  bloodPressure?: string | null;
  temperature?: string | null;
  respiratoryRate?: string | null;
  oxygenSaturation?: string | null;
  weight?: string | null; // Added for enhanced form
  height?: string | null; // Added for enhanced form
  allergies?: string | null; // Simple text field for allergies
  currentMedications?: string | null; // Simple text field for current medications
  pastMedicalHistory?: string | null;
  familyHistory?: string | null;
  socialHistory?: string | null;
  physicalExam?: string | null; // Added for enhanced form
  medicalExams?: string[] | null; // Added for enhanced form
  examNotes?: string | null; // Added for enhanced form

  // System Examinations (Comprehensive)
  cnsExamination?: string | null;
  cardiovascularExamination?: string | null;
  respiratoryExamination?: string | null;
  gastrointestinalExamination?: string | null;
  musculoskeletalExamination?: string | null;
  genitourinaryExamination?: string | null;
  dermatologicalExamination?: string | null;
  entExamination?: string | null;
  ophthalmologicalExamination?: string | null;

  // Additional Measurements
  bmi?: string | null;
  instructions?: string | null;
  followUp?: string | null;
  restrictions?: string | null;
  doctorName: string; // Required in database
  doctorLicenseNumber?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
  doctorFree?: string | null; // Doctor free amount/charge
  prescriptionDate: Date; // Made consistent with database schema (timestamp type)
  prescriptionNumber?: string | null;
  source?: string | null;
  status?: string | null;
  createdAt: Date; // Made consistent with database schema (timestamp type)
  updatedAt: Date; // Made consistent with database schema (timestamp type)
  aiConfidence?: string | null;
  aiModelUsed?: string | null;
  processingTime?: number | null;
  rawAiResponse?: unknown | null;
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export interface AIAnalysis {
  confidence: string;
  medications: FormMedicine[];
  clinicalNotes: string;
  differentialDiagnosis: string;
  recommendations: string[];
  warnings: string[];
  aiModelUsed?: string;
}
