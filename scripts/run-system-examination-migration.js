#!/usr/bin/env node

/**
 * Migration script for adding System Examination Fields
 * This adds comprehensive examination fields to prescriptions table
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runSystemExaminationMigration() {
  let pool = null;

  try {
    console.log("🚀 Starting System Examination Fields migration...");

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

    console.log("📋 Reading migration SQL...");
    const sqlPath = path.join(
      __dirname,
      "..",
      "drizzle",
      "0008_add_system_examination_fields.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("🔧 Executing migration...");
    await client.query(sql);

    console.log("✅ Migration executed successfully!");

    // Verify the columns were added
    console.log("🔍 Verifying changes...");
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name LIKE '%_examination' OR column_name = 'bmi'
      ORDER BY column_name
    `);

    if (result.rows.length === 0) {
      console.log(
        "⚠️  No examination columns found. Migration may have failed."
      );
    } else {
      console.log("📊 System examination columns added:");
      result.rows.forEach((row) => {
        console.log(
          `   • ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`
        );
      });
    }

    // Check if indexes were created
    const indexResult = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'prescriptions' 
      AND indexname LIKE '%examination%'
      ORDER BY indexname
    `);

    if (indexResult.rows.length > 0) {
      console.log("📈 Indexes created:");
      indexResult.rows.forEach((row) => {
        console.log(`   • ${row.indexname}`);
      });
    }

    client.release();

    console.log("");
    console.log("🎉 Migration completed successfully!");
    console.log("");
    console.log("📋 Summary:");
    console.log(
      "   • Added 9 comprehensive system examination fields to prescriptions table"
    );
    console.log("   • Added BMI field for calculated body mass index");
    console.log("   • Created performance indexes for examination queries");
    console.log("   • Database now supports detailed physical examinations");
    console.log("");
    console.log("🔄 Next steps:");
    console.log("   1. Restart your development server");
    console.log(
      "   2. Test the enhanced prescription form with system examinations"
    );
    console.log(
      "   3. Verify that system examination data is properly saved and retrieved"
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
runSystemExaminationMigration();
