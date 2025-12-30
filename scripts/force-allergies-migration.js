// scripts/force-allergies-migration.js
const { createClient } = require("@neondatabase/serverless");
require("dotenv").config();

async function forceAllergiesMigration() {
  const neon = createClient(process.env.DATABASE_URL);

  try {
    console.log("🔄 Starting forced allergies/currentMedications migration...");

    // Connect to the database
    await neon.connect();
    console.log("✅ Connected to database");

    // Check current column types
    const columnCheck = await neon.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name IN ('allergies', 'current_medications')
      ORDER BY column_name
    `);

    console.log("Current column types:");
    console.log(columnCheck.rows);

    // Check if we need to migrate
    const needsMigration = columnCheck.rows.some(
      (row) => row.data_type === "jsonb"
    );

    if (!needsMigration) {
      console.log("✅ Columns are already TEXT type, no migration needed");
      return;
    }

    console.log("🔄 Converting columns from JSONB to TEXT...");

    // First, ensure all values are valid by converting them to text
    await neon.execute(`
      UPDATE prescriptions 
      SET 
        allergies = CASE 
          WHEN allergies IS NULL THEN ''
          WHEN allergies = 'null' THEN ''
          WHEN allergies::text ~ '^\[.*\]$' THEN COALESCE(allergies::text, '')
          WHEN allergies::text ~ '^\\{.*\\}$' THEN COALESCE(allergies::text, '{}')
          ELSE COALESCE(allergies::text, allergies::text)
        END,
        current_medications = CASE 
          WHEN current_medications IS NULL THEN ''
          WHEN current_medications = 'null' THEN ''
          WHEN current_medications::text ~ '^\[.*\]$' THEN COALESCE(current_medications::text, '')
          WHEN current_medications::text ~ '^\\{.*\\}$' THEN COALESCE(current_medications::text, '{}')
          ELSE COALESCE(current_medications::text, current_medications::text)
        END
      WHERE allergies IS NOT NULL OR current_medications IS NOT NULL
    `);

    console.log("✅ Data cleaned");

    // Now alter the column types
    await neon.execute(`
      ALTER TABLE prescriptions 
      ALTER COLUMN allergies TYPE text USING allergies::text
    `);

    await neon.execute(`
      ALTER TABLE prescriptions 
      ALTER COLUMN current_medications TYPE text USING current_medications::text
    `);

    console.log("✅ Column types converted to TEXT");

    // Verify the migration
    const finalCheck = await neon.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name IN ('allergies', 'current_medications')
      ORDER BY column_name
    `);

    console.log("Final column types:");
    console.log(finalCheck.rows);

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await neon.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the migration
forceAllergiesMigration()
  .then(() => {
    console.log("Migration script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
