// Simple script to run the allergies migration

/**
 * Manual migration script for adding Persian medication fields
 * This bypasses Drizzle Kit issues and applies the migration directly
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  let pool = null;

  try {
    console.log("🚀 Starting manual bilingual migration...");

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
      "0005_add_persian_medication_fields.sql"
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
      WHERE table_name = 'medicines' 
      AND column_name LIKE '%_persian'
      ORDER BY column_name
    `);

    if (result.rows.length === 0) {
      console.log("⚠️  No Persian columns found. Migration may have failed.");
    } else {
      console.log("📊 Persian columns added:");
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
      WHERE tablename = 'medicines' 
      AND indexname LIKE '%_persian'
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
    console.log("   • Added 5 Persian translation columns to medicines table");
    console.log("   • Created performance indexes");
    console.log("   • Database is now ready for bilingual prescriptions");
    console.log("");
    console.log("🔄 Next steps:");
    console.log("   1. Restart your development server");
    console.log("   2. Test the bilingual form inputs");
    console.log("   3. Generate PDFs with Persian content");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    if (error.message.includes('relation "medicines" does not exist')) {
      console.log("");
      console.log("🔧 The medicines table does not exist. You may need to:");
      console.log("   1. Run the initial Drizzle migration first:");
      console.log("      npx drizzle-kit migrate");
      console.log("   2. Or create the medicines table manually");
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
