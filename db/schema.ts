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
  bloodPressure: text("blood_pressure"),
  temperature: text("temperature"),
  respiratoryRate: text("respiratory_rate"),
  oxygenSaturation: text("oxygen_saturation"),

  // Medical History
  allergies: jsonb("allergies").$type<string[]>(),
  currentMedications: jsonb("current_medications").$type<string[]>(),
  pastMedicalHistory: text("past_medical_history"),
  familyHistory: text("family_history"),
  socialHistory: text("social_history"),

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
  form: text("form"),
  frequency: text("frequency"),
  duration: text("duration"),
  route: text("route"),
  timing: text("timing"),
  withFood: boolean("with_food").default(false),

  // Additional Information
  instructions: text("instructions"),
  notes: text("notes"),

  // System Fields
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Define relationships
export const prescriptionsRelations = relations(prescriptions, ({ many }) => ({
  medicines: many(medicines),
}));

export const medicinesRelations = relations(medicines, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [medicines.prescriptionId],
    references: [prescriptions.id],
  }),
}));

// Export types for easy importing
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;
