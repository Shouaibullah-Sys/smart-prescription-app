-- Convert allergies and currentMedications from jsonb to text
ALTER TABLE prescriptions 
ALTER COLUMN allergies TYPE text,
ALTER COLUMN current_medications TYPE text;