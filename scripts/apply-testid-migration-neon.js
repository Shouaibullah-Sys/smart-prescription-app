#!/usr/bin/env node

/**
 * Direct migration script using Neon serverless client
 * This makes the test_id column nullable in prescription_tests table
 */

const { neon } = require("@neondatabase/serverless");
const fs = require("fs");
const path = require("path");

async function runTestIdMigration() {
  try {
    console.log("🚀 Starting test_id nullable migration...");

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

    // Create Neon connection
    const sql = neon(envVars.DATABASE_URL);

    console.log("📡 Connecting to Neon database...");

    // Make test_id column nullable
    console.log(
      "🔧 Making test_id column nullable in prescription_tests table..."
    );

    await sql`
      ALTER TABLE prescription_tests 
      ALTER COLUMN test_id DROP NOT NULL;
    `;

    console.log("✅ Migration applied successfully!");

    // Verify the change
    console.log("🔍 Verifying changes...");
    const result = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescription_tests' 
      AND column_name = 'test_id'
    `;

    if (result.length === 0) {
      console.log("⚠️  test_id column not found. Migration may have failed.");
    } else {
      const column = result[0];
      console.log(`📊 test_id column status:`);
      console.log(`   • Column: ${column.column_name}`);
      console.log(`   • Type: ${column.data_type}`);
      console.log(`   • Nullable: ${column.is_nullable}`);

      if (column.is_nullable === "YES") {
        console.log("✅ test_id column is now nullable!");
      } else {
        console.log("❌ test_id column is still NOT NULL");
      }
    }

    console.log("");
    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(
      "   • Made test_id column nullable in prescription_tests table"
    );
    console.log(
      "   • Prescription tests can now be created without linking to test records"
    );
    console.log("   • Database constraint violation should be resolved");
    console.log("");
    console.log("🔄 Next steps:");
    console.log("   1. Test prescription creation with medical exams");
    console.log("   2. The constraint violation error should no longer occur");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (
      error.message.includes('relation "prescription_tests" does not exist')
    ) {
      console.log("");
      console.log(
        "🔧 The prescription_tests table does not exist. You may need to:"
      );
      console.log("   1. Run the initial Drizzle migration first:");
      console.log("      npx drizzle-kit migrate");
      console.log("   2. Or create the prescription_tests table manually");
    }
    process.exit(1);
  }
}

// Run the migration
runTestIdMigration();
