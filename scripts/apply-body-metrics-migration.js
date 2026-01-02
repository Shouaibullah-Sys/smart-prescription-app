// scripts/apply-body-metrics-migration.js
const { createClient } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function applyBodyMetricsMigration() {
  // Read environment variables like the working migration scripts
  const envPath = path.join(__dirname, "..", ".env.local");
  const envContent = fs.readFileSync(envPath, "utf8");
  const envVars = {};

  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join("=").replace(/['"]/g, "");
      }
    }
  });

  if (!envVars.DATABASE_URL) {
    throw new Error("DATABASE_URL not found in .env.local");
  }

  const neon = createClient(envVars.DATABASE_URL);

  try {
    // Connect to the database
    await neon.connect();
    console.log("✅ Connected to database");
    console.log("🔄 Starting comprehensive body metrics migration...");

    // Check if the migration is already applied
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name = 'waist_circumference'
    `;

    const result = await neon.execute(checkQuery);

    if (result.rows.length > 0) {
      console.log(
        "✅ waist_circumference column already exists, checking other columns..."
      );

      // Check for other body metrics columns
      const checkAllColumns = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'prescriptions' 
        AND column_name IN (
          'waist_circumference', 'hip_circumference', 'body_fat_percentage', 
          'lean_body_mass', 'ideal_body_weight', 'adjusted_body_weight',
          'basal_metabolic_rate', 'total_daily_energy_expenditure', 
          'body_surface_area', 'waist_to_height_ratio', 'water_requirement'
        )
      `;

      const allColumnsResult = await neon.execute(checkAllColumns);
      const existingColumns = allColumnsResult.rows.map(
        (row) => row.column_name
      );

      const allRequiredColumns = [
        "waist_circumference",
        "hip_circumference",
        "body_fat_percentage",
        "lean_body_mass",
        "ideal_body_weight",
        "adjusted_body_weight",
        "basal_metabolic_rate",
        "total_daily_energy_expenditure",
        "body_surface_area",
        "waist_to_height_ratio",
        "water_requirement",
      ];

      const missingColumns = allRequiredColumns.filter(
        (col) => !existingColumns.includes(col)
      );

      if (missingColumns.length === 0) {
        console.log(
          "✅ All body metrics columns already exist, no migration needed"
        );
        return;
      } else {
        console.log(`⚠️  Found missing columns: ${missingColumns.join(", ")}`);
      }
    }

    console.log("📋 Applying body metrics migration...");

    // Apply the migration
    await neon.execute(`
      ALTER TABLE prescriptions 
      ADD COLUMN IF NOT EXISTS waist_circumference TEXT,
      ADD COLUMN IF NOT EXISTS hip_circumference TEXT,
      ADD COLUMN IF NOT EXISTS body_fat_percentage TEXT,
      ADD COLUMN IF NOT EXISTS lean_body_mass TEXT,
      ADD COLUMN IF NOT EXISTS ideal_body_weight TEXT,
      ADD COLUMN IF NOT EXISTS adjusted_body_weight TEXT,
      ADD COLUMN IF NOT EXISTS basal_metabolic_rate TEXT,
      ADD COLUMN IF NOT EXISTS total_daily_energy_expenditure TEXT,
      ADD COLUMN IF NOT EXISTS body_surface_area TEXT,
      ADD COLUMN IF NOT EXISTS waist_to_height_ratio TEXT,
      ADD COLUMN IF NOT EXISTS water_requirement TEXT;
    `);

    console.log("✅ Body metrics columns added successfully!");

    // Add comments for documentation
    await neon.execute(`
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
    `);

    console.log("✅ Column comments added successfully!");

    // Verify the migration
    const verification = await neon.execute(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name IN (
        'waist_circumference', 'hip_circumference', 'body_fat_percentage', 
        'lean_body_mass', 'ideal_body_weight', 'adjusted_body_weight',
        'basal_metabolic_rate', 'total_daily_energy_expenditure', 
        'body_surface_area', 'waist_to_height_ratio', 'water_requirement'
      )
      ORDER BY column_name
    `);

    console.log("🔍 Migration verification:");
    console.log("Columns added:");
    verification.rows.forEach((row) => {
      console.log(
        `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
      );
    });

    console.log("");
    console.log("🎉 Body metrics migration completed successfully!");
    console.log("");
    console.log(
      "✅ Your application should now be able to fetch prescriptions without errors."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error.message);

    if (error.message.includes('relation "prescriptions" does not exist')) {
      console.log("");
      console.log(
        "🔧 The prescriptions table does not exist. You may need to:"
      );
      console.log("   1. Run the initial Drizzle migration first:");
      console.log("      npx drizzle-kit migrate");
    }

    process.exit(1);
  } finally {
    await neon.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the migration
applyBodyMetricsMigration()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
