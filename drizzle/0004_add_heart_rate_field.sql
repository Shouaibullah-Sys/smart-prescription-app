-- Migration: Add heartRate field to prescriptions table
-- This allows separate tracking of Heart Rate (HR) distinct from Pulse Rate (PR)

ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS heart_rate text;