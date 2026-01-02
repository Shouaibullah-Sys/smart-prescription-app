-- Migration: Add comprehensive body metrics fields
-- Generated on: 2026-01-02

-- Add new body metrics columns to prescriptions table
ALTER TABLE prescriptions 
ADD COLUMN waist_circumference TEXT,
ADD COLUMN hip_circumference TEXT,
ADD COLUMN body_fat_percentage TEXT,
ADD COLUMN lean_body_mass TEXT,
ADD COLUMN ideal_body_weight TEXT,
ADD COLUMN adjusted_body_weight TEXT,
ADD COLUMN basal_metabolic_rate TEXT,
ADD COLUMN total_daily_energy_expenditure TEXT,
ADD COLUMN body_surface_area TEXT,
ADD COLUMN waist_to_height_ratio TEXT,
ADD COLUMN water_requirement TEXT;

-- Add comments for documentation
COMMENT ON COLUMN prescriptions.waist_circumference IS 'Waist circumference in cm';
COMMENT ON COLUMN prescriptions.hip_circumference IS 'Hip circumference in cm';
COMMENT ON COLUMN prescriptions.body_fat_percentage IS 'Body fat percentage (%)';
COMMENT ON COLUMN prescriptions.lean_body_mass IS 'Lean body mass in kg';
COMMENT ON COLUMN prescriptions.ideal_body_weight IS 'Ideal body weight in kg (average of multiple formulas)';
COMMENT ON COLUMN prescriptions.adjusted_body_weight IS 'Adjusted body weight in kg for obese patients';
COMMENT ON COLUMN prescriptions.basal_metabolic_rate IS 'Basal metabolic rate in kcal/day (average of multiple equations)';
COMMENT ON COLUMN prescriptions.total_daily_energy_expenditure IS 'TDEE in kcal/day based on activity level';
COMMENT ON COLUMN prescriptions.body_surface_area IS 'Body surface area in m² (average of multiple formulas)';
COMMENT ON COLUMN prescriptions.waist_to_height_ratio IS 'Waist to height ratio';
COMMENT ON COLUMN prescriptions.water_requirement IS 'Daily water requirement in ml';