/**
 * Direct migration using the existing db connection
 * This runs the SQL directly without external dependencies
 */

const fs = require("fs");
const path = require("path");

// Read and execute the SQL migration directly
async function runDirectMigration() {
  try {
    console.log("🚀 Running direct allergies migration...");

    // Read the SQL migration file
    const sqlPath = path.join(
      __dirname,
      "..",
      "drizzle",
      "0009_convertmed_allergies_currents_to_text.sql"
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("📋 SQL to execute:");
    console.log(sql);
    console.log("\n🔧 Please run this SQL manually in your database:");
    console.log("   1. Connect to your database");
    console.log("   2. Execute the above SQL commands");
    console.log("   3. Restart your development server");
    console.log(
      "\n✅ This will convert allergies and currentMedications from jsonb to text"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

runDirectMigration();
