#!/usr/bin/env node

/**
 * System Examinations Migration Script
 * Uses direct Neon serverless client connection
 */

const { neon } = require("@neondatabase/serverless");

async function runSystemExaminationsMigration() {
  try {
    console.log("🚀 Starting System Examinations Migration...");

    // Read environment variables
    const fs = require("fs");
    const path = require("path");

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

    // Create direct SQL connection for DDL operations
    const sql = neon(envVars.DATABASE_URL);

    console.log("📡 Connecting to NoeN database...");

    // Execute the ALTER TABLE statement directly
    console.log("🔧 Adding system examination columns...");

    const alterSQL = `
      ALTER TABLE prescriptions 
      ADD COLUMN IF NOT EXISTS cns_examination text,
      ADD COLUMN IF NOT EXISTS cardiovascular_examination text,
      ADD COLUMN IF NOT EXISTS respiratory_examination text,
      ADD COLUMN IF NOT EXISTS gastrointestinal_examination text,
      ADD COLUMN IF NOT EXISTS musculoskeletal_examination text,
      ADD COLUMN IF NOT EXISTS genitourinary_examination text,
      ADD COLUMN IF NOT EXISTS dermatological_examination text,
      ADD COLUMN IF NOT EXISTS ent_examination text,
      ADD COLUMN IF NOT EXISTS ophthalmological_examination text,
      ADD COLUMN IF NOT EXISTS bmi text;
    `;

    // Execute raw SQL query
    await sql.query(alterSQL);
    console.log("✅ Columns added successfully!");

    // Create indexes
    console.log("📈 Creating performance indexes...");

    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_prescriptions_cns_examination ON prescriptions(cns_examination)",
      "CREATE INDEX IF NOT EXISTS idx_prescriptions_cardiovascular_examination ON prescriptions(cardiovascular_examination)",
      "CREATE INDEX IF NOT EXISTS idx_prescriptions_respiratory_examination ON prescriptions(respiratory_examination)",
      "CREATE INDEX IF NOT EXISTS idx_prescriptions_gastrointestinal_examination ON prescriptions(gastrointestinal_examination)",
    ];

    for (const indexSQL of indexes) {
      await sql.query(indexSQL);
    }
    console.log("✅ Indexes created successfully!");

    // Verify the changes
    console.log("🔍 Verifying changes...");
    const verifySQL = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND (column_name LIKE '%_examination' OR column_name = 'bmi')
      ORDER BY column_name
    `;

    const result = await sql.query(verifySQL);

    if (!result || !result.rows || result.rows.length === 0) {
      console.log(
        "⚠️  No examination columns found. Migration may have failed."
      );
    } else {
      console.log("📊 System examination columns verified:");
      result.rows.forEach((row) => {
        console.log(
          `   • ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`
        );
      });
    }

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
  }
}

// Run the migration
runSystemExaminationsMigration();
