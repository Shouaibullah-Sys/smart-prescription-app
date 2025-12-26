-- Migration: Remove diagnosis field from prescriptions table
-- This migration removes the diagnosis field that was removed from the application

ALTER TABLE prescriptions 
DROP COLUMN IF EXISTS diagnosis;