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
  userId?: string; // Made optional since some components create prescriptions without userId
  title?: string;
  patientName: string;
  patientAge?: string | null;
  patientGender?: string | null;
  patientPhone?: string | null;
  patientAddress?: string | null;
  diagnosis: string;
  medicines: FormMedicine[];
  chiefComplaint?: string | null; // Made consistent with database schema
  historyOfPresentIllness?: string;
  physicalExamination?: string;
  differentialDiagnosis?: string;
  pulseRate?: string;
  bloodPressure?: string;
  temperature?: string | null;
  respiratoryRate?: string;
  oxygenSaturation?: string;
  allergies: string[]; // Made consistent with database schema (jsonb type)
  currentMedications: string[]; // Made consistent with database schema (jsonb type)
  pastMedicalHistory?: string;
  familyHistory?: string;
  socialHistory?: string;
  instructions?: string;
  followUp?: string;
  restrictions?: string;
  doctorName?: string;
  doctorLicenseNumber?: string;
  clinicName?: string;
  clinicAddress?: string;
  doctorFree?: string; // Doctor free amount/charge
  prescriptionDate: string | Date; // Made consistent with database schema
  prescriptionNumber?: string;
  source?: string;
  status?: string;
  createdAt?: string; // Made optional since some components create prescriptions without createdAt
  updatedAt?: string; // Made optional since some components create prescriptions without updatedAt
  aiConfidence?: string;
  aiModelUsed?: string;
  processingTime?: number;
  rawAiResponse?: unknown;
}

export interface AutocompleteResponse {
  suggestions: string[];
}

export interface AIAnalysis {
  diagnosis: string;
  confidence: string;
  medications: FormMedicine[];
  clinicalNotes: string;
  differentialDiagnosis: string;
  recommendations: string[];
  warnings: string[];
  aiModelUsed?: string;
}
