// types/prescription.ts
export interface FormMedicine {
  id: string;
  medicine: string;
  dosage: string;
  form?: string;
  frequency: string;
  duration: string;
  route?: string;
  timing?: string;
  withFood?: boolean;
  instructions?: string;
  notes?: string;
  prescriptionId: string;
  createdAt?: string;
  updatedAt?: string;
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
  chiefComplaint?: string | null;
  pulseRate?: string | null;
  bloodPressure?: string | null;
  temperature?: string | null;
  respiratoryRate?: string | null;
  oxygenSaturation?: string | null;
  weight?: string | null; // Added for enhanced form
  height?: string | null; // Added for enhanced form
  bmi?: string | null; // Added for enhanced form
  allergies?: string[] | null; // Made consistent with database schema (jsonb type)
  currentMedications?: string[] | null; // Made consistent with database schema (jsonb type)
  pastMedicalHistory?: string | null;
  familyHistory?: string | null;
  socialHistory?: string | null;
  physicalExam?: string | null; // Added for enhanced form
  medicalExams?: string[] | null; // Added for enhanced form
  examNotes?: string | null; // Added for enhanced form
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
