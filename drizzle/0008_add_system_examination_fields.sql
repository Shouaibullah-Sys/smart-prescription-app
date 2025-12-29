-- Migration: Add System Examination Fields
-- Created: 2025-12-28
-- Description: Add comprehensive system examination fields to prescriptions table

-- Add system examination fields to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN cns_examination text,
ADD COLUMN cardiovascular_examination text,
ADD COLUMN respiratory_examination text,
ADD COLUMN gastrointestinal_examination text,
ADD COLUMN musculoskeletal_examination text,
ADD COLUMN genitourinary_examination text,
ADD COLUMN dermatological_examination text,
ADD COLUMN ent_examination text,
ADD COLUMN ophthalmological_examination text,
ADD COLUMN bmi text;

-- Create index for better query performance on examination fields
CREATE INDEX idx_prescriptions_cns_examination ON prescriptions(cns_examination);
CREATE INDEX idx_prescriptions_cardiovascular_examination ON prescriptions(cardiovascular_examination);
CREATE INDEX idx_prescriptions_respiratory_examination ON prescriptions(respiratory_examination);
CREATE INDEX idx_prescriptions_gastrointestinal_examination ON prescriptions(gastrointestinal_examination);

-- Add comment for documentation
COMMENT ON COLUMN prescriptions.cns_examination IS 'Central Nervous System and Neurological examination findings';
COMMENT ON COLUMN prescriptions.cardiovascular_examination IS 'Cardiovascular system examination findings';
COMMENT ON COLUMN prescriptions.respiratory_examination IS 'Respiratory system examination findings';
COMMENT ON COLUMN prescriptions.gastrointestinal_examination IS 'Gastrointestinal system examination findings';
COMMENT ON COLUMN prescriptions.musculoskeletal_examination IS 'Musculoskeletal system examination findings';
COMMENT ON COLUMN prescriptions.genitourinary_examination IS 'Genitourinary system examination findings';
COMMENT ON COLUMN prescriptions.dermatological_examination IS 'Dermatological examination findings';
COMMENT ON COLUMN prescriptions.ent_examination IS 'Ear, Nose, and Throat examination findings';
COMMENT ON COLUMN prescriptions.ophthalmological_examination IS 'Ophthalmological examination findings';
COMMENT ON COLUMN prescriptions.bmi IS 'Body Mass Index calculated from weight and height';