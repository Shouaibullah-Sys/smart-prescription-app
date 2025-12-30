#!/usr/bin/env node

/**
 * Migration script to convert allergies and currentMedications from jsonb to text
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  let pool = null;

  try {
    console.log("🚀 Starting allergies/currentMedications text conversion...");

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
      "🔧 Converting allergies and currentMedications columns to text..."
    );

    // Convert allergies column
    await client.query(`
      ALTER TABLE prescriptions 
      ALTER COLUMN allergies TYPE text;
    `);
    console.log("✅ allergies column converted to text");

    // Convert currentMedications column
    await client.query(`
      ALTER TABLE prescriptions 
      ALTER COLUMN current_medications TYPE text;
    `);
    console.log("✅ current_medications column converted to text");

    // Verify the changes
    console.log("🔍 Verifying changes...");
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name IN ('allergies', 'current_medications')
      ORDER BY column_name
    `);

    console.log("📊 Column types after conversion:");
    result.rows.forEach((row) => {
      console.log(
        `   • ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`
      );
    });

    client.release();

    console.log("");
    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log("   • Converted allergies from jsonb to text");
    console.log("   • Converted current_medications from jsonb to text");
    console.log("   • Database schema now matches the application code");
    console.log("");
    console.log("🔄 Next steps:");
    console.log("   1. Restart your development server");
    console.log(
      "   2. Test the prescription form - allergies should now save properly"
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
      console.log("   2. Or create the prescriptions table manually");
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Run the migration
runMigration();
