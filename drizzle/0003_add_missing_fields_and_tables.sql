-- Migration: Add missing fields and tables for enhanced prescription form
-- Add anthropometry fields to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS weight text,
ADD COLUMN IF NOT EXISTS height text,
ADD COLUMN IF NOT EXISTS bmi text;

-- Add physical examination fields to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS physical_exam text,
ADD COLUMN IF NOT EXISTS medical_exams jsonb,
ADD COLUMN IF NOT EXISTS exam_notes text;

-- Create tests table for medical tests and procedures
CREATE TABLE IF NOT EXISTS tests (
  id text PRIMARY KEY,
  name text NOT NULL,
  category jsonb,
  type text NOT NULL,
  preparation jsonb,
  fasting_required boolean DEFAULT false,
  description text,
  normal_range text,
  popular_score integer DEFAULT 0,
  insurance_coverage boolean DEFAULT true,
  cost_estimate integer,
  turnaround_time text,
  sample_type text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create prescription_tests junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS prescription_tests (
  id text PRIMARY KEY,
  prescription_id text NOT NULL,
  test_id text NOT NULL,
  test_name text NOT NULL,
  notes text,
  priority text DEFAULT 'routine',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add foreign key constraints
-- These will fail silently if they already exist
ALTER TABLE prescription_tests 
ADD CONSTRAINT fk_prescription_tests_prescription 
FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE;

ALTER TABLE prescription_tests 
ADD CONSTRAINT fk_prescription_tests_test 
FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;