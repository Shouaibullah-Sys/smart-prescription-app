// scripts/verify-migration.js
const { createClient } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function verifyMigration() {
  // Read environment variables
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

    // Check if the body metrics columns exist
    const checkQuery = `
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
    `;

    const result = await neon.execute(checkQuery);

    console.log("🔍 Body metrics columns check:");
    if (result.rows.length === 0) {
      console.log(
        "❌ No body metrics columns found - migration may have failed"
      );
    } else {
      console.log("✅ Found body metrics columns:");
      result.rows.forEach((row) => {
        console.log(
          `  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`
        );
      });
    }

    const expectedColumns = [
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

    const existingColumns = result.rows.map((row) => row.column_name);
    const missingColumns = expectedColumns.filter(
      (col) => !existingColumns.includes(col)
    );

    if (missingColumns.length === 0) {
      console.log("\n🎉 Migration verification successful!");
      console.log(
        "✅ All expected body metrics columns are present in the database"
      );
      console.log(
        "✅ The application should now be able to fetch prescriptions without errors"
      );
    } else {
      console.log(
        `\n❌ Migration verification failed! Missing columns: ${missingColumns.join(
          ", "
        )}`
      );
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    process.exit(1);
  } finally {
    await neon.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the verification
verifyMigration()
  .then(() => {
    console.log("Verification completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
