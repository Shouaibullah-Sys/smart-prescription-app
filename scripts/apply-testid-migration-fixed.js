// scripts/apply-testid-migration-fixed.js
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function applyTestIdMigration() {
  let pool = null;

  try {
    console.log("🚀 Starting test_id optional migration...");

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

    // Create connection pool
    pool = new Pool({
      connectionString: envVars.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    console.log("📡 Connecting to database...");
    const client = await pool.connect();

    console.log(
      "🔧 Making test_id column optional in prescription_tests table..."
    );

    // Execute the migration to make test_id optional
    await client.query(`
      ALTER TABLE prescription_tests 
      ALTER COLUMN test_id DROP NOT NULL;
    `);

    console.log("✅ Migration applied successfully!");

    // Verify the change
    console.log("🔍 Verifying changes...");
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescription_tests' 
      AND column_name = 'test_id'
    `);

    if (result.rows.length > 0) {
      const column = result.rows[0];
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

    client.release();

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
    console.log("   1. Restart your development server");
    console.log("   2. Test prescription creation with medical exams");
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
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the migration
applyTestIdMigration();
