// db/schema.ts
import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk user ID

  // Patient Information
  patientName: text("patient_name").notNull(),
  patientAge: text("patient_age"),
  patientGender: text("patient_gender"),
  patientPhone: text("patient_phone"),
  patientAddress: text("patient_address"),

  // Medical Information
  chiefComplaint: text("chief_complaint"),

  // Vital Signs
  pulseRate: text("pulse_rate"),
  heartRate: text("heart_rate"),
  bloodPressure: text("blood_pressure"),
  temperature: text("temperature"),
  respiratoryRate: text("respiratory_rate"),
  oxygenSaturation: text("oxygen_saturation"),

  // Anthropometry
  weight: text("weight"),
  height: text("height"),

  // Medical History
  allergies: jsonb("allergies").$type<string[]>(),
  currentMedications: jsonb("current_medications").$type<string[]>(),
  pastMedicalHistory: text("past_medical_history"),
  familyHistory: text("family_history"),
  socialHistory: text("social_history"),

  // Physical Examination
  physicalExam: text("physical_exam"),
  medicalExams: jsonb("medical_exams").$type<string[]>(),
  examNotes: text("exam_notes"),

  // System Examinations (Comprehensive)
  cnsExamination: text("cns_examination"),
  cardiovascularExamination: text("cardiovascular_examination"),
  respiratoryExamination: text("respiratory_examination"),
  gastrointestinalExamination: text("gastrointestinal_examination"),
  musculoskeletalExamination: text("musculoskeletal_examination"),
  genitourinaryExamination: text("genitourinary_examination"),
  dermatologicalExamination: text("dermatological_examination"),
  entExamination: text("ent_examination"),
  ophthalmologicalExamination: text("ophthalmological_examination"),

  // Additional Measurements
  bmi: text("bmi"),

  // Treatment Information
  instructions: text("instructions"),
  followUp: text("follow_up"),
  restrictions: text("restrictions"),

  // Doctor Information
  doctorName: text("doctor_name").notNull(),
  doctorLicenseNumber: text("doctor_license_number"),
  clinicName: text("clinic_name"),
  clinicAddress: text("clinic_address"),
  doctorFree: text("doctor_free"),

  // Prescription Details
  prescriptionDate: timestamp("prescription_date", {
    withTimezone: true,
  }).defaultNow(),
  prescriptionNumber: text("prescription_number"),
  source: text("source"),
  status: varchar("status", { length: 20 }).default("active"),

  // AI Information
  aiConfidence: text("ai_confidence"),
  aiModelUsed: text("ai_model_used"),
  processingTime: integer("processing_time"),
  rawAiResponse: jsonb("raw_ai_response"),

  // System Fields
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Medicines table
export const medicines = pgTable("medicines", {
  id: text("id").primaryKey(),
  prescriptionId: text("prescription_id").notNull(),

  // Medicine Information
  medicine: text("medicine").notNull(),
  dosage: text("dosage").notNull(),
  dosagePersian: text("dosage_persian"),
  form: text("form"),
  formPersian: text("form_persian"),
  frequency: text("frequency"),
  frequencyPersian: text("frequency_persian"),
  duration: text("duration"),
  durationPersian: text("duration_persian"),
  route: text("route"),
  timing: text("timing"),
  withFood: boolean("with_food").default(false),

  // Additional Information
  instructions: text("instructions"),
  instructionsPersian: text("instructions_persian"),
  notes: text("notes"),

  // System Fields
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Tests table for medical tests and procedures
export const tests = pgTable("tests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: jsonb("category").$type<string[]>(),
  type: text("type").notNull(), // "Laboratory" | "Imaging" | "Special Test" | "Procedure"
  preparation: jsonb("preparation").$type<string[]>(),
  fastingRequired: boolean("fasting_required").default(false),
  description: text("description"),
  normalRange: text("normal_range"),
  popularScore: integer("popular_score").default(0),
  insuranceCoverage: boolean("insurance_coverage").default(true),
  costEstimate: integer("cost_estimate"),
  turnaroundTime: text("turnaround_time"),
  sampleType: text("sample_type"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Prescription Tests junction table for many-to-many relationship
export const prescriptionTests = pgTable("prescription_tests", {
  id: text("id").primaryKey(),
  prescriptionId: text("prescription_id").notNull(),
  testId: text("test_id"), // Optional - for when linking to actual test records
  testName: text("test_name").notNull(), // Denormalized for performance
  notes: text("notes"),
  priority: text("priority").default("routine"), // "routine" | "urgent" | "stat"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Define relationships
export const prescriptionsRelations = relations(prescriptions, ({ many }) => ({
  medicines: many(medicines),
  prescriptionTests: many(prescriptionTests),
}));

export const medicinesRelations = relations(medicines, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [medicines.prescriptionId],
    references: [prescriptions.id],
  }),
}));

export const testsRelations = relations(tests, ({ many }) => ({
  prescriptionTests: many(prescriptionTests),
}));

export const prescriptionTestsRelations = relations(
  prescriptionTests,
  ({ one }) => ({
    prescription: one(prescriptions, {
      fields: [prescriptionTests.prescriptionId],
      references: [prescriptions.id],
    }),
    test: one(tests, {
      fields: [prescriptionTests.testId],
      references: [tests.id],
    }),
  })
);

// Export types for easy importing
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;
export type Test = typeof tests.$inferSelect;
export type NewTest = typeof tests.$inferInsert;
export type PrescriptionTest = typeof prescriptionTests.$inferSelect;
export type NewPrescriptionTest = typeof prescriptionTests.$inferInsert;
